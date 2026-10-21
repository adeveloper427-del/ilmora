import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { ListenButton } from '@/components/audio/ListenButton';
import { WritingLesson } from '@/components/lesson/WritingLesson';
import { ArabicText, Banner, EmptyState } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { lessonKey } from '@/data/curriculum';
import { getVerse, QURAN_SOURCE, verseParts } from '@/data/quran';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/typography';

export default function VerseLesson() {
  const s = useStyles();
  const { c } = useTheme();
  const { key } = useLocalSearchParams<{ key: string }>();
  const found = getVerse(key);

  if (!found) {
    return (
      <Screen>
        <ScreenHeader title="Verse not found" />
        <EmptyState icon="alert-circle-outline" title="This verse is not in the practice set" message="Choose a verse from the list." action={<Button title="All verses" onPress={() => router.replace('/learn/quran')} />} />
      </Screen>
    );
  }

  const { surah, verse } = found;
  const parts = verseParts(verse.text);
  const next = surah.verses.find((v) => v.number === verse.number + 1);
  const reference = `${surah.name} ${verse.key}`;

  return (
    <WritingLesson
      key={verse.key}
      lessonKey={lessonKey.quran(verse.key)}
      title={reference}
      subtitle={`Surah ${surah.name} · Verse ${verse.number}`}
      kind="quran"
      refId={verse.key}
      parts={parts}
      intro={
        <>
          <Card style={s.verseCard}>
            <View style={s.surahTag}>
              <Text style={s.surahTagText}>
                {surah.name} · {surah.meaning}
              </Text>
              <ArabicText size={18} color={c.gold}>
                {`سورة ${surah.arabicName}`}
              </ArabicText>
            </View>
            <ArabicText size={34} color={c.text}>
              {verse.text}
            </ArabicText>
            <View style={s.ayahNo}>
              <Text style={s.ayahNoText}>{verse.number}</Text>
            </View>
          </Card>
          <ListenButton verseKey={verse.key} />
          <Text style={s.source}>Text source: {QURAN_SOURCE}</Text>
        </>
      }
      example={
        <>
          <Banner
            text={
              parts.length > 1
                ? `This verse is practised in ${parts.length} parts so each word stays large and clear. For every part you will trace first, then write it from memory.`
                : 'You will trace the verse first, then write it from memory with the guide hidden.'
            }
          />
          {parts.map((p, i) => (
            <Card key={i} style={s.partCard}>
              {parts.length > 1 ? <Text style={s.partLabel}>Part {i + 1}</Text> : null}
              <ArabicText size={30} color={c.primary}>
                {p}
              </ArabicText>
            </Card>
          ))}
          <Banner icon="bulb-outline" text="Write each letter first, then add the vowel marks (ḥarakāt) once the word is complete." />
        </>
      }
      completionActions={
        <Button
          title="Record your recitation"
          variant="secondary"
          icon="mic-outline"
          onPress={() => router.push({ pathname: '/(tabs)/audio', params: { lesson: reference } })}
        />
      }
      next={next ? { label: `Next verse: ${surah.number}:${next.number}`, onPress: () => router.replace(`/learn/quran/${next.key}`) } : undefined}
      backToList={{ label: 'All verses', route: '/learn/quran' }}
    />
  );
}

const useStyles = makeStyles((c) => ({
  verseCard: { alignItems: 'center', gap: 6, paddingVertical: 18 },
  surahTag: { alignItems: 'center' },
  surahTagText: { fontFamily: fonts.medium, fontSize: 13, color: c.textMuted },
  ayahNo: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: c.gold, alignItems: 'center', justifyContent: 'center' },
  ayahNoText: { fontFamily: fonts.semibold, fontSize: 13, color: c.gold },
  source: { fontFamily: fonts.regular, fontSize: 12, color: c.textFaint, textAlign: 'center' },
  partCard: { paddingVertical: 6, borderRadius: radius.md },
  partLabel: { fontFamily: fonts.medium, fontSize: 12, color: c.gold, marginTop: 6 },
}));
