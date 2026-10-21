import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { ToolButton } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/Bits';
import { useFeedback } from '@/lib/feedback';
import { AttemptKind, Stroke, useProgress } from '@/state/ProgressProvider';
import { GuideLevel, useSettings } from '@/state/SettingsProvider';
import { inkColors, penSizes } from '@/theme/colors';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/typography';
import { Drafts } from './drafts';
import { analyse, Box, fitGuideFont, WritingFeedback } from './geometry';
import { WritingCanvas } from './WritingCanvas';

const GUIDE_OPACITY: Record<GuideLevel, number> = { strong: 0.3, light: 0.13, off: 0 };

export type FinishInfo = WritingFeedback & { guideShown: boolean };

type Props = {
  draftKey: string;
  /** Arabic text to trace. Leave empty for free writing. */
  target: string;
  kind: AttemptKind;
  refId: string;
  title: string;
  /** Start with this guide level instead of the student's saved preference. */
  initialGuide?: GuideLevel;
  onFinish?: (info: FinishInfo) => void;
  finishLabel?: string;
  /** Extra content shown in the action row (e.g. next/previous). */
  extraAction?: ReactNode;
};

/** Guide text sized to the canvas; reports the box it occupies so feedback can tell where ink landed. */
function GuideText({ text, w, h, opacity, color, onBox }: { text: string; w: number; h: number; opacity: number; color: string; onBox: (b: Box) => void }) {
  const { fontSize } = useMemo(() => fitGuideFont(text, w, h), [text, w, h]);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: w * 0.04 }}>
      <Text
        onLayout={(e) => onBox(e.nativeEvent.layout)}
        selectable={false}
        style={{
          fontFamily: 'Amiri_400Regular',
          fontSize,
          lineHeight: fontSize * 1.85,
          color,
          opacity,
          writingDirection: 'rtl',
          textAlign: 'center',
          maxWidth: w * 0.92,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

export function WritingPractice({ draftKey, target, kind, refId, title, initialGuide, onFinish, finishLabel = 'Finish', extraAction }: Props) {
  const s = useStyles();
  const { c } = useTheme();
  const fb = useFeedback();
  const { settings, update } = useSettings();
  const progress = useProgress();

  const [strokes, setStrokesState] = useState<Stroke[]>(() => Drafts.get(draftKey));
  const [guide, setGuide] = useState<GuideLevel>(initialGuide ?? settings.guideLevel);
  const [penOpen, setPenOpen] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [notice, setNotice] = useState<{ text: string; tone: 'ok' | 'warn' } | null>(null);
  const [box, setBox] = useState<Box | null>(null);
  const noticeAnim = useState(() => new Animated.Value(0))[0];
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasTarget = target.trim().length > 0;

  const setStrokes = useCallback(
    (next: Stroke[]) => {
      setStrokesState(next);
      Drafts.set(draftKey, next);
    },
    [draftKey],
  );

  useEffect(() => () => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
  }, []);

  const flash = (text: string, tone: 'ok' | 'warn' = 'ok') => {
    setNotice({ text, tone });
    noticeAnim.setValue(0);
    Animated.timing(noticeAnim, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 2600);
  };

  const feedback = useMemo(() => analyse(strokes, hasTarget ? box : null), [strokes, hasTarget, box]);

  const onCanvasChange = useCallback(
    (next: Stroke[]) => setStrokes(next),
    [setStrokes],
  );

  const onSize = useCallback((w: number, h: number) => setSize({ w, h }), []);

  const undo = () => {
    if (strokes.length) setStrokes(strokes.slice(0, -1));
  };
  const clear = () => {
    setStrokes([]);
    setComparing(false);
  };

  const changeGuide = (g: GuideLevel) => {
    setGuide(g);
    setComparing(false);
    if (!initialGuide) update({ guideLevel: g });
  };

  const save = () => {
    if (!strokes.length) {
      flash('Write something first, then save it.', 'warn');
      return;
    }
    progress.saveAttempt({ kind, refId, title, arabic: target, guideShown: guide !== 'off', strokes, width: size.w, height: size.h });
    fb.success();
    flash('Saved to your writing.');
  };

  const finish = () => {
    if (hasTarget && (feedback.strokeCount === 0 || feedback.effort < 0.35)) {
      fb.warn();
      flash(feedback.strokeCount === 0 ? 'Trace the guide first, starting from the right.' : 'Keep going — write the whole shape before finishing.', 'warn');
      return;
    }
    if (!hasTarget && feedback.strokeCount === 0) {
      flash('Write something first.', 'warn');
      return;
    }
    fb.success();
    onFinish?.({ ...feedback, guideShown: guide !== 'off' });
  };

  const guideNode =
    hasTarget && size.w > 0 ? (
      <GuideText text={target} w={size.w} h={size.h} opacity={GUIDE_OPACITY[guide]} color={c.guide} onBox={setBox} />
    ) : null;

  const overlayNode =
    comparing && hasTarget && size.w > 0 ? <GuideText text={target} w={size.w} h={size.h} opacity={0.55} color="#B8892F" onBox={() => {}} /> : null;

  const feedbackText = !strokes.length
    ? hasTarget
      ? 'Start on the right — Arabic is written right to left.'
      : 'Write freely. Start on the right and move left.'
    : hasTarget
      ? `${feedback.strokeCount} stroke${feedback.strokeCount === 1 ? '' : 's'} · ${Math.round(feedback.insideRatio * 100)}% of your ink is on the guide area`
      : `${feedback.strokeCount} stroke${feedback.strokeCount === 1 ? '' : 's'}`;

  return (
    <View style={s.root}>
      <View style={s.toolbar}>
        {hasTarget ? (
          <View style={{ flex: 1 }}>
            <Segmented
              value={guide}
              onChange={changeGuide}
              options={[
                { label: 'Guide', value: 'strong' },
                { label: 'Faint', value: 'light' },
                { label: 'Hidden', value: 'off' },
              ]}
            />
          </View>
        ) : (
          <Text style={s.freeLabel}>Free writing</Text>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Pen colour and size"
          accessibilityState={{ expanded: penOpen }}
          onPress={() => setPenOpen((o) => !o)}
          style={[s.penButton, penOpen && { borderColor: c.primary }]}
        >
          <View style={{ width: 8 + settings.penSize, height: 8 + settings.penSize, borderRadius: 20, backgroundColor: settings.penColor }} />
          <Ionicons name={penOpen ? 'chevron-up' : 'chevron-down'} size={14} color={c.textMuted} />
        </Pressable>
      </View>

      {penOpen && (
        <View style={s.penPanel}>
          <View style={s.penRow}>
            {penSizes.map((p) => (
              <Pressable
                key={p.value}
                accessibilityRole="radio"
                accessibilityLabel={`${p.name} pen`}
                accessibilityState={{ checked: settings.penSize === p.value }}
                onPress={() => update({ penSize: p.value })}
                style={[s.sizeOption, settings.penSize === p.value && s.optionActive]}
              >
                <View style={{ width: p.value + 4, height: p.value + 4, borderRadius: 20, backgroundColor: c.text }} />
                <Text style={s.optionLabel}>{p.name}</Text>
              </Pressable>
            ))}
          </View>
          <View style={s.penRow}>
            {inkColors.map((ink) => (
              <Pressable
                key={ink.value}
                accessibilityRole="radio"
                accessibilityLabel={`${ink.name} ink`}
                accessibilityState={{ checked: settings.penColor === ink.value }}
                onPress={() => update({ penColor: ink.value })}
                style={[s.colorOption, { backgroundColor: ink.value }, settings.penColor === ink.value && { borderColor: c.gold, borderWidth: 3 }]}
              >
                {settings.penColor === ink.value && <Ionicons name="checkmark" size={18} color="#fff" />}
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <View style={s.canvasWrap}>
        <WritingCanvas
          strokes={strokes}
          onChange={onCanvasChange}
          color={settings.penColor}
          width={settings.penSize}
          guide={guideNode}
          overlay={overlayNode}
          onSize={onSize}
          onStrokeEnd={progress.logStroke}
        />
        <View pointerEvents="none" style={s.direction}>
          <Text style={s.directionText}>start</Text>
          <Ionicons name="arrow-back" size={14} color={c.gold} />
        </View>
        {notice && (
          <Animated.View
            pointerEvents="none"
            accessibilityLiveRegion="polite"
            style={[s.notice, notice.tone === 'warn' && s.noticeWarn, { opacity: noticeAnim, transform: [{ translateY: noticeAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }]}
          >
            <Ionicons name={notice.tone === 'ok' ? 'checkmark-circle' : 'information-circle'} size={16} color={notice.tone === 'ok' ? c.onPrimary : '#2A2112'} />
            <Text style={[s.noticeText, notice.tone === 'warn' && { color: '#2A2112' }]}>{notice.text}</Text>
          </Animated.View>
        )}
      </View>

      <Text style={s.feedback} accessibilityLiveRegion="polite">
        {feedbackText}
      </Text>

      <View style={s.actions}>
        <ToolButton icon="arrow-undo" label="Undo" onPress={undo} disabled={!strokes.length} />
        <ToolButton icon="refresh" label="Clear" onPress={clear} disabled={!strokes.length} />
        {hasTarget && guide === 'off' ? <ToolButton icon="eye" label="Compare" active={comparing} onPress={() => setComparing((v) => !v)} /> : null}
        <ToolButton icon="bookmark" label="Save" onPress={save} disabled={!strokes.length} />
        {extraAction}
        {onFinish ? (
          <Pressable accessibilityRole="button" accessibilityLabel={finishLabel} onPress={finish} style={({ pressed }) => [s.finish, pressed && { opacity: 0.85 }]}>
            <Ionicons name="checkmark" size={20} color={c.onPrimary} />
            <Text style={s.finishText} numberOfLines={1}>
              {finishLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, gap: 10 },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  freeLabel: { flex: 1, fontFamily: fonts.semibold, fontSize: 15, color: c.text },
  penButton: {
    height: 44,
    minWidth: 60,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: c.border,
    backgroundColor: c.surface,
  },
  penPanel: { backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, padding: 10, gap: 10 },
  penRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  sizeOption: { alignItems: 'center', justifyContent: 'center', gap: 4, minWidth: 72, minHeight: 52, borderRadius: radius.sm, paddingVertical: 4 },
  optionActive: { backgroundColor: c.primaryTint },
  optionLabel: { fontFamily: fonts.medium, fontSize: 12, color: c.text },
  colorOption: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderColor: 'transparent', borderWidth: 0 },
  canvasWrap: { flex: 1, minHeight: 200 },
  direction: {
    position: 'absolute',
    top: 10,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(198,161,91,0.14)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  directionText: { fontFamily: fonts.medium, fontSize: 11, color: '#8A6A2C' },
  notice: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: c.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    maxWidth: '92%',
  },
  noticeWarn: { backgroundColor: '#E9CF95' },
  noticeText: { fontFamily: fonts.medium, fontSize: 13, color: c.onPrimary, flexShrink: 1 },
  feedback: { fontFamily: fonts.regular, fontSize: 13, color: c.textMuted, textAlign: 'center' },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 2 },
  finish: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: c.primary,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: radius.pill,
    flexShrink: 1,
  },
  finishText: { fontFamily: fonts.semibold, fontSize: 15, color: c.onPrimary },
}));
