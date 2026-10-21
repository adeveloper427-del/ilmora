import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isStoredRecordingAvailable, persistRecording, removeRecordingAudio } from '@/lib/audioStore';
import { uid } from '@/lib/id';
import { loadArray, saveJSON } from '@/lib/storage';

export type Recording = {
  id: string;
  title: string;
  lessonRef?: string;
  uri: string;
  durationMs: number;
  createdAt: number;
};

type Ctx = {
  ready: boolean;
  recordings: Recording[];
  /** Moves the recorder's output into permanent storage, then lists it. */
  add: (r: Omit<Recording, 'id' | 'createdAt'>) => Promise<Recording>;
  remove: (id: string) => void;
  rename: (id: string, title: string) => void;
  removeAll: () => void;
};

const RecordingsContext = createContext<Ctx | null>(null);

export function RecordingsProvider({ children }: { children: ReactNode }) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadArray<Recording>('recordings').then((list) => {
      // Drop entries whose audio no longer exists (e.g. app data partially cleared).
      setRecordings(list.filter((r) => isStoredRecordingAvailable(r.uri)));
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready) saveJSON('recordings', recordings);
  }, [recordings, ready]);

  const add = useCallback(async (r: Omit<Recording, 'id' | 'createdAt'>) => {
    const id = uid();
    const uri = await persistRecording(id, r.uri);
    const rec: Recording = { ...r, uri, id, createdAt: Date.now() };
    setRecordings((prev) => [rec, ...prev]);
    return rec;
  }, []);

  const remove = useCallback((id: string) => {
    setRecordings((prev) => {
      const target = prev.find((r) => r.id === id);
      if (target) removeRecordingAudio(target.uri);
      return prev.filter((r) => r.id !== id);
    });
  }, []);

  const rename = useCallback((id: string, title: string) => {
    setRecordings((prev) => prev.map((r) => (r.id === id ? { ...r, title } : r)));
  }, []);

  const removeAll = useCallback(() => {
    setRecordings((prev) => {
      prev.forEach((r) => removeRecordingAudio(r.uri));
      return [];
    });
  }, []);

  const value = useMemo(() => ({ ready, recordings, add, remove, rename, removeAll }), [ready, recordings, add, remove, rename, removeAll]);
  return <RecordingsContext.Provider value={value}>{children}</RecordingsContext.Provider>;
}

export function useRecordings() {
  const ctx = useContext(RecordingsContext);
  if (!ctx) throw new Error('useRecordings must be used inside RecordingsProvider');
  return ctx;
}
