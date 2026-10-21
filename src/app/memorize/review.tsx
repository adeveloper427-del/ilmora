import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ListenButton } from '@/components/audio/ListenButton';
import { Completion } from '@/components/lesson/Lesson';
import { MushafText } from '@/components/hifz/Mushaf';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/Progress';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { getHifzVerse, verseWords } from '@/data/hifz';
import { useFeedback } from '@/lib/feedback';
import { useHifz } from '@/state/HifzProvider';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/typography';

/** Goes through every verse due today, one at a time: recite, reveal, mark. */
export default function Review() {
  const s = useStyles();
  const { c } = useTheme();
  const fb = useFeedback();
  const hifz = useHifz();
  // Freeze the queue when the session starts so grading doesn't reshuffle it.
  const [queue] = useState(() => hifz.dueKeys);
  const [pos, setPos] = useState(0);
  const [shown, setShown] = useState(0);
  const [result, setResult] = useState({ correct: 0, mistakes: 0 });

  const item = queue[pos] ? getHifzVerse(queue[pos]) : undefined;
  const words = item ? verseWords(item.verse.text).length : 0;
  const revealedAll = shown >= words;

  const grade = (ok: boolean) => {
    if (!item) return;
    hifz.grade(item.verse.key, ok);
    if (ok) fb.success();
    else fb.warn();
    setResult((r) => ({ correct: r.correct + (ok ? 1 : 0), mistakes: r.mistakes + (ok ? 0 : 1) }));
    setShown(0);
    setPos((p) => p + 1);
  };

  if (!queue.length || !item) {
    return (
      <Screen edges={['top', 'bottom']} scroll={false} contentStyle={{ padding: 16 }}>
        <ScreenHeader title="Review" />
        <Completion
          title={queue.length ? 'Review complete' : 'Nothing due'}
          message={queue.length ? `You reviewed ${queue.length} verse${queue.length === 1 ? '' : 's'}. Verses you got right come back later; ones with mistakes come back tomorrow.` : 'No verses are due today. Keep memorizing new verses.'}
          details={queue.length ? [`${result.correct} correct`, `${result.mistakes} with mistakes`] : undefined}
        >
          <Button title="Back to memorize" onPress={() => router.replace('/memorize')} />
        </Completion>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom']} scroll={false} contentStyle={{ padding: 16, paddingTop: 0, gap: 12 }}>
      <ScreenHeader title="Review" subtitle={`${pos + 1} of ${queue.length} due`} />
      <ProgressBar value={pos / queue.length} />
      <ScrollView contentContainerStyle={{ gap: 12, flexGrow: 1 }}>
        <Card style={{ gap: 8 }}>
          <Text style={s.ref}>
            {item.surah.name} · verse {item.verse.number}
          </Text>
          <MushafText verses={[item.verse]} revealed={{ [item.verse.key]: shown }} hidden fontSize={30} onWordPress={(_, i) => setShown(Math.max(shown, i + 1))} />
        </Card>
        {revealedAll ? <ListenButton key={item.verse.key} verseKey={item.verse.key} /> : null}
        <Text style={s.hint}>{revealedAll ? 'Compare with what you recited.' : 'Recite the verse from memory, then reveal it. Tap a hidden word to peek.'}</Text>
      </ScrollView>
      {revealedAll ? (
        <View style={{ gap: 8 }}>
          <Text style={s.q}>Did you recite it correctly?</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button title="Mistake" variant="danger" icon="close" onPress={() => grade(false)} style={{ flex: 1 }} />
            <Button title="Correct" icon="checkmark" onPress={() => grade(true)} style={{ flex: 1 }} />
          </View>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button title="Peek word" variant="ghost" icon="chevron-back" onPress={() => setShown(shown + 1)} style={{ flex: 1 }} />
          <Button title="Reveal verse" icon="eye" onPress={() => setShown(words)} style={{ flex: 1 }} />
        </View>
      )}
      <Text style={[s.hint, { color: c.textFaint }]}>Marking is your own judgement — the app does not hear your recitation.</Text>
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  ref: { fontFamily: fonts.semibold, fontSize: 14, color: c.gold },
  hint: { fontFamily: fonts.regular, fontSize: 13, color: c.textMuted, textAlign: 'center' },
  q: { fontFamily: fonts.semibold, fontSize: 15, color: c.text, textAlign: 'center' },
}));
