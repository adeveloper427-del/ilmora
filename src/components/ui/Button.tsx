import { Ionicons } from '@expo/vector-icons';
import { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useFeedback } from '@/lib/feedback';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/typography';

export type IconName = ComponentProps<typeof Ionicons>['name'];

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  small?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
};

export function Button({ title, onPress, variant = 'primary', icon, loading, disabled, small, style, accessibilityHint }: Props) {
  const s = useStyles();
  const { c } = useTheme();
  const fb = useFeedback();
  const fg = {
    primary: c.onPrimary,
    secondary: c.primary,
    ghost: c.text,
    danger: c.danger,
    gold: '#2A2112',
  }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={() => {
        fb.tap();
        onPress();
      }}
      style={({ pressed }) => [
        s.base,
        small && s.small,
        s[variant],
        pressed && { opacity: 0.85, transform: [{ scale: 0.985 }] },
        (disabled || loading) && s.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={s.row}>
          {icon && <Ionicons name={icon} size={small ? 16 : 19} color={fg} />}
          <Text style={[s.label, small && s.labelSmall, { color: fg }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function IconButton({
  icon,
  label,
  onPress,
  disabled,
  active,
  size = 44,
  tone,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
  size?: number;
  tone?: string;
}) {
  const { c } = useTheme();
  const fb = useFeedback();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      hitSlop={6}
      onPress={() => {
        fb.tap();
        onPress();
      }}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: active ? c.primary : pressed ? c.surfaceAlt : 'transparent',
        opacity: disabled ? 0.35 : 1,
      })}
    >
      <Ionicons name={icon} size={size * 0.5} color={active ? c.onPrimary : (tone ?? c.text)} />
    </Pressable>
  );
}

/** Labelled tool button used in the writing toolbar. */
export function ToolButton({ icon, label, onPress, disabled, active }: { icon: IconName; label: string; onPress: () => void; disabled?: boolean; active?: boolean }): ReactNode {
  const { c } = useTheme();
  const fb = useFeedback();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => {
        fb.tap();
        onPress();
      }}
      style={({ pressed }) => [toolStyles.tool, { opacity: disabled ? 0.35 : pressed ? 0.6 : 1 }]}
    >
      <View style={[toolStyles.toolIcon, { backgroundColor: active ? c.primary : c.surfaceAlt }]}>
        <Ionicons name={icon} size={20} color={active ? c.onPrimary : c.text} />
      </View>
      <Text style={[toolStyles.toolLabel, { color: c.textMuted }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const toolStyles = StyleSheet.create({
  tool: { alignItems: 'center', minWidth: 50, paddingVertical: 2 },
  toolIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  toolLabel: { fontFamily: fonts.medium, fontSize: 11, marginTop: 4 },
});

const useStyles = makeStyles((c) => ({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: { minHeight: 40, paddingHorizontal: 14, borderRadius: radius.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontFamily: fonts.semibold, fontSize: 16 },
  labelSmall: { fontSize: 14 },
  primary: { backgroundColor: c.primary },
  secondary: { backgroundColor: c.primaryTint },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: c.border },
  danger: { backgroundColor: c.dangerTint },
  gold: { backgroundColor: '#D9B871' },
  disabled: { opacity: 0.45 },
}));
