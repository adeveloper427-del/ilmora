import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { Pressable, Text, TextStyle, View } from 'react-native';
import { useFeedback } from '@/lib/feedback';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { arabicLineHeight, fonts, radius } from '@/theme/typography';
import type { IconName } from './Button';

/** Arabic text with correct direction, generous line height and the Amiri typeface. */
export function ArabicText({ children, size = 28, color, bold, style, center = true }: { children: string; size?: number; color?: string; bold?: boolean; style?: TextStyle; center?: boolean }) {
  const { c } = useTheme();
  return (
    <Text
      style={[
        {
          fontFamily: bold ? fonts.arabicBold : fonts.arabic,
          fontSize: size,
          lineHeight: arabicLineHeight(size),
          color: color ?? c.text,
          writingDirection: 'rtl',
          textAlign: center ? 'center' : 'right',
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Chip({ label, selected, onPress, icon }: { label: string; selected?: boolean; onPress: () => void; icon?: IconName }) {
  const { c } = useTheme();
  const fb = useFeedback();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        fb.select();
        onPress();
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        minHeight: 38,
        borderRadius: radius.pill,
        backgroundColor: selected ? c.primary : c.surface,
        borderWidth: 1,
        borderColor: selected ? c.primary : c.border,
      }}
    >
      {icon && <Ionicons name={icon} size={15} color={selected ? c.onPrimary : c.textMuted} />}
      <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: selected ? c.onPrimary : c.text }}>{label}</Text>
    </Pressable>
  );
}

export function Segmented<T extends string | number>({ options, value, onChange }: { options: { label: string; value: T }[]; value: T; onChange: (v: T) => void }) {
  const s = useStyles();
  const fb = useFeedback();
  return (
    <View style={s.segmented} accessibilityRole="radiogroup">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            onPress={() => {
              fb.select();
              onChange(o.value);
            }}
            style={[s.segment, active && s.segmentActive]}
          >
            <Text style={[s.segmentText, active && s.segmentTextActive]} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function EmptyState({ icon, title, message, action }: { icon: IconName; title: string; message: string; action?: ReactNode }) {
  const s = useStyles();
  const { c } = useTheme();
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <Ionicons name={icon} size={28} color={c.primary} />
      </View>
      <Text style={s.emptyTitle}>{title}</Text>
      <Text style={s.emptyMessage}>{message}</Text>
      {action}
    </View>
  );
}

export function StatTile({ icon, value, label, tint }: { icon: IconName; value: string; label: string; tint?: string }) {
  const s = useStyles();
  const { c } = useTheme();
  return (
    <View style={s.stat} accessible accessibilityLabel={`${label}: ${value}`}>
      <Ionicons name={icon} size={18} color={tint ?? c.primary} />
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function ListRow({ icon, title, subtitle, onPress, right, danger }: { icon: IconName; title: string; subtitle?: string; onPress?: () => void; right?: ReactNode; danger?: boolean }) {
  const s = useStyles();
  const { c } = useTheme();
  const fb = useFeedback();
  const content = (
    <>
      <View style={[s.rowIcon, danger && { backgroundColor: c.dangerTint }]}>
        <Ionicons name={icon} size={19} color={danger ? c.danger : c.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.rowTitle, danger && { color: c.danger }]}>{title}</Text>
        {subtitle ? <Text style={s.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={c.textFaint} /> : null)}
    </>
  );
  if (!onPress) return <View style={s.row}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        fb.tap();
        onPress();
      }}
      style={({ pressed }) => [s.row, pressed && { backgroundColor: c.surfaceAlt }]}
    >
      {content}
    </Pressable>
  );
}

export function Avatar({ name, color, size = 48 }: { name: string; color: string; size?: number }) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('') || '؟';
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#D9B871' }}>
      <Text style={{ color: '#FFFFFF', fontFamily: fonts.bold, fontSize: size * 0.36 }}>{initials}</Text>
    </View>
  );
}

export function Banner({ tone = 'info', icon, text }: { tone?: 'info' | 'error' | 'success'; icon?: IconName; text: string }) {
  const { c } = useTheme();
  const bg = tone === 'error' ? c.dangerTint : tone === 'success' ? c.primaryTint : c.goldTint;
  const fg = tone === 'error' ? c.danger : tone === 'success' ? c.success : c.text;
  return (
    <View accessibilityLiveRegion="polite" style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', padding: 12, borderRadius: radius.md, backgroundColor: bg }}>
      <Ionicons name={icon ?? (tone === 'error' ? 'alert-circle' : tone === 'success' ? 'checkmark-circle' : 'information-circle')} size={18} color={fg} style={{ marginTop: 1 }} />
      <Text style={{ flex: 1, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: fg }}>{text}</Text>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  segmented: { flexDirection: 'row', backgroundColor: c.surfaceAlt, borderRadius: radius.md, padding: 4, gap: 4 },
  segment: { flex: 1, minHeight: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  segmentActive: { backgroundColor: c.surface, shadowColor: c.shadow, shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  segmentText: { fontFamily: fonts.medium, fontSize: 13, color: c.textMuted },
  segmentTextActive: { color: c.text, fontFamily: fonts.semibold },
  empty: { alignItems: 'center', padding: 24, gap: 8 },
  emptyIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: c.primaryTint, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontFamily: fonts.semibold, fontSize: 16, color: c.text, textAlign: 'center' },
  emptyMessage: { fontFamily: fonts.regular, fontSize: 14, color: c.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 6 },
  stat: { flex: 1, backgroundColor: c.surface, borderRadius: radius.md, padding: 12, gap: 4, borderWidth: 1, borderColor: c.border },
  statValue: { fontFamily: fonts.bold, fontSize: 20, color: c.text },
  statLabel: { fontFamily: fonts.regular, fontSize: 12, color: c.textMuted },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 12, borderRadius: radius.md, minHeight: 56 },
  rowIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: c.primaryTint, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: fonts.medium, fontSize: 15, color: c.text },
  rowSubtitle: { fontFamily: fonts.regular, fontSize: 13, color: c.textMuted, marginTop: 2 },
}));
