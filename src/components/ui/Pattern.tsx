import { memo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, Pattern as SvgPattern, Polygon, Rect } from 'react-native-svg';

/** Points of an eight-pointed star ({8/2} star polygon) centred at (cx, cy). */
export function starPoints(cx: number, cy: number, R: number) {
  const r = R * 0.765;
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI / 8) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? R : r;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}

type Props = { color: string; opacity?: number; size?: number; style?: ViewStyle };

/** A restrained tiling of interlaced eight-pointed stars, drawn as fine lines. */
export const GeometricPattern = memo(function GeometricPattern({ color, opacity = 0.12, size = 56, style }: Props) {
  const h = size / 2;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg width="100%" height="100%">
        <Defs>
          <SvgPattern id="ilmora-stars" width={size} height={size} patternUnits="userSpaceOnUse">
            <Polygon points={starPoints(h, h, h * 0.92)} fill="none" stroke={color} strokeWidth={1} />
            <Polygon points={starPoints(0, 0, h * 0.42)} fill="none" stroke={color} strokeWidth={1} />
            <Polygon points={starPoints(size, 0, h * 0.42)} fill="none" stroke={color} strokeWidth={1} />
            <Polygon points={starPoints(0, size, h * 0.42)} fill="none" stroke={color} strokeWidth={1} />
            <Polygon points={starPoints(size, size, h * 0.42)} fill="none" stroke={color} strokeWidth={1} />
          </SvgPattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#ilmora-stars)" opacity={opacity} />
      </Svg>
    </View>
  );
});
