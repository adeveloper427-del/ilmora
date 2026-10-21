import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Polygon } from 'react-native-svg';
import { brand } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { starPoints } from './Pattern';

/** ILMORA mark: an eight-pointed star framing ʿayn, the first letter of ʿilm (knowledge). */
export function LogoMark({ size = 72, ring = brand.emerald, star = brand.gold, glyph = brand.ivory }: { size?: number; ring?: string; star?: string; glyph?: string }) {
  const c = size / 2;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={c} cy={c} r={c} fill={ring} />
        <Polygon points={starPoints(c, c, c * 0.8)} fill="none" stroke={star} strokeWidth={Math.max(1.5, size / 36)} strokeLinejoin="round" />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={{ fontFamily: fonts.arabicBold, fontSize: size * 0.36, color: glyph, lineHeight: size * 0.62, marginTop: size * 0.02 }}>ع</Text>
      </View>
    </View>
  );
}

export function Wordmark({ color, sub }: { color: string; sub: string }) {
  return (
    <View style={styles.center}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 30, letterSpacing: 8, color }}>ILMORA</Text>
      <Text style={{ fontFamily: fonts.medium, fontSize: 13, letterSpacing: 3, color: sub, marginTop: 4 }}>DIGITAL MADRASA</Text>
      <Text style={{ fontFamily: fonts.arabic, fontSize: 18, color: sub, lineHeight: 34 }}>المدرسة الرقمية</Text>
    </View>
  );
}

const styles = StyleSheet.create({ center: { alignItems: 'center', justifyContent: 'center' } });
