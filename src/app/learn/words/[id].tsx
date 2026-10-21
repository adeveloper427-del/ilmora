import { router, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { JoinBreakdown } from '@/components/lesson/JoinBreakdown';
import { WritingLesson } from '@/components/lesson/WritingLesson';
import { ArabicText, Banner, EmptyState } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { lessonKey } from '@/data/curriculum';
import { getWord, WORD_LEVELS, WORDS } from '@/data/words';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/typography';

export default function WordLesson() {
  const { c } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const w = getWord(id);

  if (!w) {
    return (
      <Screen>
        <ScreenHeader title="Word not found" />
        <EmptyState icon="alert-circle-outline" title="We couldn't find that word" message="Choose another from the list." action={<Button title="All words" onPress={() => router.replace('/learn/words')} />} />
      </Screen>
    );
  }

  const next = WORDS[WORDS.indexOf(w) + 1];
  const level = WORD_LEVELS.find((l) => l.id === w.level)!;

  return (
    <WritingLesson
      key={w.id}
      lessonKey={lessonKey.word(w.id)}
      title={`Word: ${w.transliteration}`}
      subtitle={`Level 4 · ${level.title}`}
      kind="word"
      refId={w.id}
      parts={[w.word]}
      intro={
        <>
          <Card style={{ alignItems: 'center' }}>
            <ArabicText size={84} color={c.primary} bold>
              {w.word}
            </ArabicText>
            <Text style={{ fontFamily: fonts.semibold, fontSize: 18, color: c.text, marginTop: -8 }}>{w.transliteration}</Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 15, color: c.textMuted }}>“{w.meaning}”</Text>
          </Card>
          <Banner text="First you will trace the word over a guide. Then the guide disappears and you write it on your own — use Compare to check your attempt against the model." />
        </>
      }
      example={
        <Card>
          <JoinBreakdown word={w.word} />
        </Card>
      }
      next={next ? { label: `Next word: ${next.transliteration}`, onPress: () => router.replace(`/learn/words/${next.id}`) } : undefined}
      backToList={{ label: 'All words', route: '/learn/words' }}
    />
  );
}
