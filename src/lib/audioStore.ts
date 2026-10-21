import { File } from 'expo-file-system';

/**
 * Native: the recorder already writes to the app's document directory, so the file path is permanent.
 * The web version (audioStore.web.ts) keeps the audio bytes in IndexedDB instead.
 */
export class EmptyRecordingError extends Error {
  constructor() {
    super('No audio was captured');
  }
}

export async function persistRecording(_id: string, uri: string): Promise<string> {
  // The timer keeps counting even if the microphone delivers nothing; never save an empty file.
  if (!new File(uri).size) {
    removeRecordingAudio(uri);
    throw new EmptyRecordingError();
  }
  return uri;
}

export async function playableUri(uri: string, _fresh = false): Promise<string> {
  return uri;
}

export type RecordingHealth = 'ok' | 'missing' | 'empty';

export async function recordingHealth(uri: string): Promise<RecordingHealth> {
  try {
    const f = new File(uri);
    if (!f.exists) return 'missing';
    return f.size ? 'ok' : 'empty';
  } catch {
    return 'missing';
  }
}

export function removeRecordingAudio(uri: string): void {
  try {
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch (e) {
    console.warn('[audio] could not delete file', e);
  }
}

/** Raw recorder output that was never saved. */
export const discardRawRecording = removeRecordingAudio;

export function isStoredRecordingAvailable(uri: string): boolean {
  try {
    return new File(uri).exists;
  } catch {
    return false;
  }
}
