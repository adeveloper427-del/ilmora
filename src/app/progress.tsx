import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StatTile } from '@/components/ui/Bits';
import { Card } from '@/components/ui/Card';
import { ProgressBar, ProgressRing } from '@/components/ui/Progress';
import { Screen, ScreenHeader, SectionTitle } from '@/components/ui/Screen';
import { LEVELS, levelProgress } from '@/data/curriculum';
import { LETTERS } from '@/data/letters';
import { addDays, dayKey, formatDuration } from '@/lib/dates';
import { useProgress } from '@/state/ProgressProvider';
import { useRecordings } from '@/state/RecordingsProvider';
import { useSettings } from '@/state/SettingsProvider';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/typography';

const CHART_H = 120;

export default function ProgressScreen() {
  const s = useStyles();
  const { c } = useTheme();
  const { settings } = useSettings();
  const { data, attempts, stats, isCompleted } = useProgress();
  const { recordings } = useRecordings();
  const [selected, setSelected] = useState(6);

  const allKeys = LEVELS.flatMap((l) => l.keys);
  const done = LEVELS.reduce((n, l) => n + levelProgress(l, isCompleted).done, 0);
  const goal = settings.dailyGoalMinutes;

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(), i - 6);
    return { key: dayKey(d), label: d.toLocaleDateString(undefined, { weekday: 'short' }), minutes: (data.days[dayKey(d)] ?? 0) / 60 };
  });
  const max = Math.max(goal, ...week.map((w) => w.minutes)) * 1.1;
  const sel = week[selected];
  const weekTotal = week.reduce((n, w) => n + w.minutes, 0);

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader title="Your progress" arabic="تقدّمي" subtitle="Everything here comes from your own practice" />

      <Card style={s.overview}>
        <ProgressRing value={done / allKeys.length} size={96} stroke={9} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={s.big}>
            {done} <Text style={s.of}>of {allKeys.length} lessons</Text>
          </Text>
          <Text style={s.meta}>{stats.startedCount - stats.completedCount} in progress</Text>
          <Text style={s.meta}>{formatDuration(data.totalSeconds)} of writing practice in total</Text>
        </View>
      </Card>

      <View style={s.tiles}>
        <StatTile icon="flame" tint={c.gold} value={`${stats.streak}`} label="day streak" />
        <StatTile icon="text" value={`${data.lettersPractised.length}/${LETTERS.length}`} label="letters practised" />
      </View>
      <View style={s.tiles}>
        <StatTile icon="bookmark" value={`${attempts.length}`} label="writing saved" />
        <StatTile icon="mic" value={`${recordings.length}`} label="recordings" />
      </View>

      <SectionTitle title="Last 7 days" />
      <Card>
        <Text style={s.chartTitle} accessibilityLiveRegion="polite">
          {sel.label}: {sel.minutes < 1 && sel.minutes > 0 ? '<1' : Math.round(sel.minutes)} min
          <Text style={s.meta}>  ·  week total {Math.round(weekTotal)} min</Text>
        </Text>
        <View style={{ height: CHART_H, marginTop: 12 }}>
          <View style={[s.goalLine, { bottom: (goal / max) * CHART_H }]} />
          <Text style={[s.goalLabel, { bottom: (goal / max) * CHART_H + 2 }]}>goal {goal} min</Text>
          <View style={s.bars}>
            {week.map((w, i) => (
              <Pressable
                key={w.key}
                onPress={() => setSelected(i)}
                accessibilityRole="button"
                accessibilityLabel={`${w.label}: ${Math.round(w.minutes)} minutes`}
                style={s.barHit}
              >
                <View
                  style={{
                    width: '62%',
                    maxWidth: 28,
                    height: Math.max(w.minutes > 0 ? 4 : 2, (w.minutes / max) * CHART_H),
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                    backgroundColor: w.minutes > 0 ? c.primary : c.border,
                    opacity: i === selected ? 1 : 0.6,
                  }}
                />
              </Pressable>
            ))}
          </View>
        </View>
        <View style={s.axis}>
          {week.map((w, i) => (
            <Text key={w.key} style={[s.axisLabel, i === selected && { color: c.text, fontFamily: fonts.semibold }]}>
              {w.label}
            </Text>
          ))}
        </View>
        <Text style={[s.meta, { marginTop: 8 }]}>Practice time counts active writing on the canvas. Tap a day to see its total.</Text>
      </Card>

      <SectionTitle title="By level" />
      <Card style={{ gap: 14 }}>
        {LEVELS.map((l) => {
          const p = levelProgress(l, isCompleted);
          return (
            <View key={l.id} style={{ gap: 6 }}>
              <View style={s.levelRow}>
                <Text style={s.levelTitle}>
                  {l.id}. {l.title}
                </Text>
                <Text style={s.meta}>
                  {p.done}/{p.total}
                </Text>
              </View>
              <ProgressBar value={p.ratio} />
            </View>
          );
        })}
      </Card>
      <Text style={s.footnote}>ILMORA does not score handwriting accuracy. Completion means you finished an exercise, and canvas feedback only shows where your ink landed.</Text>
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  overview: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  big: { fontFamily: fonts.bold, fontSize: 28, color: c.text },
  of: { fontFamily: fonts.regular, fontSize: 15, color: c.textMuted },
  meta: { fontFamily: fonts.regular, fontSize: 13, color: c.textMuted },
  tiles: { flexDirection: 'row', gap: 10 },
  chartTitle: { fontFamily: fonts.semibold, fontSize: 15, color: c.text },
  goalLine: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1, borderStyle: 'dashed', borderColor: c.textFaint },
  goalLabel: { position: 'absolute', right: 0, fontFamily: fonts.regular, fontSize: 11, color: c.textMuted },
  bars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  barHit: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  axis: { flexDirection: 'row', gap: 2, marginTop: 6, borderTopWidth: 1, borderTopColor: c.border, paddingTop: 6 },
  axisLabel: { flex: 1, textAlign: 'center', fontFamily: fonts.regular, fontSize: 11, color: c.textMuted },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  levelTitle: { fontFamily: fonts.medium, fontSize: 14, color: c.text },
  footnote: { fontFamily: fonts.regular, fontSize: 12, color: c.textFaint, textAlign: 'center', lineHeight: 18, borderRadius: radius.md },
}));
