import { Ionicons } from '@expo/vector-icons';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { EmptyState } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/Progress';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { playableUri, recordingHealth, RecordingHealth } from '@/lib/audioStore';
import { confirm } from '@/lib/confirm';
import { formatClock, formatDateTime } from '@/lib/dates';
import { Recording, useRecordings } from '@/state/RecordingsProvider';
import { useSettings } from '@/state/SettingsProvider';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/typography';

const PROBLEM_TEXT: Record<Exclude<RecordingHealth, 'ok'> | 'unplayable', string> = {
  empty: 'No sound was captured in this recording, so there is nothing to play. Delete it and record again.',
  missing: 'The audio for this recording is no longer on this device. Delete it and record again.',
  unplayable: 'This audio could not be decoded. The file is incomplete — delete it and record again.',
};

export default function Recordings() {
  const s = useStyles();
  const { c } = useTheme();
  const { settings } = useSettings();
  const { recordings, remove } = useRecordings();
  const player = useAudioPlayer(null, { updateInterval: 200 });
  const status = useAudioPlayerStatus(player);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [health, setHealth] = useState<Record<string, RecordingHealth>>({});
  const [unplayable, setUnplayable] = useState<Record<string, true>>({});
  const active = useRef<{ id: string; uri: string; retried: boolean } | null>(null);

  useEffect(() => {
    setAudioModeAsync({ allowsRecording: false, playsInSilentMode: settings.playInSilentMode }).catch(() => {});
  }, [settings.playInSilentMode]);

  // Check each recording's stored audio up front so broken ones are flagged before anyone taps play.
  useEffect(() => {
    let cancelled = false;
    Promise.all(recordings.map(async (r) => [r.id, await recordingHealth(r.uri)] as const)).then((pairs) => {
      if (!cancelled) setHealth(Object.fromEntries(pairs));
    });
    return () => {
      cancelled = true;
    };
  }, [recordings]);

  useEffect(() => {
    if (status.didJustFinish) player.seekTo(0).catch(() => {});
  }, [status.didJustFinish, player]);

  // Load/decode failures arrive as status events, not exceptions. Retry once with a freshly built
  // source (a stale object URL is recoverable); a second failure means the audio itself is bad.
  useEffect(() => {
    const sub = player.addListener('playbackStatusUpdate', (st) => {
      const cur = active.current;
      if (!st.error || !cur) return;
      if (!cur.retried) {
        cur.retried = true;
        playableUri(cur.uri, true)
          .then((uri) => {
            player.replace({ uri });
            player.play();
          })
          .catch(() => setUnplayable((u) => ({ ...u, [cur.id]: true })));
        return;
      }
      setUnplayable((u) => ({ ...u, [cur.id]: true }));
      setActiveId(null);
    });
    return () => sub.remove();
  }, [player]);

  const problemOf = (r: Recording): keyof typeof PROBLEM_TEXT | null => {
    const h = health[r.id];
    if (h === 'empty' || h === 'missing') return h;
    return unplayable[r.id] ? 'unplayable' : null;
  };

  const toggle = async (r: Recording) => {
    if (problemOf(r)) return;
    if (activeId !== r.id) {
      try {
        active.current = { id: r.id, uri: r.uri, retried: false };
        player.replace({ uri: await playableUri(r.uri) });
        setActiveId(r.id);
        player.play();
      } catch {
        setHealth((h) => ({ ...h, [r.id]: 'missing' }));
      }
      return;
    }
    if (status.playing) player.pause();
    else {
      if (status.duration > 0 && status.currentTime >= status.duration - 0.05) await player.seekTo(0);
      player.play();
    }
  };

  const del = async (r: Recording) => {
    if (!(await confirm('Delete recording?', `“${r.title}” will be permanently removed from this device.`))) return;
    if (activeId === r.id) {
      player.pause();
      setActiveId(null);
      active.current = null;
    }
    remove(r.id);
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader title="Saved recordings" arabic="التسجيلات" subtitle={`${recordings.length} recording${recordings.length === 1 ? '' : 's'}`} />
      {recordings.length === 0 ? (
        <EmptyState
          icon="mic-off-outline"
          title="No recordings yet"
          message="Record yourself reading a lesson or a verse, then save it to listen back here."
          action={<Button title="Open recorder" icon="mic" onPress={() => router.replace('/(tabs)/audio')} />}
        />
      ) : (
        recordings.map((r) => {
          const isActive = activeId === r.id;
          const playing = isActive && status.playing;
          const problem = problemOf(r);
          return (
            <Card key={r.id} style={[{ gap: 10 }, problem && { borderColor: c.danger }]}>
              <View style={s.row}>
                <Pressable
                  onPress={() => toggle(r)}
                  disabled={!!problem}
                  accessibilityRole="button"
                  accessibilityLabel={`${playing ? 'Pause' : 'Play'} ${r.title}`}
                  accessibilityState={{ disabled: !!problem }}
                  style={[s.play, { backgroundColor: problem ? c.surfaceAlt : playing ? c.gold : c.primary }]}
                >
                  <Ionicons name={problem ? 'alert' : playing ? 'pause' : 'play'} size={22} color={problem ? c.danger : '#fff'} style={!playing && !problem && { marginLeft: 3 }} />
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Text style={s.title} numberOfLines={2}>
                    {r.title}
                  </Text>
                  <Text style={s.meta}>
                    {formatDateTime(r.createdAt)} · {formatClock(r.durationMs)}
                  </Text>
                  {r.lessonRef ? (
                    <Text style={s.lesson} numberOfLines={1}>
                      <Ionicons name="book-outline" size={12} /> {r.lessonRef}
                    </Text>
                  ) : null}
                </View>
                <Pressable onPress={() => del(r)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Delete ${r.title}`} style={s.delete}>
                  <Ionicons name="trash-outline" size={20} color={c.danger} />
                </Pressable>
              </View>
              {problem ? (
                <View style={s.problem} accessibilityLiveRegion="polite">
                  <Ionicons name="alert-circle" size={16} color={c.danger} style={{ marginTop: 1 }} />
                  <Text style={s.problemText}>{PROBLEM_TEXT[problem]}</Text>
                </View>
              ) : isActive ? (
                <View style={{ gap: 4 }}>
                  <ProgressBar value={status.duration ? status.currentTime / status.duration : 0} height={5} />
                  <Text style={s.meta}>
                    {formatClock(status.currentTime * 1000)} / {formatClock((status.duration || r.durationMs / 1000) * 1000)}
                  </Text>
                </View>
              ) : null}
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  play: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.semibold, fontSize: 15, color: c.text },
  meta: { fontFamily: fonts.regular, fontSize: 12, color: c.textMuted, marginTop: 2 },
  lesson: { fontFamily: fonts.regular, fontSize: 12, color: c.gold, marginTop: 2 },
  delete: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  problem: { flexDirection: 'row', gap: 8, backgroundColor: c.dangerTint, borderRadius: radius.sm, padding: 10 },
  problemText: { flex: 1, fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: c.danger },
}));
