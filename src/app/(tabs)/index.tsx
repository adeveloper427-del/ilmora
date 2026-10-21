import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { ArabicText, Avatar, EmptyState, StatTile } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { GeometricPattern } from '@/components/ui/Pattern';
import { ProgressBar, ProgressRing } from '@/components/ui/Progress';
import { Screen, SectionTitle } from '@/components/ui/Screen';
import { LEVELS, lessonMeta, levelProgress, nextLessonKey } from '@/data/curriculum';
import { dailyLetter } from '@/data/letters';
import { formatDateTime } from '@/lib/dates';
import { useHifz } from '@/state/HifzProvider';
import { useProgress } from '@/state/ProgressProvider';
import { useSettings } from '@/state/SettingsProvider';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/typography';

export default function Home() {
  const s = useStyles();
  const { c } = useTheme();
  const { settings } = useSettings();
  const progress = useProgress();
  const hifz = useHifz();
  const { stats, isCompleted } = progress;

  const goalSeconds = settings.dailyGoalMinutes * 60;
  const goalRatio = Math.min(1, stats.todaySeconds / goalSeconds);
  const allKeys = LEVELS.flatMap((l) => l.keys);
  const overall = LEVELS.reduce((sum, l) => sum + levelProgress(l, isCompleted).done, 0) / allKeys.length;

  const resumeKey = stats.inProgress[0]?.key ?? nextLessonKey(isCompleted);
  const resume = lessonMeta(resumeKey);
  const isResuming = !!stats.inProgress[0];
  const letter = dailyLetter();
  const name = settings.studentName.trim();
  const minutesLeft = Math.max(0, Math.ceil((goalSeconds - stats.todaySeconds) / 60));
  const fresh = stats.startedCount === 0 && progress.data.totalSeconds === 0;

  return (
    <Screen>
      <View style={s.header}>
        <Pressable onPress={() => router.push('/(tabs)/profile')} accessibilityRole="button" accessibilityLabel="Open profile">
          <Avatar name={name || 'Student'} color={settings.avatarColor} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.salaam} numberOfLines={1}>
            Assalamu Alaikum
          </Text>
          <Text style={s.name} numberOfLines={1}>
            {name || 'Student'}
          </Text>
        </View>
        <Pressable onPress={() => router.push('/upgrade')} accessibilityRole="button" accessibilityLabel="Upgrade to ILMORA Pro" style={({ pressed }) => [s.upgrade, pressed && { opacity: 0.85 }]}>
          <Ionicons name="sparkles" size={14} color="#2A2112" />
          <Text style={s.upgradeText}>Upgrade</Text>
        </Pressable>
      </View>

      <Card tone="primary" style={s.hero}>
        <GeometricPattern color="#C6A15B" opacity={0.16} size={52} />
        <View style={s.heroRow}>
          <ProgressRing value={goalRatio} size={86} stroke={8} color="#D9B871" track="rgba(255,255,255,0.18)" label={`${Math.round(goalRatio * 100)}%`} labelColor="#FFFFFF" />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={s.heroLabel}>Today’s goal</Text>
            <Text style={s.heroValue}>
              {Math.floor(stats.todaySeconds / 60)} <Text style={s.heroOf}>of {settings.dailyGoalMinutes} min</Text>
            </Text>
            <Text style={s.heroHint}>{goalRatio >= 1 ? 'Goal reached today — mā shāʾ Allāh!' : `${minutesLeft} min of writing left to reach your goal`}</Text>
          </View>
        </View>
      </Card>

      <View style={s.stats}>
        <StatTile icon="flame" tint={c.gold} value={`${stats.streak}`} label={stats.streak === 1 ? 'day streak' : 'day streak'} />
        <StatTile icon="checkmark-done" value={`${stats.completedCount}`} label="lessons done" />
        <StatTile icon="pie-chart" value={`${Math.round(overall * 100)}%`} label="overall" />
      </View>
      {fresh ? <Text style={s.freshNote}>Your numbers start counting with your first lesson.</Text> : null}

      {resume ? (
        <Card onPress={() => router.push(resume.route as Href)} accessibilityLabel={`${isResuming ? 'Continue' : 'Start'} ${resume.title}`}>
          <View style={s.continueRow}>
            <View style={s.continueIcon}>
              <Ionicons name={isResuming ? 'play' : 'sparkles'} size={22} color={c.onPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.overline}>{isResuming ? 'Continue learning' : 'Up next'}</Text>
              <Text style={s.cardTitle}>{resume.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={c.textFaint} />
          </View>
          <View style={{ marginTop: 14, gap: 6 }}>
            <ProgressBar value={overall} />
            <Text style={s.small}>{Math.round(overall * 100)}% of the full ILMORA path</Text>
          </View>
        </Card>
      ) : null}

      <SectionTitle title="Letter of the day" />
      <Card tone="gold">
        <View style={s.letterRow}>
          <View style={s.letterTile}>
            <ArabicText size={56} color={c.primary}>
              {letter.char}
            </ArabicText>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={s.cardTitle}>{letter.name}</Text>
            <Text style={s.small}>Sound: {letter.sound}</Text>
            <Text style={s.small}>
              Example: <Text style={{ fontFamily: fonts.arabic, fontSize: 16 }}>{letter.example.arabic}</Text> · {letter.example.meaning}
            </Text>
            <Button title="Trace it" icon="create-outline" small onPress={() => router.push(`/learn/letter/${letter.id}`)} style={{ alignSelf: 'flex-start', marginTop: 8 }} />
          </View>
        </View>
      </Card>

      <SectionTitle title="Quick practice" />
      <View style={s.quick}>
        <Card style={s.quickCard} onPress={() => router.push('/practice/free')} accessibilityLabel="Open handwriting canvas">
          <View style={[s.quickIcon, { backgroundColor: c.primaryTint }]}>
            <Ionicons name="brush" size={22} color={c.primary} />
          </View>
          <Text style={s.quickTitle}>Handwriting</Text>
          <Text style={s.small}>Open the writing canvas</Text>
        </Card>
        <Card style={s.quickCard} onPress={() => router.push('/(tabs)/audio')} accessibilityLabel="Open audio recorder">
          <View style={[s.quickIcon, { backgroundColor: c.goldTint }]}>
            <Ionicons name="mic" size={22} color={c.gold} />
          </View>
          <Text style={s.quickTitle}>Record</Text>
          <Text style={s.small}>Record your reading</Text>
        </Card>
      </View>
      <Card onPress={() => router.push('/memorize')} accessibilityLabel="Memorize the Quran">
        <View style={s.continueRow}>
          <View style={[s.quickIcon, { backgroundColor: c.goldTint, marginBottom: 0 }]}>
            <Ionicons name="bookmarks" size={20} color={c.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.quickTitle}>Memorize</Text>
            <Text style={s.small}>
              {hifz.dueKeys.length ? `${hifz.dueKeys.length} verse${hifz.dueKeys.length === 1 ? '' : 's'} due for review` : `${hifz.memorizedCount} verses memorized`}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={c.textFaint} />
        </View>
      </Card>

      <SectionTitle title="Recently completed" action={stats.recentCompleted.length ? 'Progress' : undefined} onAction={() => router.push('/progress')} />
      {stats.recentCompleted.length ? (
        <Card style={{ paddingVertical: 6 }}>
          {stats.recentCompleted.map((r, i) => {
            const meta = lessonMeta(r.key);
            return (
              <Pressable
                key={r.key}
                onPress={() => meta && router.push(meta.route as Href)}
                accessibilityRole="button"
                style={[s.recent, i > 0 && { borderTopWidth: 1, borderTopColor: c.border }]}
              >
                <Ionicons name="checkmark-circle" size={20} color={c.success} />
                <Text style={s.recentTitle} numberOfLines={1}>
                  {meta?.title ?? r.title}
                </Text>
                <Text style={s.small}>{formatDateTime(r.completedAt)}</Text>
              </Pressable>
            );
          })}
        </Card>
      ) : (
        <Card>
          <EmptyState icon="ribbon-outline" title="No lessons completed yet" message="Finish your first letter lesson and it will appear here." />
        </Card>
      )}

      <Card tone="tint">
        <View style={s.reminder}>
          <Ionicons name="alarm-outline" size={22} color={c.primary} />
          <View style={{ flex: 1 }}>
            <Text style={s.cardTitle}>Daily reminder</Text>
            <Text style={s.small}>
              {stats.todaySeconds > 0
                ? goalRatio >= 1
                  ? 'You have practised today. Come back tomorrow to keep your streak going.'
                  : `Good start today. ${minutesLeft} more minute${minutesLeft === 1 ? '' : 's'} of writing completes your ${settings.dailyGoalMinutes}-minute goal.`
                : `A little every day beats a lot once a week. Aim for ${settings.dailyGoalMinutes} minutes of writing today.`}
            </Text>
          </View>
        </View>
      </Card>
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  salaam: { fontFamily: fonts.regular, fontSize: 14, color: c.textMuted },
  upgrade: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#D9B871', borderRadius: radius.pill, paddingHorizontal: 12, height: 34 },
  upgradeText: { fontFamily: fonts.semibold, fontSize: 13, color: '#2A2112' },
  name: { fontFamily: fonts.bold, fontSize: 21, color: c.text },
  hero: { padding: 18 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  heroLabel: { fontFamily: fonts.medium, fontSize: 13, color: '#CFE1D6', textTransform: 'uppercase', letterSpacing: 1 },
  heroValue: { fontFamily: fonts.bold, fontSize: 26, color: '#FFFFFF' },
  heroOf: { fontFamily: fonts.regular, fontSize: 15, color: '#CFE1D6' },
  heroHint: { fontFamily: fonts.regular, fontSize: 13, color: '#E7F0EA', lineHeight: 18 },
  stats: { flexDirection: 'row', gap: 10 },
  freshNote: { fontFamily: fonts.regular, fontSize: 12, color: c.textFaint, marginTop: -8, textAlign: 'center' },
  continueRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  continueIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
  overline: { fontFamily: fonts.medium, fontSize: 12, color: c.gold, textTransform: 'uppercase', letterSpacing: 1 },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 16, color: c.text },
  small: { fontFamily: fonts.regular, fontSize: 13, color: c.textMuted, lineHeight: 19 },
  letterRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  letterTile: { width: 96, height: 104, borderRadius: radius.md, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' },
  quick: { flexDirection: 'row', gap: 12 },
  quickCard: { flex: 1, gap: 6 },
  quickIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  quickTitle: { fontFamily: fonts.semibold, fontSize: 15, color: c.text },
  recent: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, minHeight: 48 },
  recentTitle: { flex: 1, fontFamily: fonts.medium, fontSize: 14, color: c.text },
  reminder: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
}));
