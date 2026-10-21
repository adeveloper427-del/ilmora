import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RecitationBar } from '@/components/audio/RecitationBar';
import { useQuickRecorder } from '@/components/audio/useQuickRecorder';
import { useRecitation } from '@/components/audio/useRecitation';
import { MushafText, SurahBanner } from '@/components/hifz/Mushaf';
import { Banner, EmptyState } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { ProgressRing } from '@/components/ui/Progress';
import { BASMALA, getHifzSurah, HIFZ_ORDER, HIFZ_SOURCE, verseWords } from '@/data/hifz';
import { formatClock } from '@/lib/dates';
import { useFeedback } from '@/lib/feedback';
import { useHifz } from '@/state/HifzProvider';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/typography';
import type { IconName } from '@/components/ui/Button';

const FONT_SIZES = [22, 26, 30, 36];

export default function MemorizeSurah() {
  const s = useStyles();
  const { c } = useTheme();
  const fb = useFeedback();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ surah: string }>();
  const surah = getHifzSurah(Number(params.surah));
  const hifz = useHifz();

  const [hidden, setHidden] = useState(true);
  const [revealed, setRevealed] = useState<Record<string, number>>({});
  const [idx, setIdx] = useState(0);
  const [checking, setChecking] = useState(false);
  const [session, setSession] = useState({ correct: 0, mistakes: 0, hints: 0 });
  const [sizeIdx, setSizeIdx] = useState(1);
  const [lastChecked, setLastChecked] = useState<string | undefined>();

  const recitation = useRecitation();
  const rec = useQuickRecorder(surah ? `${surah.name} — memorization` : 'Memorization', surah ? `Hifz: Surah ${surah.name}` : 'Hifz');

  const { setLastSurah } = hifz;
  useEffect(() => {
    if (surah) setLastSurah(surah.number);
  }, [surah, setLastSurah]);

  const verse = surah?.verses[idx];
  const done = !!surah && idx >= surah.verses.length;
  const wordCount = verse ? verseWords(verse.text).length : 0;

  const reveal = (key: string, upTo: number, asHint: boolean) => {
    const prev = revealed[key] ?? 0;
    if (upTo <= prev) return;
    if (asHint) setSession((ss) => ({ ...ss, hints: ss.hints + (upTo - prev) }));
    setRevealed({ ...revealed, [key]: upTo });
  };

  if (!surah) {
    return (
      <SafeAreaView style={s.root}>
        <EmptyState icon="alert-circle-outline" title="Surah not available" message="Memorization currently covers Al-Fātiḥah and Juz ʿAmma." action={<Button title="Back to memorize" onPress={() => router.replace('/memorize')} />} />
      </SafeAreaView>
    );
  }

  const stats = hifz.surahStats(surah.number);
  const graded = session.correct + session.mistakes;
  const accuracy = graded ? Math.round((session.correct / graded) * 100) : 100;
  const next = HIFZ_ORDER[HIFZ_ORDER.indexOf(surah) + 1];
  const meta = verse ?? surah.verses[surah.verses.length - 1];

  const peek = () => {
    if (!verse || checking || !hidden) return;
    const shown = revealed[verse.key] ?? 0;
    reveal(verse.key, shown + 1, true);
    if (shown + 1 >= wordCount) setChecking(true);
  };

  const check = () => {
    if (!verse || !hidden) return;
    reveal(verse.key, wordCount, false);
    setLastChecked(verse.key);
    setChecking(true);
  };

  const grade = (ok: boolean) => {
    if (!verse) return;
    hifz.grade(verse.key, ok);
    if (ok) fb.success();
    else fb.warn();
    setSession((ss) => ({ ...ss, correct: ss.correct + (ok ? 1 : 0), mistakes: ss.mistakes + (ok ? 0 : 1) }));
    setChecking(false);
    setIdx((i) => i + 1);
  };

  const restart = () => {
    setRevealed({});
    setIdx(0);
    setChecking(false);
    setHidden(true);
    setLastChecked(undefined);
    setSession({ correct: 0, mistakes: 0, hints: 0 });
  };

  const listen = () => {
    if (recitation.active) return recitation.stop();
    const start = done ? 0 : idx;
    recitation.play(
      surah.verses.map((v) => v.key),
      start,
      start === 0 && surah.bismillahPre && surah.number !== 1,
    );
  };

  const toggleRecording = () => {
    // Don't capture the reciter's voice in the student's own recording.
    if (!rec.isRecording) recitation.stop();
    rec.toggle();
  };

  const onWordPress = (key: string, i: number) => {
    if (!hidden || !verse || key !== verse.key || checking) return;
    reveal(key, i + 1, true);
    if (i + 1 >= wordCount) setChecking(true);
  };

  const onVersePress = (key: string) => {
    const i = surah.verses.findIndex((v) => v.key === key);
    if (i < 0 || !hidden) return;
    setIdx(i);
    setChecking((revealed[key] ?? 0) >= verseWords(surah.verses[i].text).length);
  };

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      <View style={s.top}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={8} style={s.iconBtn}>
          <Ionicons name="chevron-back" size={24} color={c.text} />
        </Pressable>
        <View style={s.titleCard}>
          <Text style={s.title} numberOfLines={1}>
            {surah.name}
          </Text>
          <Text style={s.meta} numberOfLines={1}>
            {width < 380 ? `p. ${meta.page}` : `Page ${meta.page}`} | Juz {meta.juz} | Hizb {meta.hizb}
          </Text>
        </View>
        <Pressable
          onPress={() => setSizeIdx((i) => (i + 1) % FONT_SIZES.length)}
          accessibilityRole="button"
          accessibilityLabel="Change text size"
          hitSlop={6}
          style={s.iconBtn}
        >
          <Text style={s.aa}>Aa</Text>
        </Pressable>
        <Pressable
          onPress={listen}
          accessibilityRole="button"
          accessibilityLabel={recitation.active ? 'Stop recitation' : 'Listen to the recitation'}
          hitSlop={6}
          style={[s.iconBtn, recitation.active && { backgroundColor: c.goldTint }]}
        >
          <Ionicons name={recitation.active ? 'volume-high' : 'volume-medium-outline'} size={22} color={recitation.active ? c.gold : c.text} />
        </Pressable>
        <ProgressRing value={stats.memorized / stats.total} size={40} stroke={4} label={`${stats.memorized}`} color={c.gold} />
      </View>

      <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
        <SurahBanner arabicName={surah.arabicName} width={Math.min(width, 700) - 32} />
        {surah.bismillahPre && surah.number !== 1 ? <Text style={s.basmala}>{BASMALA}</Text> : null}
        <MushafText
          verses={surah.verses}
          revealed={revealed}
          hidden={hidden}
          currentKey={done ? undefined : verse?.key}
          checkedKey={checking ? lastChecked : undefined}
          playingKey={recitation.isBasmala ? null : recitation.playingKey}
          fontSize={FONT_SIZES[sizeIdx]}
          onWordPress={onWordPress}
          onVersePress={onVersePress}
        />
        {done ? (
          <View style={s.doneCard}>
            <Text style={s.doneTitle}>Surah complete</Text>
            <Text style={s.doneText}>
              {session.correct} correct · {session.mistakes} with mistakes · {session.hints} word hints
            </Text>
            <Text style={s.doneText}>
              {stats.memorized} of {stats.total} verses memorized (recited correctly on 3 different days)
            </Text>
            <Button title="Recite again" icon="refresh" variant="secondary" onPress={restart} />
            {next ? <Button title={`Next: ${next.name}`} icon="arrow-forward" onPress={() => router.replace(`/memorize/${next.number}`)} /> : null}
          </View>
        ) : null}
        <Text style={s.source}>{HIFZ_SOURCE}</Text>
      </ScrollView>

      {rec.message ? (
        <View style={{ paddingHorizontal: 16 }}>
          <Banner tone={rec.message.tone === 'ok' ? 'success' : 'error'} text={rec.message.text} />
        </View>
      ) : null}
      {recitation.error ? (
        <View style={{ paddingHorizontal: 16 }}>
          <Banner tone="error" text={recitation.error} />
        </View>
      ) : null}
      {recitation.active ? (
        <View style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
          <RecitationBar
            rec={recitation}
            label={
              recitation.isBasmala
                ? 'Basmala'
                : `Verse ${recitation.playingKey?.split(':')[1]} of ${surah.verses.length}`
            }
          />
        </View>
      ) : null}

      <View style={s.bottom}>
        <View style={s.statsRow}>
          <View style={s.chip} accessible accessibilityLabel={`${session.mistakes} mistakes`}>
            <Ionicons name="close-circle" size={18} color={c.danger} />
            <Text style={s.chipText}>{session.mistakes}</Text>
          </View>
          <View style={s.chip} accessible accessibilityLabel={`${session.hints} word hints, accuracy ${accuracy} percent`}>
            <Text style={s.chipText}>{session.hints} hints</Text>
            <View style={s.divider} />
            <Text style={s.chipText}>{accuracy}%</Text>
          </View>
          {rec.isRecording ? (
            <View style={[s.chip, { backgroundColor: c.dangerTint }]}>
              <Ionicons name="radio-button-on" size={14} color={c.danger} />
              <Text style={[s.chipText, { color: c.danger }]}>{formatClock(rec.durationMs)}</Text>
            </View>
          ) : null}
        </View>

        <View style={s.controls}>
          {checking && !done ? (
            <View style={s.gradeRow}>
              <Text style={s.gradeQ}>Did you recite verse {verse?.number} correctly?</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button title="Mistake" variant="danger" icon="close" small onPress={() => grade(false)} style={{ flex: 1 }} />
                <Button title="Correct" icon="checkmark" small onPress={() => grade(true)} style={{ flex: 1 }} />
              </View>
            </View>
          ) : (
            <View style={s.tools}>
              <Tool icon={hidden ? 'eye-off' : 'eye'} label={hidden ? 'Hidden' : 'Showing'} onPress={() => setHidden((h) => !h)} active={!hidden} />
              <Tool icon="chevron-back" label="Peek word" onPress={peek} disabled={!hidden || done} />
              <Tool icon="checkmark-done" label="Check verse" onPress={check} disabled={!hidden || done} />
              <Tool icon="refresh" label="Restart" onPress={restart} />
            </View>
          )}
          <Pressable
            onPress={toggleRecording}
            disabled={rec.busy}
            accessibilityRole="button"
            accessibilityLabel={rec.isRecording ? 'Stop and save recitation' : 'Record your recitation'}
            style={[s.mic, { backgroundColor: rec.isRecording ? c.danger : c.primary }, rec.busy && { opacity: 0.6 }]}
          >
            <Ionicons name={rec.isRecording ? 'stop' : 'mic'} size={30} color="#fff" />
          </Pressable>
        </View>
        {!checking && !done && hidden ? <Text style={s.hint}>Recite verse {verse?.number} from memory, then tap Check verse. Tap a hidden word to peek.</Text> : null}
      </View>
    </SafeAreaView>
  );
}

