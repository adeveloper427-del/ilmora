import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Chip, Segmented } from '@/components/ui/Bits';
import { Card } from '@/components/ui/Card';
import { GeometricPattern } from '@/components/ui/Pattern';
import { ProgressBar, ProgressRing } from '@/components/ui/Progress';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/typography';

/**
 * Preview of the madrasa plan (fees + attendance) with example students.
 * Not connected to real records — it shows what the paid madrasa tools look like.
 */

type FeeStatus = 'paid' | 'partial' | 'unpaid';
type Mark = 'present' | 'late' | 'absent';

type Row = {
  name: string;
  className: string;
  fee: number;
  paid: number;
  method?: string;
  ref?: string;
  date?: string;
  mark: Mark;
};

const ROWS: Row[] = [
  { name: 'Abdullahi Hassan', className: 'Class A', fee: 500, paid: 500, method: 'M-Pesa', ref: 'SJK3A1B2C4', date: '2 Oct', mark: 'present' },
  { name: 'Fatuma Ali', className: 'Class A', fee: 500, paid: 500, method: 'M-Pesa', ref: 'SJK7D9E1F3', date: '3 Oct', mark: 'present' },
  { name: 'Ibrahim Yusuf', className: 'Class A', fee: 500, paid: 0, mark: 'absent' },
  { name: 'Khadija Mohamed', className: 'Class A', fee: 500, paid: 500, method: 'Cash', date: '5 Oct', mark: 'present' },
  { name: 'Zainab Athman', className: 'Class B', fee: 600, paid: 300, method: 'M-Pesa', ref: 'SJL2G8H4K6', date: '7 Oct', mark: 'late' },
  { name: 'Omar Salim', className: 'Class B', fee: 600, paid: 600, method: 'M-Pesa', ref: 'SJL5M3N7P9', date: '4 Oct', mark: 'present' },
  { name: 'Mariam Kassim', className: 'Class B', fee: 600, paid: 600, method: 'M-Pesa', ref: 'SJM1Q6R2T8', date: '6 Oct', mark: 'present' },
  { name: 'Yahya Abdallah', className: 'Hifz', fee: 800, paid: 800, method: 'M-Pesa', ref: 'SJM4U9V3W5', date: '1 Oct', mark: 'present' },
  { name: 'Halima Bakari', className: 'Hifz', fee: 800, paid: 0, mark: 'present' },
  { name: 'Said Rashid', className: 'Hifz', fee: 800, paid: 400, method: 'M-Pesa', ref: 'SJN8X2Y6Z1', date: '9 Oct', mark: 'present' },
];

const statusOf = (r: Row): FeeStatus => (r.paid >= r.fee ? 'paid' : r.paid > 0 ? 'partial' : 'unpaid');
const ksh = (n: number) => `KSh ${n.toLocaleString('en-KE')}`;
const initials = (n: string) =>
  n
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('');

export default function MadrasaPreview() {
  const s = useStyles();
  const [tab, setTab] = useState<'fees' | 'attendance'>('fees');

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader title="Al-Noor Madrasa" subtitle="ILMORA Pro · KSh 3,000 / month" right={<View style={s.previewTag}><Text style={s.previewText}>Preview</Text></View>} />
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { label: 'Fees', value: 'fees' },
          { label: 'Attendance', value: 'attendance' },
        ]}
      />
      {tab === 'fees' ? <Fees /> : <Attendance />}
      <Text style={s.footnote}>Example students shown to preview the madrasa tools.</Text>
    </Screen>
  );
}

