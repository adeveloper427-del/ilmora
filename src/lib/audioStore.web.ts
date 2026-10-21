/**
 * On web the recorder returns a `blob:` URL that only lives as long as the tab, so saved
 * recordings keep their audio bytes in IndexedDB and are referenced as `idb:<id>`.
 */
const DB = 'ilmora-audio';
const STORE = 'recordings';
const PREFIX = 'idb:';
const objectUrls = new Map<string, string>();

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => {
      db.close();
      resolve(req.result as T);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export class EmptyRecordingError extends Error {
  constructor() {
    super('No audio was captured');
  }
}

export async function persistRecording(id: string, uri: string): Promise<string> {
  const blob = await (await fetch(uri)).blob();
  // The timer keeps counting even if the microphone delivers nothing; never save a silent, empty file.
  if (!blob.size) throw new EmptyRecordingError();
  await run('readwrite', (s) => s.put(blob, id));
  URL.revokeObjectURL(uri);
  return PREFIX + id;
}

/** `fresh` builds a new object URL instead of reusing the cached one (used to retry after a playback error). */
export async function playableUri(uri: string, fresh = false): Promise<string> {
  if (!uri.startsWith(PREFIX)) return uri;
  const id = uri.slice(PREFIX.length);
  const cached = objectUrls.get(id);
  if (cached && !fresh) return cached;
  const blob = await run<Blob | undefined>('readonly', (s) => s.get(id));
  if (!blob) throw new Error('Recording audio is missing');
  if (cached) URL.revokeObjectURL(cached);
  const url = URL.createObjectURL(blob);
  objectUrls.set(id, url);
  return url;
}

export type RecordingHealth = 'ok' | 'missing' | 'empty';

export async function recordingHealth(uri: string): Promise<RecordingHealth> {
  if (!uri.startsWith(PREFIX)) return 'missing';
  try {
    const blob = await run<Blob | undefined>('readonly', (s) => s.get(uri.slice(PREFIX.length)));
    if (!blob) return 'missing';
    return blob.size ? 'ok' : 'empty';
  } catch {
    return 'missing';
  }
}

export function removeRecordingAudio(uri: string): void {
  if (!uri.startsWith(PREFIX)) return;
  const id = uri.slice(PREFIX.length);
  const cached = objectUrls.get(id);
  if (cached) URL.revokeObjectURL(cached);
  objectUrls.delete(id);
  run('readwrite', (s) => s.delete(id)).catch((e) => console.warn('[audio] could not delete', e));
}

export function discardRawRecording(uri: string): void {
  if (uri.startsWith('blob:')) URL.revokeObjectURL(uri);
}

/** `blob:` URLs saved by earlier builds died with their tab and can never play again. */
export function isStoredRecordingAvailable(uri: string): boolean {
  return uri.startsWith(PREFIX);
}
