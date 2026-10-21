import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useEffect, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { starPoints } from '@/components/ui/Pattern';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/typography';

export function StepIndicator({ steps, index }: { steps: string[]; index: number }) {
  const s = useStyles();
  return (
    <View style={s.steps} accessibilityRole="progressbar" accessibilityLabel={`Step ${index + 1} of ${steps.length}: ${steps[index]}`}>
      {steps.map((label, i) => (
        <View key={label} style={s.step}>
          <View style={[s.stepBar, i <= index && s.stepBarActive]} />
          <Text style={[s.stepLabel, i === index && s.stepLabelActive]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Completion screen shown at the end of every lesson. */
export function Completion({ title, message, details, children }: { title: string; message: string; details?: string[]; children?: ReactNode }) {
  const s = useStyles();
  const { c } = useTheme();
  const scale = useState(() => new Animated.Value(0.6))[0];
  const opacity = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity]);
  return (
    <View style={s.complete}>
      <Animated.View style={{ transform: [{ scale }], opacity }}>
        <View style={s.badge}>
          <Svg width={120} height={120} style={{ position: 'absolute' }}>
            <Polygon points={starPoints(60, 60, 58)} fill={c.goldTint} stroke={c.gold} strokeWidth={2} strokeLinejoin="round" />
          </Svg>
          <View style={s.badgeInner}>
            <Ionicons name="checkmark" size={40} color={c.onPrimary} />
          </View>
        </View>
      </Animated.View>
      <Text style={s.completeTitle} accessibilityRole="header">
        {title}
      </Text>
      <Text style={s.completeMessage}>{message}</Text>
      {details?.length ? (
        <View style={s.details}>
          {details.map((d) => (
            <View key={d} style={s.detailRow}>
              <Ionicons name="ellipse" size={6} color={c.gold} />
              <Text style={s.detailText}>{d}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <View style={s.completeActions}>{children}</View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  steps: { flexDirection: 'row', gap: 6 },
  step: { flex: 1, gap: 4 },
  stepBar: { height: 4, borderRadius: 2, backgroundColor: c.surfaceAlt },
  stepBarActive: { backgroundColor: c.primary },
  stepLabel: { fontFamily: fonts.medium, fontSize: 11, color: c.textFaint },
  stepLabelActive: { color: c.primary, fontFamily: fonts.semibold },
  complete: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, gap: 10 },
  badge: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  badgeInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
  completeTitle: { fontFamily: fonts.bold, fontSize: 24, color: c.text, textAlign: 'center' },
  completeMessage: { fontFamily: fonts.regular, fontSize: 15, color: c.textMuted, textAlign: 'center', lineHeight: 22, maxWidth: 340 },
  details: { backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, padding: 14, gap: 8, alignSelf: 'stretch', marginTop: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailText: { fontFamily: fonts.regular, fontSize: 14, color: c.text, flex: 1 },
  completeActions: { alignSelf: 'stretch', gap: 10, marginTop: 14 },
}));
