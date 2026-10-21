import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { JoinBreakdown } from '@/components/lesson/JoinBreakdown';
import { ArabicText, Banner } from '@/components/ui/Bits';
import { Button, IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { WritingPractice } from '@/components/writing/WritingPractice';
import { LETTERS } from '@/data/letters';
import { useFeedback } from '@/lib/feedback';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/typography';

const MAX = 6;

export default function BuildJoin() {
  const s = useStyles();
  const { c } = useTheme();
  const fb = useFeedback();
  const [chars, setChars] = useState<string[]>([]);
  const [tracing, setTracing] = useState(false);
  const word = chars.join('');

  if (tracing && word) {
    return (
      <Screen scroll={false} contentStyle={{ padding: 16, paddingTop: 0, gap: 10 }} edges={['top', 'bottom']}>
        <ScreenHeader title="Trace your combination" subtitle={`${chars.length} letters`} />
        <View style={s.reference}>
          <ArabicText size={30} color={c.primary}>
            {word}
          </ArabicText>
        </View>
        <WritingPractice
          key={word}
          draftKey={`build:${word}`}
          target={word}
          kind="joining"
          refId={`custom:${word}`}
          title={`My combination ${word}`}
          onFinish={() => setTracing(false)}
          finishLabel="Done"
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="Build your own" arabic="ركّب الحروف" subtitle="Choose 2 to 6 letters" />
      <Banner text="Tap letters in the order you would write them. The first letter you choose appears on the right." />

      <Card style={{ minHeight: 160, justifyContent: 'center' }}>
        {chars.length ? (
          <JoinBreakdown word={word} compact />
        ) : (
          <Text style={s.placeholder}>Your letters will appear here</Text>
        )}
      </Card>

      <View style={s.controls}>
        <IconButton
          icon="backspace-outline"
          label="Remove last letter"
          onPress={() => setChars((cs) => cs.slice(0, -1))}
          disabled={!chars.length}
        />
        <IconButton icon="trash-outline" label="Clear all letters" onPress={() => setChars([])} disabled={!chars.length} />
        <View style={{ flex: 1 }} />
        <Button title="Trace it" icon="create-outline" onPress={() => setTracing(true)} disabled={chars.length < 2} small />
      </View>

      <View style={s.grid}>
        {LETTERS.map((l) => (
          <Pressable
            key={l.id}
            accessibilityRole="button"
            accessibilityLabel={`Add ${l.name}`}
            disabled={chars.length >= MAX}
            onPress={() => {
              fb.select();
              setChars((cs) => (cs.length < MAX ? [...cs, l.char] : cs));
            }}
            style={({ pressed }) => [s.key, !l.joinsForward && { borderColor: c.gold }, pressed && { backgroundColor: c.primaryTint }, chars.length >= MAX && { opacity: 0.4 }]}
          >
            <ArabicText size={24}>{l.char}</ArabicText>
          </Pressable>
        ))}
      </View>
      <Text style={s.legend}>Letters with a gold border never join to the next letter.</Text>
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  placeholder: { fontFamily: fonts.regular, fontSize: 14, color: c.textFaint, textAlign: 'center' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  key: { width: 44, height: 50, borderRadius: radius.sm, backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  legend: { fontFamily: fonts.regular, fontSize: 12, color: c.textMuted, textAlign: 'center' },
  reference: { backgroundColor: c.surface, borderRadius: 14, borderWidth: 1, borderColor: c.border },
}));
