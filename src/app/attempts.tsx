import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { ArabicText, Chip, EmptyState } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { StrokePreview } from '@/components/writing/WritingCanvas';
import { confirm } from '@/lib/confirm';
import { formatDateTime } from '@/lib/dates';
import { AttemptKind, useProgress, WritingAttempt } from '@/state/ProgressProvider';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/typography';

const FILTERS: { label: string; kinds: AttemptKind[] | null }[] = [
  { label: 'All', kinds: null },
  { label: 'Letters', kinds: ['letter', 'form'] },
  { label: 'Joining', kinds: ['joining'] },
  { label: 'Words', kinds: ['word'] },
  { label: 'Quran', kinds: ['quran'] },
  { label: 'Free', kinds: ['free'] },
];

export default function Attempts() {
  const s = useStyles();
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const { attempts, deleteAttempt } = useProgress();
  const [filter, setFilter] = useState(0);
  const [selected, setSelected] = useState<WritingAttempt | null>(null);
  const kinds = FILTERS[filter].kinds;
  const list = kinds ? attempts.filter((a) => kinds.includes(a.kind)) : attempts;
  const cols = width >= 700 ? 3 : 2;
  const cell = (Math.min(width, 900) - 32 - (cols - 1) * 12) / cols;

  const del = async (a: WritingAttempt) => {
    if (!(await confirm('Delete this attempt?', 'Your saved writing will be permanently removed.'))) return;
    deleteAttempt(a.id);
    setSelected(null);
  };

  if (selected) {
    return (
      <Screen edges={['top', 'bottom']}>
        <ScreenHeader title={selected.title} subtitle={formatDateTime(selected.createdAt)} right={<Pressable onPress={() => setSelected(null)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close"><Ionicons name="close" size={26} color={c.text} /></Pressable>} />
        {selected.arabic ? (
          <View style={s.compare}>
            <Text style={s.compareLabel}>Model</Text>
            <ArabicText size={34} color={c.primary}>
              {selected.arabic}
            </ArabicText>
          </View>
        ) : null}
        <Text style={s.compareLabel}>Your writing {selected.guideShown ? '(with guide)' : '(guide hidden)'}</Text>
        <View style={[s.big, { aspectRatio: selected.width / Math.max(selected.height, 1) }]}>
          <StrokePreview strokes={selected.strokes} width={selected.width} height={selected.height} />
        </View>
        <Text style={s.meta}>{selected.strokes.length} strokes</Text>
        <Button title="Delete attempt" variant="danger" icon="trash-outline" onPress={() => del(selected)} />
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader title="Saved writing" arabic="كتاباتي" subtitle={`${attempts.length} saved attempt${attempts.length === 1 ? '' : 's'}`} />
      <View style={s.filters}>
        {FILTERS.map((f, i) => (
          <Chip key={f.label} label={f.label} selected={filter === i} onPress={() => setFilter(i)} />
        ))}
      </View>
      {list.length === 0 ? (
        <EmptyState
          icon="bookmark-outline"
          title={attempts.length ? 'Nothing in this group' : 'No saved writing yet'}
          message="Tap Save on any writing canvas to keep that attempt here."
          action={attempts.length ? undefined : <Button title="Open the canvas" icon="brush" onPress={() => router.push('/practice/free')} />}
        />
      ) : (
        <View style={s.grid}>
          {list.map((a) => (
            <Pressable key={a.id} onPress={() => setSelected(a)} accessibilityRole="button" accessibilityLabel={`${a.title}, ${formatDateTime(a.createdAt)}`} style={{ width: cell, gap: 6 }}>
              <View style={s.thumb}>
                <StrokePreview strokes={a.strokes} width={a.width} height={a.height} />
              </View>
              <Text style={s.title} numberOfLines={1}>
                {a.title}
              </Text>
              <Text style={s.meta}>{formatDateTime(a.createdAt)}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  thumb: { aspectRatio: 1, backgroundColor: c.canvas, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, padding: 8 },
  title: { fontFamily: fonts.medium, fontSize: 13, color: c.text },
  meta: { fontFamily: fonts.regular, fontSize: 12, color: c.textMuted },
  big: { width: '100%', backgroundColor: c.canvas, borderRadius: radius.lg, borderWidth: 1, borderColor: c.border },
  compare: { backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, padding: 8 },
  compareLabel: { fontFamily: fonts.semibold, fontSize: 13, color: c.textMuted },
}));
