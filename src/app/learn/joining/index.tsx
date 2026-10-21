import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { ArabicText } from '@/components/ui/Bits';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/Progress';
import { Screen, ScreenHeader, SectionTitle } from '@/components/ui/Screen';
import { LEVELS, lessonKey, levelProgress } from '@/data/curriculum';
import { JOINING_EXERCISES, JOINING_STAGES } from '@/data/joining';
import { useProgress } from '@/state/ProgressProvider';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/typography';

export default function JoiningList() {
  const s = useStyles();
  const { c } = useTheme();
  const { isCompleted } = useProgress();
  const p = levelProgress(LEVELS[2], isCompleted);

  return (
    <Screen>
      <ScreenHeader title="Joining letters" arabic="وصل الحروف" subtitle="Level 3 · From pairs to whole words" />
      <View style={{ gap: 6 }}>
        <ProgressBar value={p.ratio} />
        <Text style={s.meta}>
          {p.done} of {p.total} exercises complete
        </Text>
      </View>

      <Card tone="tint" onPress={() => router.push('/learn/joining/build')} accessibilityLabel="Build your own letter combination">
        <View style={s.buildRow}>
          <View style={s.buildIcon}>
            <Ionicons name="construct" size={20} color={c.onPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Build your own</Text>
            <Text style={s.meta}>Pick any letters and watch them join, then trace the result.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={c.textFaint} />
        </View>
      </Card>

      {JOINING_STAGES.map((stage) => {
        const items = JOINING_EXERCISES.filter((e) => e.stage === stage.id);
        return (
          <View key={stage.id} style={{ gap: 10 }}>
            <SectionTitle title={stage.title} />
            <Text style={[s.meta, { marginTop: -8 }]}>{stage.subtitle}</Text>
            {items.map((e) => {
              const done = isCompleted(lessonKey.joining(e.id));
              return (
                <Card key={e.id} onPress={() => router.push(`/learn/joining/${e.id}`)} style={s.row} accessibilityLabel={`${e.transliteration}, ${e.meaning}${done ? ', completed' : ''}`}>
                  <Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={done ? c.success : c.textFaint} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.title}>{e.transliteration}</Text>
                    <Text style={s.meta}>{e.meaning}</Text>
                  </View>
                  <ArabicText size={30} color={c.primary}>
                    {e.word}
                  </ArabicText>
                </Card>
              );
            })}
          </View>
        );
      })}
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  meta: { fontFamily: fonts.regular, fontSize: 13, color: c.textMuted },
  title: { fontFamily: fonts.semibold, fontSize: 15, color: c.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  buildRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  buildIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
}));
