import {
  getRecordingPermissionsAsync,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useState } from 'react';
import { EmptyRecordingError } from '@/lib/audioStore';
import { useRecordings } from '@/state/RecordingsProvider';
import { useSettings } from '@/state/SettingsProvider';

export const NO_AUDIO = 'No sound was captured, so nothing was saved. Check that your microphone is connected, not muted, and not in use by another app, then try again.';

const OPTIONS = { ...RecordingPresets.HIGH_QUALITY, directory: 'document' as const };

/** One-button record → stop → auto-save, for recording recitation without leaving a screen. */
export function useQuickRecorder(title: string, lessonRef: string) {
  const recorder = useAudioRecorder(OPTIONS);
  const state = useAudioRecorderState(recorder, 250);
  const { add } = useRecordings();
  const { settings } = useSettings();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; tone: 'ok' | 'error' } | null>(null);

  const start = async () => {
    setMessage(null);
    setBusy(true);
    try {
      let perm = await getRecordingPermissionsAsync();
      if (!perm.granted && perm.canAskAgain) perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) {
        setMessage({ text: 'Microphone access is needed to record. Allow it in your settings.', tone: 'error' });
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (e) {
      console.warn('[quick-recorder] start failed', e);
      setMessage({ text: 'Recording could not start. Try again.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const stop = async () => {
    const durationMs = state.durationMillis;
    setBusy(true);
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: settings.playInSilentMode });
      if (!recorder.uri) throw new Error('No file');
      await add({ title, lessonRef, uri: recorder.uri, durationMs });
      setMessage({ text: 'Recitation saved to your recordings.', tone: 'ok' });
    } catch (e) {
      console.warn('[quick-recorder] stop failed', e);
      setMessage({ text: e instanceof EmptyRecordingError ? NO_AUDIO : 'The recording could not be saved.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return {
    isRecording: state.isRecording,
    durationMs: state.durationMillis,
    busy,
    message,
    clearMessage: () => setMessage(null),
    toggle: () => (state.isRecording ? stop() : start()),
  };
}
