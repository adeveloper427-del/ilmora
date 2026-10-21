import { router, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { JoinBreakdown } from '@/components/lesson/JoinBreakdown';
import { WritingLesson } from '@/components/lesson/WritingLesson';
import { ArabicText, Banner, EmptyState } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { lessonKey } from '@/data/curriculum';
import { getJoining, JOINING_EXERCISES, JOINING_STAGES } from '@/data/joining';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/typography';

export default function JoiningLesson() {
  const { c } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const ex = getJoining(id);

  if (!ex) {
    return (
      <Screen>
        <ScreenHeader title="Exercise not found" />
        <EmptyState icon="alert-circle-outline" title="We couldn't find that exercise" message="Choose another from the list." action={<Button title="All joining exercises" onPress={() => router.replace('/learn/joining')} />} />
      </Screen>
    );
  }

  const idx = JOINING_EXERCISES.indexOf(ex);
  const next = JOINING_EXERCISES[idx + 1];
  const stage = JOINING_STAGES.find((s) => s.id === ex.stage)!;

  return (
    <WritingLesson
      key={ex.id}
      lessonKey={lessonKey.joining(ex.id)}
      title={`Joining: ${ex.transliteration}`}
      subtitle={`Level 3 · ${stage.title}`}
      kind="joining"
      refId={ex.id}
      parts={[ex.word]}
      phases={['trace', 'memory']}
      intro={
        <>
          <Card style={{ alignItems: 'center' }}>
            <ArabicText size={84} color={c.primary} bold>
              {ex.word}
            </ArabicText>
            <Text style={{ fontFamily: fonts.semibold, fontSize: 18, color: c.text, marginTop: -8 }}>{ex.transliteration}</Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 15, color: c.textMuted }}>“{ex.meaning}”</Text>
          </Card>
          <Banner text="Look at how the letters change shape so they can hold hands. Next, we'll take the word apart letter by letter." />
        </>
      }
      example={
        <>
          <Card>
            <JoinBreakdown word={ex.word} />
          </Card>
          <Banner icon="bulb-outline" text={ex.tip} />
        </>
      }
      next={next ? { label: `Next: ${next.transliteration}`, onPress: () => router.replace(`/learn/joining/${next.id}`) } : undefined}
      backToList={{ label: 'All joining exercises', route: '/learn/joining' }}
    />
  );
}
