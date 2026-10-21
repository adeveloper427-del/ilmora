import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { ArabicText, Banner } from '@/components/ui/Bits';
import { ProgressBar } from '@/components/ui/Progress';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { LEVELS, lessonKey, levelProgress } from '@/data/curriculum';
import { LETTERS } from '@/data/letters';
import { useProgress } from '@/state/ProgressProvider';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/typography';

export default function Alphabet() {
  const s = useStyles();
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const { isCompleted, data } = useProgress();
  const p = levelProgress(LEVELS[0], isCompleted);
  const cols = width >= 700 ? 6 : 4;
  const cell = (Math.min(width, 900) - 32 - (cols - 1) * 10) / cols;

  return (
    <Screen>
      <ScreenHeader title="The Arabic alphabet" arabic="الحروف الهجائية" subtitle="Level 1 · Arabic Foundations" />
      <Banner text="Arabic has 28 letters and is written from right to left. Most letters connect to the next one, and many are told apart only by their dots. Tap a letter to learn its name and trace it." />
      <View style={{ gap: 6 }}>
        <ProgressBar value={p.ratio} />
        <Text style={s.meta}>
          {p.done} of {p.total} letters traced · {data.lettersPractised.length} practised
        </Text>
      </View>
      <View style={s.grid}>
        {LETTERS.map((l) => {
          const done = isCompleted(lessonKey.letter(l.id));
          return (
            <Pressable
              key={l.id}
              onPress={() => router.push(`/learn/letter/${l.id}`)}
              accessibilityRole="button"
              accessibilityLabel={`${l.name}${done ? ', traced' : ''}`}
              style={({ pressed }) => [s.cell, { width: cell }, done && s.cellDone, pressed && { opacity: 0.75 }]}
            >
              {done ? <Ionicons name="checkmark-circle" size={16} color={c.success} style={s.tick} /> : null}
              <ArabicText size={36} color={done ? c.primary : c.text}>
                {l.char}
              </ArabicText>
              <Text style={s.name} numberOfLines={1}>
                {l.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  meta: { fontFamily: fonts.regular, fontSize: 13, color: c.textMuted },
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 10 },
  cell: { backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, alignItems: 'center', paddingBottom: 8 },
  cellDone: { backgroundColor: c.primaryTint, borderColor: c.primaryTint },
  tick: { position: 'absolute', top: 6, left: 6 },
  name: { fontFamily: fonts.medium, fontSize: 12, color: c.textMuted, marginTop: -6 },
}));
