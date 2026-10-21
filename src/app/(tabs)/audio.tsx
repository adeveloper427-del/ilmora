import { Ionicons } from '@expo/vector-icons';
import {
  getRecordingPermissionsAsync,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Easing, Linking, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { levelFromDb, Waveform } from '@/components/audio/Waveform';
import { Banner } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { confirm } from '@/lib/confirm';
import { formatClock, formatDateTime } from '@/lib/dates';
import { useFeedback } from '@/lib/feedback';
import { NO_AUDIO } from '@/components/audio/useQuickRecorder';
import { discardRawRecording, EmptyRecordingError } from '@/lib/audioStore';
import { useRecordings } from '@/state/RecordingsProvider';
import { useSettings } from '@/state/SettingsProvider';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/typography';

type Phase = 'idle' | 'starting' | 'recording' | 'paused' | 'review';

const OPTIONS = { ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true, directory: 'document' as const };

export default function AudioScreen() {
  const s = useStyles();
  const { c } = useTheme();
  const fb = useFeedback();
  const { settings } = useSettings();
  const { recordings, add } = useRecordings();
  const params = useLocalSearchParams<{ lesson?: string }>();

  const recorder = useAudioRecorder(OPTIONS);
  const recState = useAudioRecorderState(recorder, 100);
  const player = useAudioPlayer(null, { updateInterval: 100 });
  const status = useAudioPlayerStatus(player);

  const [phase, setPhase] = useState<Phase>('idle');
  const [levels, setLevels] = useState<number[]>([]);
  const [error, setError] = useState<{ text: string; settings?: boolean } | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [take, setTake] = useState<{ uri: string; durationMs: number; createdAt: number } | null>(null);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const lessonRef = typeof params.lesson === 'string' && params.lesson ? params.lesson : undefined;
  const pulse = useState(() => new Animated.Value(1))[0];

  // Sample real microphone levels for the waveform while recording.
  useEffect(() => {
    if (phase !== 'recording') return;
    const id = setInterval(() => {
      const st = recorder.getStatus();
      if (st.isRecording) setLevels((l) => [...l, levelFromDb(st.metering)].slice(-2000));
    }, 100);
    return () => clearInterval(id);
  }, [phase, recorder]);

  useEffect(() => {
    if (phase !== 'recording') {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [phase, pulse]);

  useEffect(() => {
    if (status.didJustFinish) player.seekTo(0).catch(() => {});
  }, [status.didJustFinish, player]);

  const ensurePermission = async (): Promise<boolean> => {
    let perm = await getRecordingPermissionsAsync();
    if (!perm.granted && perm.canAskAgain) perm = await requestRecordingPermissionsAsync();
    if (perm.granted) return true;
    setError(
      perm.canAskAgain
        ? { text: 'ILMORA needs the microphone to record you. Tap the microphone again and choose Allow.' }
        : { text: 'Microphone access is turned off for ILMORA. Turn it on in your phone settings to record.', settings: Platform.OS !== 'web' },
    );
    return false;
  };

  const start = async () => {
    setError(null);
    setSavedMsg(null);
    setPhase('starting');
    try {
      if (!(await ensurePermission())) {
        setPhase('idle');
        return;
      }
      player.pause();
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setLevels([]);
      setPhase('recording');
      fb.tap();
    } catch (e) {
      console.warn('[audio] start failed', e);
      setError({ text: 'Recording could not start. Close other apps using the microphone and try again.' });
      setPhase('idle');
    }
  };

  const pause = () => {
    try {
      recorder.pause();
      setPhase('paused');
    } catch {
      setError({ text: 'This device could not pause the recording. You can stop and save it instead.' });
    }
  };

  const resume = () => {
    try {
      recorder.record();
      setPhase('recording');
    } catch {
      setError({ text: 'Recording could not resume. Stop to keep what you have so far.' });
    }
  };

  const stop = async () => {
    const durationMs = recState.durationMillis;
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: settings.playInSilentMode });
      const uri = recorder.uri;
      if (!uri) throw new Error('No file');
      setTake({ uri, durationMs, createdAt: Date.now() });
      player.replace({ uri });
      setTitle(lessonRef ? `${lessonRef} — recitation` : 'Practice recording');
      setPhase('review');
      fb.success();
    } catch (e) {
      console.warn('[audio] stop failed', e);
      setError({ text: 'The recording could not be saved. Please try again.' });
      setPhase('idle');
    }
  };

  const togglePlay = async () => {
    if (status.playing) return player.pause();
    if (status.duration > 0 && status.currentTime >= status.duration - 0.05) await player.seekTo(0);
    player.play();
  };

  const save = async () => {
    if (!take) return;
    const finalTitle = title.trim() || 'Practice recording';
    player.pause();
    setSaving(true);
    try {
      await add({ title: finalTitle, lessonRef, uri: take.uri, durationMs: take.durationMs });
    } catch (e) {
      console.warn('[audio] save failed', e);
      setError({ text: e instanceof EmptyRecordingError ? NO_AUDIO : 'The recording could not be saved. Check that your device has free space and try again.' });
      return;
    } finally {
      setSaving(false);
    }
    setTake(null);
    setLevels([]);
    setTitle('');
    setPhase('idle');
    setSavedMsg(`“${finalTitle}” saved.`);
    if (lessonRef) router.setParams({ lesson: '' });
  };

  const discard = async () => {
    if (!(await confirm('Delete this recording?', 'It has not been saved and will be lost.'))) return;
    player.pause();
    if (take) discardRawRecording(take.uri);
    setTake(null);
    setLevels([]);
    setPhase('idle');
  };

  const recording = phase === 'recording' || phase === 'paused';
  const playProgress = status.duration > 0 ? status.currentTime / status.duration : 0;
  const clock = phase === 'review' ? formatClock((status.playing || status.currentTime > 0 ? status.currentTime : status.duration) * 1000) : formatClock(recState.durationMillis);

  return (
    <Screen keyboard>
      <ScreenHeader
        title="Audio"
        arabic="تسجيل"
        subtitle="Record yourself reading and listen back"
        back={false}
        right={
          <Pressable onPress={() => router.push('/recordings')} accessibilityRole="button" accessibilityLabel={`Saved recordings, ${recordings.length}`} style={s.savedBtn}>
            <Ionicons name="albums-outline" size={18} color={c.primary} />
            <Text style={s.savedBtnText}>{recordings.length}</Text>
          </Pressable>
        }
      />

      {lessonRef ? <Banner icon="book-outline" text={`Recording for: ${lessonRef}`} /> : null}
      {error ? (
        <View style={{ gap: 8 }}>
          <Banner tone="error" text={error.text} />
          {error.settings ? <Button title="Open settings" variant="ghost" small onPress={() => Linking.openSettings()} /> : null}
        </View>
      ) : null}
      {savedMsg ? <Banner tone="success" text={`${savedMsg} Find it under saved recordings.`} /> : null}

      <Card style={s.stage}>
        <Text style={[s.status, recording && { color: phase === 'recording' ? c.danger : c.gold }]}>
          {phase === 'recording' ? '● Recording' : phase === 'paused' ? 'Paused' : phase === 'review' ? 'Listen back' : phase === 'starting' ? 'Starting…' : 'Ready to record'}
        </Text>
        <Text style={s.clock} accessibilityLabel={`Time ${clock}`}>
          {clock}
        </Text>
        <View style={s.wave}>
          <Waveform levels={levels} color={phase === 'review' ? c.primary : c.gold} muted={c.border} progress={phase === 'review' ? playProgress : undefined} />
        </View>

        {phase === 'review' ? (
          <View style={s.controls}>
            <Pressable onPress={() => player.seekTo(Math.max(0, status.currentTime - 5))} accessibilityRole="button" accessibilityLabel="Back 5 seconds" style={s.smallControl}>
              <Ionicons name="play-back" size={22} color={c.text} />
            </Pressable>
            <Pressable onPress={togglePlay} accessibilityRole="button" accessibilityLabel={status.playing ? 'Pause playback' : 'Play recording'} style={[s.bigControl, { backgroundColor: c.primary }]}>
              <Ionicons name={status.playing ? 'pause' : 'play'} size={34} color={c.onPrimary} style={!status.playing && { marginLeft: 4 }} />
            </Pressable>
            <Pressable onPress={() => player.seekTo(Math.min(status.duration, status.currentTime + 5))} accessibilityRole="button" accessibilityLabel="Forward 5 seconds" style={s.smallControl}>
              <Ionicons name="play-forward" size={22} color={c.text} />
            </Pressable>
          </View>
        ) : (
          <View style={s.controls}>
            <Pressable
              onPress={phase === 'recording' ? pause : resume}
              disabled={!recording}
              accessibilityRole="button"
              accessibilityLabel={phase === 'paused' ? 'Resume recording' : 'Pause recording'}
              style={[s.smallControl, !recording && { opacity: 0.3 }]}
            >
              <Ionicons name={phase === 'paused' ? 'play' : 'pause'} size={22} color={c.text} />
            </Pressable>
            <Animated.View style={{ transform: [{ scale: pulse }] }}>
              <Pressable
                onPress={recording ? stop : start}
                disabled={phase === 'starting'}
                accessibilityRole="button"
                accessibilityLabel={recording ? 'Stop recording' : 'Start recording'}
                style={[s.bigControl, { backgroundColor: recording ? c.danger : c.primary }]}
              >
                <Ionicons name={recording ? 'stop' : 'mic'} size={recording ? 28 : 34} color="#fff" />
              </Pressable>
            </Animated.View>
            <View style={s.smallControl} />
          </View>
        )}
        <Text style={s.hint}>
          {phase === 'idle'
            ? 'Tap the microphone to start. You will be asked for microphone access the first time.'
            : phase === 'recording'
              ? 'Pause to take a breath, or stop when you are finished.'
              : phase === 'paused'
                ? 'Tap play to continue recording.'
                : phase === 'review'
                  ? 'Listen, then save or delete and record again.'
                  : ''}
        </Text>
      </Card>

      {phase === 'review' ? (
        <Card style={{ gap: 12 }}>
          <Text style={s.label}>Name this recording</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="e.g. Al-Ikhlas 112:1 — first try" placeholderTextColor={c.textFaint} style={s.input} maxLength={80} accessibilityLabel="Recording name" />
          <Text style={s.meta}>{take ? `${formatClock(take.durationMs)} · ${formatDateTime(take.createdAt)}` : ''}</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button title="Delete" variant="danger" icon="trash-outline" onPress={discard} style={{ flex: 1 }} />
            <Button title="Save" icon="checkmark" onPress={save} loading={saving} style={{ flex: 2 }} />
          </View>
        </Card>
      ) : null}

      <Text style={s.note}>ILMORA does not grade recitation or tajwīd. Recordings are for you (and your teacher) to listen to.</Text>
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  savedBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, height: 38, borderRadius: radius.pill, backgroundColor: c.primaryTint },
  savedBtnText: { fontFamily: fonts.semibold, fontSize: 14, color: c.primary },
  stage: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  status: { fontFamily: fonts.semibold, fontSize: 13, color: c.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  clock: { fontFamily: fonts.bold, fontSize: 48, color: c.text, fontVariant: ['tabular-nums'] },
  wave: { alignSelf: 'stretch', marginVertical: 12 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 28, marginTop: 4 },
  bigControl: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', elevation: 3, shadowColor: c.shadow, shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  smallControl: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceAlt },
  hint: { fontFamily: fonts.regular, fontSize: 13, color: c.textMuted, textAlign: 'center', marginTop: 10, paddingHorizontal: 12 },
  label: { fontFamily: fonts.medium, fontSize: 14, color: c.text },
  input: { minHeight: 50, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, backgroundColor: c.bg, paddingHorizontal: 14, fontFamily: fonts.regular, fontSize: 16, color: c.text },
  meta: { fontFamily: fonts.regular, fontSize: 12, color: c.textMuted },
  note: { fontFamily: fonts.regular, fontSize: 12, color: c.textFaint, textAlign: 'center', lineHeight: 18 },
}));