function Fees() {
  const s = useStyles();
  const { c } = useTheme();
  const [filter, setFilter] = useState<'all' | FeeStatus>('all');
  const expected = ROWS.reduce((n, r) => n + r.fee, 0);
  const collected = ROWS.reduce((n, r) => n + Math.min(r.paid, r.fee), 0);
  const count = (st: FeeStatus) => ROWS.filter((r) => statusOf(r) === st).length;
  const list = filter === 'all' ? ROWS : ROWS.filter((r) => statusOf(r) === filter);
  const pill: Record<FeeStatus, { bg: string; fg: string; label: string }> = {
    paid: { bg: c.primaryTint, fg: c.success, label: 'Paid' },
    partial: { bg: c.goldTint, fg: c.gold, label: 'Partial' },
    unpaid: { bg: c.dangerTint, fg: c.danger, label: 'Unpaid' },
  };

  return (
    <>
      <Card tone="primary" style={{ gap: 10 }}>
        <GeometricPattern color="#C6A15B" opacity={0.15} size={52} />
        <Text style={s.heroLabel}>October 2026 fees</Text>
        <Text style={s.heroValue}>
          {ksh(collected)} <Text style={s.heroOf}>of {ksh(expected)}</Text>
        </Text>
        <ProgressBar value={collected / expected} color="#D9B871" track="rgba(255,255,255,0.18)" />
        <Text style={s.heroOf}>{ksh(expected - collected)} still to collect</Text>
        <View style={s.heroStats}>
          <HeroStat value={count('paid')} label="Paid" />
          <HeroStat value={count('partial')} label="Partial" />
          <HeroStat value={count('unpaid')} label="Unpaid" />
          <HeroStat value={`${Math.round((collected / expected) * 100)}%`} label="Collected" />
        </View>
      </Card>

      <View style={s.chips}>
        {(['all', 'unpaid', 'partial', 'paid'] as const).map((f) => (
          <Chip key={f} label={f === 'all' ? 'All' : pill[f].label} selected={filter === f} onPress={() => setFilter(f)} />
        ))}
      </View>

      <Card style={{ paddingVertical: 4 }}>
        {list.map((r, i) => {
          const st = statusOf(r);
          return (
            <View key={r.name} style={[s.row, i > 0 && s.rowBorder]}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{initials(r.name)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{r.name}</Text>
                <Text style={s.meta} numberOfLines={1}>
                  {r.className}
                  {r.method ? ` · ${r.method}${r.ref ? ` ${r.ref}` : ` · ${r.date}`}` : ' · No payment yet'}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={s.amount}>
                  {ksh(r.paid)}
                  <Text style={s.of}> / {r.fee}</Text>
                </Text>
                <View style={[s.pill, { backgroundColor: pill[st].bg }]}>
                  <Text style={[s.pillText, { color: pill[st].fg }]}>{pill[st].label}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </Card>
    </>
  );
}

function Attendance() {
  const s = useStyles();
  const { c } = useTheme();
  const [marks, setMarks] = useState<Record<string, Mark>>(() => Object.fromEntries(ROWS.map((r) => [r.name, r.mark])));
  const [cls, setCls] = useState('All');
  const classes = ['All', ...Array.from(new Set(ROWS.map((r) => r.className)))];
  const list = cls === 'All' ? ROWS : ROWS.filter((r) => r.className === cls);
  const counts = useMemo(() => {
    const v = Object.values(marks);
    return { present: v.filter((m) => m === 'present').length, late: v.filter((m) => m === 'late').length, absent: v.filter((m) => m === 'absent').length };
  }, [marks]);
  const rate = (counts.present + counts.late) / ROWS.length;
  const options: { m: Mark; label: string; color: string; tint: string }[] = [
    { m: 'present', label: 'P', color: c.success, tint: c.primaryTint },
    { m: 'late', label: 'L', color: c.gold, tint: c.goldTint },
    { m: 'absent', label: 'A', color: c.danger, tint: c.dangerTint },
  ];

  return (
    <>
      <Card style={s.attHero}>
        <ProgressRing value={rate} size={84} stroke={8} />
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={s.attTitle}>Today · Mon 20 Oct</Text>
          <View style={s.countRow}>
            <Count color={c.success} value={counts.present} label="Present" />
            <Count color={c.gold} value={counts.late} label="Late" />
            <Count color={c.danger} value={counts.absent} label="Absent" />
          </View>
        </View>
      </Card>

      <View style={s.chips}>
        {classes.map((k) => (
          <Chip key={k} label={k} selected={cls === k} onPress={() => setCls(k)} />
        ))}
      </View>

      <Card style={{ paddingVertical: 4 }}>
        {list.map((r, i) => (
          <View key={r.name} style={[s.row, i > 0 && s.rowBorder]}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initials(r.name)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{r.name}</Text>
              <Text style={s.meta}>{r.className}</Text>
            </View>
            <View style={s.toggle}>
              {options.map((o) => {
                const on = marks[r.name] === o.m;
                return (
                  <Pressable
                    key={o.m}
                    onPress={() => setMarks((m) => ({ ...m, [r.name]: o.m }))}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on }}
                    accessibilityLabel={`${r.name} ${o.m}`}
                    style={[s.toggleBtn, on && { backgroundColor: o.tint, borderColor: o.color }]}
                  >
                    <Text style={[s.toggleText, on && { color: o.color }]}>{o.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </Card>
      <View style={s.legend}>
        <Ionicons name="information-circle-outline" size={14} color={c.textFaint} />
        <Text style={s.footnote}>P = present · L = late · A = absent</Text>
      </View>
    </>
  );
}

function HeroStat({ value, label }: { value: number | string; label: string }) {
  const s = useStyles();
  return (
    <View style={{ flex: 1 }}>
      <Text style={s.heroStatValue}>{value}</Text>
      <Text style={s.heroStatLabel}>{label}</Text>
    </View>
  );
}

function Count({ color, value, label }: { color: string; value: number; label: string }) {
  const s = useStyles();
  return (
    <View style={s.count}>
      <View style={[s.dot, { backgroundColor: color }]} />
      <Text style={s.countValue}>{value}</Text>
      <Text style={s.countLabel}>{label}</Text>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  previewTag: { backgroundColor: c.goldTint, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  previewText: { fontFamily: fonts.semibold, fontSize: 11, color: c.gold },
  heroLabel: { fontFamily: fonts.medium, fontSize: 12, color: '#CFE1D6', textTransform: 'uppercase', letterSpacing: 1 },
  heroValue: { fontFamily: fonts.bold, fontSize: 26, color: '#fff' },
  heroOf: { fontFamily: fonts.regular, fontSize: 15, color: '#CFE1D6' },
  heroStats: { flexDirection: 'row', gap: 6, marginTop: 4 },
  heroStatValue: { fontFamily: fonts.bold, fontSize: 15, color: '#fff' },
  heroStatLabel: { fontFamily: fonts.regular, fontSize: 11, color: '#CFE1D6' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  rowBorder: { borderTopWidth: 1, borderTopColor: c.border },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: c.primaryTint, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.semibold, fontSize: 13, color: c.primary },
  name: { fontFamily: fonts.semibold, fontSize: 14, color: c.text },
  meta: { fontFamily: fonts.regular, fontSize: 12, color: c.textMuted, marginTop: 1 },
  amount: { fontFamily: fonts.semibold, fontSize: 13, color: c.text },
  of: { fontFamily: fonts.regular, fontSize: 11, color: c.textMuted },
  pill: { borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  pillText: { fontFamily: fonts.semibold, fontSize: 11 },
  attHero: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  attTitle: { fontFamily: fonts.semibold, fontSize: 15, color: c.text },
  countRow: { flexDirection: 'row', gap: 12 },
  count: { alignItems: 'flex-start' },
  dot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  countValue: { fontFamily: fonts.bold, fontSize: 18, color: c.text },
  countLabel: { fontFamily: fonts.regular, fontSize: 11, color: c.textMuted },
  toggle: { flexDirection: 'row', gap: 4 },
  toggleBtn: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  toggleText: { fontFamily: fonts.bold, fontSize: 13, color: c.textFaint },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  footnote: { fontFamily: fonts.regular, fontSize: 12, color: c.textFaint, textAlign: 'center' },
}));
