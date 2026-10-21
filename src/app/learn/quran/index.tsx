import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ArabicText, Banner } from '@/components/ui/Bits';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/Progress';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { LEVELS, lessonKey, levelProgress } from '@/data/curriculum';
import { QURAN_SOURCE, SURAHS, verseLength, verseParts } from '@/data/quran';
import { useProgress } from '@/state/ProgressProvider';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/typography';

// Shortest surahs first so students build up to longer passages.
const ORDERED = [...SURAHS].sort((a, b) => a.verses.reduce((n, v) => n + verseLength(v), 0) - b.verses.reduce((n, v) => n + verseLength(v), 0));

export default function QuranList() {
  const s = useStyles();
  const { c } = useTheme();
  const { isCompleted } = useProgress();
  const [open, setOpen] = useState<number | null>(ORDERED[0].number);
  const p = levelProgress(LEVELS[4], isCompleted);

  return (
    <Screen>
      <ScreenHeader title="Quranic writing" arabic="كتابة القرآن" subtitle="Level 5 · Short verses, carefully" />
      <Banner icon="shield-checkmark-outline" text={`Verse text is reproduced exactly from a verified source with all its diacritics: ${QURAN_SOURCE}. Please treat the screen with the respect due to the Quran.`} />
      <View style={{ gap: 6 }}>
        <ProgressBar value={p.ratio} />
        <Text style={s.meta}>
          {p.done} of {p.total} verses written
        </Text>
      </View>

      {ORDERED.map((surah) => {
        const done = surah.verses.filter((v) => isCompleted(lessonKey.quran(v.key))).length;
        const expanded = open === surah.number;
        return (
          <Card key={surah.number} style={{ padding: 0 }}>
            <Pressable
              onPress={() => setOpen(expanded ? null : surah.number)}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              accessibilityLabel={`Surah ${surah.name}, ${surah.verses.length} verses`}
              style={s.surahHead}
            >
              <View style={s.number}>
                <Text style={s.numberText}>{surah.number}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.title}>{surah.name}</Text>
                <Text style={s.meta}>
                  {surah.meaning} · {done}/{surah.verses.length} written
                </Text>
              </View>
              <ArabicText size={22} color={c.primary}>
                {surah.arabicName}
              </ArabicText>
              <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={c.textFaint} />
            </Pressable>
            {expanded
              ? surah.verses.map((v) => {
                  const complete = isCompleted(lessonKey.quran(v.key));
                  const parts = verseParts(v.text).length;
                  return (
                    <Pressable
                      key={v.key}
                      onPress={() => router.push(`/learn/quran/${v.key}`)}
                      accessibilityRole="button"
                      accessibilityLabel={`Verse ${v.number}${complete ? ', written' : ''}`}
                      style={({ pressed }) => [s.verse, pressed && { backgroundColor: c.surfaceAlt }]}
                    >
                      <View style={s.verseMeta}>
                        <Ionicons name={complete ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={complete ? c.success : c.textFaint} />
                        <Text style={s.verseKey}>{v.key}</Text>
                        {parts > 1 ? <Text style={s.parts}>{parts} parts</Text> : null}
                      </View>
                      <ArabicText size={24} center={false} style={{ flex: 1 }}>
                        {v.text}
                      </ArabicText>
                    </Pressable>
                  );
                })
              : null}
          </Card>
        );
      })}
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  meta: { fontFamily: fonts.regular, fontSize: 13, color: c.textMuted },
  surahHead: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  number: { width: 38, height: 38, borderRadius: 12, backgroundColor: c.goldTint, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontFamily: fonts.bold, fontSize: 14, color: c.gold },
  title: { fontFamily: fonts.semibold, fontSize: 16, color: c.text },
  verse: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 6, borderTopWidth: 1, borderTopColor: c.border },
  verseMeta: { width: 64, gap: 2 },
  verseKey: { fontFamily: fonts.medium, fontSize: 12, color: c.textMuted },
  parts: { fontFamily: fonts.regular, fontSize: 11, color: c.gold },
}));
