import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import { Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/Progress';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { currentLevel, LEVELS, levelProgress } from '@/data/curriculum';
import { useHifz } from '@/state/HifzProvider';
import { useProgress } from '@/state/ProgressProvider';
import { useSettings } from '@/state/SettingsProvider';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/typography';

export default function Learn() {
  const s = useStyles();
  const { c } = useTheme();
  const { settings } = useSettings();
  const { isCompleted } = useProgress();
  const hifz = useHifz();
  const current = currentLevel(isCompleted);

  return (
    <Screen>
      <ScreenHeader title="Learn" arabic="تَعَلَّم" subtitle="Five levels, from letters to Quranic writing" back={false} />
      <Card tone="gold" onPress={() => router.push('/memorize')} accessibilityLabel="Memorize the Quran">
        <View style={s.top}>
          <View style={[s.badge, { backgroundColor: c.gold }]}>
            <Ionicons name="bookmarks" size={18} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Memorize (Ḥifẓ)</Text>
            <Text style={[s.summary, { marginTop: 2 }]}>
              {hifz.memorizedCount} verses memorized{hifz.dueKeys.length ? ` · ${hifz.dueKeys.length} due for review` : ''}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={c.textFaint} />
        </View>
      </Card>
      {LEVELS.map((level) => {
        const p = levelProgress(level, isCompleted);
        const isCurrent = level.id === current.id && p.ratio < 1;
        return (
          <Card key={level.id} onPress={() => router.push(level.route as Href)} accessibilityLabel={`Level ${level.id}: ${level.title}`} style={isCurrent && { borderColor: c.primary, borderWidth: 1.5 }}>
            <View style={s.top}>
              <View style={[s.badge, p.ratio === 1 && { backgroundColor: c.success }]}>
                {p.ratio === 1 ? <Ionicons name="checkmark" size={20} color="#fff" /> : <Text style={s.badgeText}>{level.id}</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.overline}>Level {level.id}{isCurrent ? ' · current' : ''}</Text>
                <Text style={s.title}>{level.title}</Text>
              </View>
              {settings.showArabicLabels ? <Text style={s.arabic}>{level.arabicTitle}</Text> : null}
            </View>
            <Text style={s.summary}>{level.summary}</Text>
            <View style={s.topics}>
              {level.topics.map((t) => (
                <View key={t} style={s.topic}>
                  <Text style={s.topicText}>{t}</Text>
                </View>
              ))}
            </View>
            <View style={s.progressRow}>
              <View style={{ flex: 1 }}>
                <ProgressBar value={p.ratio} />
              </View>
              <Text style={s.count}>
                {p.done}/{p.total}
              </Text>
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: { width: 40, height: 40, borderRadius: 14, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontFamily: fonts.bold, fontSize: 17, color: c.onPrimary },
  overline: { fontFamily: fonts.medium, fontSize: 12, color: c.gold, textTransform: 'uppercase', letterSpacing: 0.8 },
  title: { fontFamily: fonts.semibold, fontSize: 17, color: c.text },
  arabic: { fontFamily: fonts.arabic, fontSize: 18, color: c.textMuted, lineHeight: 32 },
  summary: { fontFamily: fonts.regular, fontSize: 14, color: c.textMuted, lineHeight: 20, marginTop: 10 },
  topics: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  topic: { backgroundColor: c.surfaceAlt, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  topicText: { fontFamily: fonts.regular, fontSize: 12, color: c.textMuted },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  count: { fontFamily: fonts.semibold, fontSize: 13, color: c.textMuted, minWidth: 44, textAlign: 'right' },
}));
