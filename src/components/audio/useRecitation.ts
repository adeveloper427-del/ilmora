import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BASMALA_KEY, verseAudioUrl } from '@/data/reciters';
import { useSettings } from '@/state/SettingsProvider';

type Item = { key: string; url: string; isBasmala: boolean };
export type RecitationState = 'idle' | 'loading' | 'playing' | 'paused';

/**
 * Plays real recitation audio verse by verse (with optional basmala and per-verse repetition)
 * and reports which verse is sounding so the text can follow along.
 */
export function useRecitation() {
  const { settings } = useSettings();
  const player = useAudioPlayer(null, { updateInterval: 250 });
  const [state, setState] = useState<RecitationState>('idle');
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [isBasmala, setIsBasmala] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queue = useRef<Item[]>([]);
  const index = useRef(0);
  const repeatLeft = useRef(0);
  const repeat = useRef(settings.verseRepeat);

  // A new repeat choice applies to the verse that is playing now, not just the next one.
  useEffect(() => {
    repeat.current = settings.verseRepeat;
    repeatLeft.current = settings.verseRepeat;
  }, [settings.verseRepeat]);

  const load = useCallback(
    (i: number) => {
      const item = queue.current[i];
      if (!item) {
        setState('idle');
        setPlayingKey(null);
        setIsBasmala(false);
        return;
      }
      index.current = i;
      setPlayingKey(item.key);
      setIsBasmala(item.isBasmala);
      setState('loading');
      player.replace({ uri: item.url });
      player.play();
    },
    [player],
  );

  useEffect(() => {
    const sub = player.addListener('playbackStatusUpdate', (st) => {
      if (!queue.current.length) return;
      if (st.error) {
        setError('The recitation could not be loaded. Listening needs an internet connection — check it and try again.');
        setState('idle');
        setPlayingKey(null);
        queue.current = [];
        return;
      }
      if (st.didJustFinish) {
        const cur = queue.current[index.current];
        if (cur && !cur.isBasmala && repeatLeft.current > 1) {
          repeatLeft.current -= 1;
          player.seekTo(0).then(() => player.play());
          return;
        }
        repeatLeft.current = repeat.current;
        load(index.current + 1);
        return;
      }
      if (st.playing) setState('playing');
    });
    return () => sub.remove();
  }, [player, load]);

  /** Play `keys` in order, beginning at `start`. `basmala` prefixes the recited basmala. */
  const play = useCallback(
    async (keys: string[], start = 0, basmala = false) => {
      setError(null);
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: settings.playInSilentMode }).catch(() => {});
      const items: Item[] = keys.slice(start).map((key) => ({ key, url: verseAudioUrl(settings.reciter, key), isBasmala: false }));
      if (basmala) items.unshift({ key: BASMALA_KEY, url: verseAudioUrl(settings.reciter, BASMALA_KEY), isBasmala: true });
      queue.current = items;
      repeatLeft.current = repeat.current;
      load(0);
    },
    [settings.reciter, settings.playInSilentMode, load],
  );

  const pause = useCallback(() => {
    player.pause();
    setState('paused');
  }, [player]);

  const resume = useCallback(() => {
    player.play();
    setState('playing');
  }, [player]);

  const stop = useCallback(() => {
    queue.current = [];
    player.pause();
    setState('idle');
    setPlayingKey(null);
    setIsBasmala(false);
  }, [player]);

  return { state, playingKey, isBasmala, error, clearError: () => setError(null), play, pause, resume, stop, active: state !== 'idle' };
}
