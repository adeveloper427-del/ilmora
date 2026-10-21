import { memo, ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { GestureResponderEvent, LayoutChangeEvent, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { Stroke } from '@/state/ProgressProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/typography';
import { scaleStrokes, strokeToPath } from './geometry';

type Props = {
  strokes: Stroke[];
  onChange: (strokes: Stroke[]) => void;
  color: string;
  width: number;
  /** Rendered beneath the ink (tracing guide). Must not capture touches. */
  guide?: ReactNode;
  /** Rendered above the ink (e.g. comparison reveal). */
  overlay?: ReactNode;
  onSize?: (w: number, h: number) => void;
  onStrokeEnd?: (durationMs: number) => void;
  style?: ViewStyle;
};

const MIN_STEP = 1.6;

/** Committed strokes live in their own memoised layer so only the live stroke re-renders while drawing. */
const InkLayer = memo(function InkLayer({ strokes }: { strokes: Stroke[] }) {
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
      {strokes.map((s, i) => (
        <Path key={i} d={strokeToPath(s.p)} stroke={s.c} strokeWidth={s.w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      ))}
    </Svg>
  );
});

export function WritingCanvas({ strokes, onChange, color, width, guide, overlay, onSize, onStrokeEnd, style }: Props) {
  const { c } = useTheme();
  const [live, setLive] = useState('');
  const points = useRef<number[]>([]);
  const origin = useRef({ x: 0, y: 0 });
  const startedAt = useRef(0);
  const frame = useRef<number | null>(null);
  const size = useRef({ w: 0, h: 0 });
  // Gesture handlers read the latest strokes without re-binding on every render.
  const strokesRef = useRef(strokes);
  useLayoutEffect(() => {
    strokesRef.current = strokes;
  }, [strokes]);

  useEffect(() => () => {
    if (frame.current != null) cancelAnimationFrame(frame.current);
  }, []);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width: w, height: h } = e.nativeEvent.layout;
      const prev = size.current;
      // Keep existing writing aligned with the guide if the canvas changes size (rotation, split screen).
      if (prev.w > 0 && prev.h > 0 && (Math.abs(prev.w - w) > 1 || Math.abs(prev.h - h) > 1) && strokesRef.current.length) {
        onChange(scaleStrokes(strokesRef.current, w / prev.w, h / prev.h));
      }
      size.current = { w, h };
      onSize?.(w, h);
    },
    [onChange, onSize],
  );

  const scheduleRender = () => {
    if (frame.current != null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      setLive(strokeToPath(points.current));
    });
  };

  const onGrant = (e: GestureResponderEvent) => {
    const { locationX, locationY, pageX, pageY } = e.nativeEvent;
    // Anchor to page coordinates: locationX can become relative to a child view mid-gesture on Android.
    origin.current = { x: pageX - locationX, y: pageY - locationY };
    points.current = [locationX, locationY];
    startedAt.current = Date.now();
    scheduleRender();
  };

  const onMove = (e: GestureResponderEvent) => {
    if (e.nativeEvent.touches && e.nativeEvent.touches.length > 1) return;
    const x = e.nativeEvent.pageX - origin.current.x;
    const y = e.nativeEvent.pageY - origin.current.y;
    const p = points.current;
    const lx = p[p.length - 2];
    const ly = p[p.length - 1];
    if (Math.hypot(x - lx, y - ly) < MIN_STEP) return;
    p.push(x, y);
    scheduleRender();
  };

  const onEnd = () => {
    if (frame.current != null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    const p = points.current;
    points.current = [];
    setLive('');
    if (p.length >= 2) {
      onChange([...strokesRef.current, { p, c: color, w: width }]);
      onStrokeEnd?.(Date.now() - startedAt.current);
    }
  };

  return (
    <View
      style={[styles.canvas, { backgroundColor: c.canvas, borderColor: c.border }, style]}
      onLayout={onLayout}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={onGrant}
      onResponderMove={onMove}
      onResponderRelease={onEnd}
      onResponderTerminate={onEnd}
      accessible
      accessibilityLabel="Writing canvas. Draw with your finger or a stylus."
    >
      {guide ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {guide}
        </View>
      ) : null}
      <InkLayer strokes={strokes} />
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
        {live ? <Path d={live} stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : null}
      </Svg>
      {overlay ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {overlay}
        </View>
      ) : null}
    </View>
  );
}

/** Read-only rendering of saved strokes, scaled into any box. */
export const StrokePreview = memo(function StrokePreview({ strokes, width, height, style }: { strokes: Stroke[]; width: number; height: number; style?: ViewStyle }) {
  return (
    <Svg viewBox={`0 0 ${Math.max(width, 1)} ${Math.max(height, 1)}`} preserveAspectRatio="xMidYMid meet" style={[{ width: '100%', height: '100%' }, style]}>
      {strokes.map((s, i) => (
        <Path key={i} d={strokeToPath(s.p)} stroke={s.c} strokeWidth={s.w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      ))}
    </Svg>
  );
});

const styles = StyleSheet.create({
  canvas: { flex: 1, borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
});