function Tool({ icon, label, onPress, disabled, active }: { icon: IconName; label: string; onPress: () => void; disabled?: boolean; active?: boolean }) {
  const s = useStyles();
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} style={[s.tool, disabled && { opacity: 0.35 }]}>
      <View style={[s.toolIcon, active && { backgroundColor: c.primary }]}>
        <Ionicons name={icon} size={20} color={active ? c.onPrimary : c.text} />
      </View>
      <Text style={s.toolLabel} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.bg },
  top: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.border },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  titleCard: { flex: 1, backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, paddingHorizontal: 10, paddingVertical: 6 },
  title: { fontFamily: fonts.semibold, fontSize: 16, color: c.text },
  meta: { fontFamily: fonts.regular, fontSize: 11.5, color: c.textMuted },
  aa: { fontFamily: fonts.bold, fontSize: 16, color: c.text },
  page: { padding: 16, paddingBottom: 32, gap: 10, maxWidth: 700, width: '100%', alignSelf: 'center' },
  basmala: { fontFamily: fonts.arabic, fontSize: 24, lineHeight: 46, color: c.text, textAlign: 'center' },
  doneCard: { backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: c.border, padding: 16, gap: 10, marginTop: 8 },
  doneTitle: { fontFamily: fonts.bold, fontSize: 18, color: c.text },
  doneText: { fontFamily: fonts.regular, fontSize: 14, color: c.textMuted },
  source: { fontFamily: fonts.regular, fontSize: 11, color: c.textFaint, textAlign: 'center', marginTop: 12 },
  bottom: { borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.tabBar, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6, gap: 8 },
  statsRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.surfaceAlt, borderRadius: radius.pill, paddingHorizontal: 12, height: 34 },
  chipText: { fontFamily: fonts.semibold, fontSize: 14, color: c.text },
  divider: { width: 1, height: 16, backgroundColor: c.border },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tools: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  tool: { alignItems: 'center', minWidth: 58 },
  toolIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  toolLabel: { fontFamily: fonts.medium, fontSize: 11, color: c.textMuted, marginTop: 3 },
  gradeRow: { flex: 1, gap: 6 },
  gradeQ: { fontFamily: fonts.semibold, fontSize: 14, color: c.text },
  mic: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: c.shadow, shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  hint: { fontFamily: fonts.regular, fontSize: 12, color: c.textMuted, textAlign: 'center' },
}));
