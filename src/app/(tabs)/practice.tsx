import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { ArabicText } from '@/components/ui/Bits';
import { Card } from '@/components/ui/Card';
import { Screen, ScreenHeader, SectionTitle } from '@/components/ui/Screen';
import { StrokePreview } from '@/components/writing/WritingCanvas';
import { lessonKey } from '@/data/curriculum';
import { LETTERS } from '@/data/letters';
import { useProgress } from '@/state/ProgressProvider';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/typography';
import type { IconName } from '@/components/ui/Button';

const MODES: { icon: IconName; title: string; body: string; route: string }[] = [
  { icon: 'brush', title: 'Free writing', body: 'A blank canvas for anything you want to write', route: '/practice/free' },
  { icon: 'shapes', title: 'Letter forms', body: 'Isolated, initial, medial and final shapes', route: '/learn/forms' },
  { icon: 'git-merge', title: 'Joining letters', body: 'Connect letters into words', route: '/learn/joining' },
  { icon: 'text', title: 'Word writing', body: 'Trace, then write words on your own', route: '/learn/words' },
  { icon: 'book', title: 'Quranic writing', body: 'Write short verses carefully', route: '/learn/quran' },
  { icon: 'bookmarks', title: 'Memorize (Ḥifẓ)', body: 'Hide verses and recite from memory', route: '/memorize' },
];

export default function Practice() {
  const s = useStyles();
  const { c } = useTheme();
  const { attempts, isCompleted } = useProgress();

  return (
    <Screen>
      <ScreenHeader title="Practice" arabic="تَدَرَّب" subtitle="Write with your finger or a stylus" back={false} />

      <Card tone="primary" onPress={() => router.push('/practice/free')} accessibilityLabel="Open free writing canvas">
        <View style={s.heroRow}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={s.heroTitle}>Writing canvas</Text>
            <Text style={s.heroBody}>Undo, clear, change pen size and colour, and save what you write.</Text>
          </View>
          <View style={s.heroIcon}>
            <Ionicons name="create" size={26} color={c.primary} />
          </View>
        </View>
      </Card>

      <SectionTitle title="Trace a letter" action="All letters" onAction={() => router.push('/learn/alphabet')} />
      <View style={s.grid}>
        {LETTERS.map((l) => {
          const done = isCompleted(lessonKey.letter(l.id));
          return (
            <Pressable
              key={l.id}
              onPress={() => router.push(`/learn/letter/${l.id}`)}
              accessibilityRole="button"
              accessibilityLabel={`Trace ${l.name}${done ? ', completed' : ''}`}
              style={({ pressed }) => [s.cell, done && s.cellDone, pressed && { opacity: 0.7 }]}
            >
              <ArabicText size={26} color={done ? c.primary : c.text}>
                {l.char}
              </ArabicText>
            </Pressable>
          );
        })}
      </View>

      <SectionTitle title="Exercises" />
      {MODES.map((m) => (
        <Card key={m.title} onPress={() => router.push(m.route as Href)} style={s.mode} accessibilityLabel={m.title}>
          <View style={s.modeIcon}>
            <Ionicons name={m.icon} size={20} color={c.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.modeTitle}>{m.title}</Text>
            <Text style={s.modeBody}>{m.body}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={c.textFaint} />
        </Card>
      ))}

      <SectionTitle title="Saved writing" action={attempts.length ? `See all (${attempts.length})` : undefined} onAction={() => router.push('/attempts')} />
      {attempts.length ? (
        <View style={s.saved}>
          {attempts.slice(0, 3).map((a) => (
            <Pressable key={a.id} style={s.thumb} onPress={() => router.push('/attempts')} accessibilityRole="button" accessibilityLabel={`Saved attempt: ${a.title}`}>
              <View style={s.thumbCanvas}>
                <StrokePreview strokes={a.strokes} width={a.width} height={a.height} />
              </View>
              <Text style={s.thumbTitle} numberOfLines={1}>
                {a.title}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <Text style={s.emptyText}>Tap Save on any canvas to keep an attempt here.</Text>
      )}
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroTitle: { fontFamily: fonts.bold, fontSize: 19, color: '#fff' },
  heroBody: { fontFamily: fonts.regular, fontSize: 14, color: '#DCEAE2', lineHeight: 20 },
  heroIcon: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#F8F5EC', alignItems: 'center', justifyContent: 'center' },
  // Letters are laid out right-to-left so alif sits at the top right.
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  cell: {
    width: 52,
    height: 60,
    borderRadius: radius.sm,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellDone: { backgroundColor: c.primaryTint, borderColor: c.primaryTint },
  mode: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  modeIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: c.primaryTint, alignItems: 'center', justifyContent: 'center' },
  modeTitle: { fontFamily: fonts.semibold, fontSize: 15, color: c.text },
  modeBody: { fontFamily: fonts.regular, fontSize: 13, color: c.textMuted, marginTop: 2 },
  saved: { flexDirection: 'row', gap: 10 },
  thumb: { flex: 1, gap: 6 },
  thumbCanvas: { aspectRatio: 1, backgroundColor: c.canvas, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, padding: 6 },
  thumbTitle: { fontFamily: fonts.medium, fontSize: 12, color: c.textMuted },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: c.textMuted },
}));
