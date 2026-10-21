import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { ArabicText, Segmented } from '@/components/ui/Bits';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/Progress';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { lessonKey } from '@/data/curriculum';
import { WORD_LEVELS, WordLevel, WORDS } from '@/data/words';
import { useProgress } from '@/state/ProgressProvider';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/typography';

export default function WordList() {
  const s = useStyles();
  const { c } = useTheme();
  const { isCompleted } = useProgress();
  const [level, setLevel] = useState<WordLevel>('beginner');
  const info = WORD_LEVELS.find((l) => l.id === level)!;
  const items = WORDS.filter((w) => w.level === level);
  const done = items.filter((w) => isCompleted(lessonKey.word(w.id))).length;

  return (
    <Screen>
      <ScreenHeader title="Word writing" arabic="كتابة الكلمات" subtitle="Level 4 · Trace, then write alone" />
      <Segmented value={level} onChange={setLevel} options={WORD_LEVELS.map((l) => ({ label: l.title, value: l.id }))} />
      <View style={{ gap: 6 }}>
        <Text style={s.meta}>{info.subtitle}</Text>
        <ProgressBar value={done / items.length} />
        <Text style={s.meta}>
          {done} of {items.length} words complete
        </Text>
      </View>
      {items.map((w) => {
        const complete = isCompleted(lessonKey.word(w.id));
        return (
          <Card key={w.id} onPress={() => router.push(`/learn/words/${w.id}`)} style={s.row} accessibilityLabel={`${w.transliteration}, ${w.meaning}${complete ? ', completed' : ''}`}>
            <Ionicons name={complete ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={complete ? c.success : c.textFaint} />
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{w.transliteration}</Text>
              <Text style={s.meta}>{w.meaning}</Text>
            </View>
            <ArabicText size={32} color={c.primary}>
              {w.word}
            </ArabicText>
          </Card>
        );
      })}
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  meta: { fontFamily: fonts.regular, fontSize: 13, color: c.textMuted },
  title: { fontFamily: fonts.semibold, fontSize: 15, color: c.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
}));
