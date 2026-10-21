import { ReactNode } from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';
import { useFeedback } from '@/lib/feedback';
import { makeStyles } from '@/theme/ThemeProvider';
import { radius } from '@/theme/typography';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  tone?: 'surface' | 'tint' | 'gold' | 'primary';
  accessibilityLabel?: string;
};

export function Card({ children, onPress, style, tone = 'surface', accessibilityLabel }: Props) {
  const s = useStyles();
  const fb = useFeedback();
  const toneStyle = tone === 'tint' ? s.tint : tone === 'gold' ? s.gold : tone === 'primary' ? s.primary : null;
  if (!onPress) return <View style={[s.card, toneStyle, style]}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => {
        fb.tap();
        onPress();
      }}
      style={({ pressed }) => [s.card, toneStyle, style, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
    >
      {children}
    </Pressable>
  );
}

const useStyles = makeStyles((c) => ({
  card: {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: c.border,
    shadowColor: c.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  tint: { backgroundColor: c.primaryTint, borderColor: 'transparent', elevation: 0, shadowOpacity: 0 },
  gold: { backgroundColor: c.goldTint, borderColor: 'transparent', elevation: 0, shadowOpacity: 0 },
  primary: { backgroundColor: c.primary, borderColor: 'transparent', overflow: 'hidden' },
}));
