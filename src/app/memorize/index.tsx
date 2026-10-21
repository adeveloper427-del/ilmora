import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { ArabicText, Banner, StatTile } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { GeometricPattern } from '@/components/ui/Pattern';
import { ProgressBar } from '@/components/ui/Progress';
import { Screen, ScreenHeader, SectionTitle } from '@/components/ui/Screen';
import { getHifzSurah, HIFZ_ORDER, HIFZ_TOTAL_VERSES } from '@/data/hifz';
import { useHifz } from '@/state/HifzProvider';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/typography';

export default function MemorizeHub() {
  const s = useStyles();
  const { c } = useTheme();
  const hifz = useHifz();
  const last = hifz.lastSurah ? getHifzSurah(hifz.lastSurah) : undefined;

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader title="Memorize" arabic="الحِفظ" subtitle="Al-Fātiḥah and Juz ʿAmma" />

      <Card tone="primary" style={{ gap: 12 }}>
        <GeometricPattern color="#C6A15B" opacity={0.15} size={52} />
        <Text style={s.heroLabel}>Verses memorized</Text>
        <Text style={s.heroValue}>
          {hifz.memorizedCount} <Text style={s.heroOf}>of {HIFZ_TOTAL_VERSES}</Text>
        </Text>
        <ProgressBar value={hifz.memorizedCount / HIFZ_TOTAL_VERSES} color="#D9B871" track="rgba(255,255,255,0.18)" />
        {hifz.dueKeys.length ? (
          <Button title={`Review ${hifz.dueKeys.length} due verse${hifz.dueKeys.length === 1 ? '' : 's'}`} variant="gold" icon="repeat" onPress={() => router.push('/memorize/review')} />
        ) : (
          <Text style={s.heroHint}>{hifz.learningCount || hifz.memorizedCount ? 'Nothing due for review today.' : 'Pick a surah below to begin.'}</Text>
        )}
      </Card>

      <View style={s.tiles}>
        <StatTile icon="checkmark-done" value={`${hifz.memorizedCount}`} label="memorized" />
        <StatTile icon="leaf" tint={c.gold} value={`${hifz.learningCount}`} label="learning" />
        <StatTile icon="repeat" value={`${hifz.dueKeys.length}`} label="due today" />
      </View>

      {last ? (
        <Card onPress={() => router.push(`/memorize/${last.number}`)} style={s.row} accessibilityLabel={`Continue ${last.name}`}>
          <View style={s.play}>
            <Ionicons name="play" size={18} color={c.onPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.overline}>Continue</Text>
            <Text style={s.name}>{last.name}</Text>
          </View>
          <ArabicText size={22} color={c.primary}>
            {last.arabicName}
          </ArabicText>
        </Card>
      ) : null}

      <Banner text="Recite each verse aloud from memory, then reveal it and mark whether you were right. ILMORA does not listen to or judge your recitation — you (or your teacher) do. A verse counts as memorized after you recite it correctly on three different days." />

      <SectionTitle title="Surahs" />
      {HIFZ_ORDER.map((surah) => {
        const st = hifz.surahStats(surah.number);
        const complete = st.memorized === st.total;
        return (
          <Card key={surah.number} onPress={() => router.push(`/memorize/${surah.number}`)} style={{ gap: 10 }} accessibilityLabel={`${surah.name}, ${st.memorized} of ${st.total} memorized`}>
            <View style={s.row}>
              <View style={[s.num, complete && { backgroundColor: c.success }]}>
                {complete ? <Ionicons name="checkmark" size={16} color="#fff" /> : <Text style={s.numText}>{surah.number}</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{surah.name}</Text>
                <Text style={s.meta}>
                  {surah.meaning} · {surah.verses.length} verses
                </Text>
              </View>
              <ArabicText size={22} color={c.primary}>
                {surah.arabicName}
              </ArabicText>
            </View>
            {st.memorized || st.learning ? (
              <View style={{ gap: 4 }}>
                <ProgressBar value={st.memorized / st.total} height={6} />
                <Text style={s.meta}>
                  {st.memorized}/{st.total} memorized{st.learning ? ` · ${st.learning} learning` : ''}
                </Text>
              </View>
            ) : null}
          </Card>
        );
      })}
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  heroLabel: { fontFamily: fonts.medium, fontSize: 13, color: '#CFE1D6', textTransform: 'uppercase', letterSpacing: 1 },
  heroValue: { fontFamily: fonts.bold, fontSize: 30, color: '#fff' },
  heroOf: { fontFamily: fonts.regular, fontSize: 16, color: '#CFE1D6' },
  heroHint: { fontFamily: fonts.regular, fontSize: 14, color: '#E7F0EA' },
  tiles: { flexDirection: 'row', gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  play: { width: 40, height: 40, borderRadius: 20, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
  overline: { fontFamily: fonts.medium, fontSize: 12, color: c.gold, textTransform: 'uppercase', letterSpacing: 1 },
  num: { width: 36, height: 36, borderRadius: 12, backgroundColor: c.goldTint, alignItems: 'center', justifyContent: 'center' },
  numText: { fontFamily: fonts.bold, fontSize: 13, color: c.gold },
  name: { fontFamily: fonts.semibold, fontSize: 15, color: c.text },
  meta: { fontFamily: fonts.regular, fontSize: 12, color: c.textMuted },
}));
