import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { HIFZ_SURAHS } from '@/data/hifz';
import { addDays, dayKey } from '@/lib/dates';
import { loadJSON, saveJSON } from '@/lib/storage';
import { useProgress } from './ProgressProvider';

/**
 * Spaced review per verse. A correct recitation moves a verse up one box (at most once per day);
 * a mistake drops it back two boxes. A verse counts as memorized from box 3 — i.e. recited
 * correctly from memory on three different days.
 */
export type VerseRecord = {
  box: number;
  due: string;
  lastCorrectDay?: string;
  correct: number;
  mistakes: number;
  lastReviewed: number;
};

const INTERVAL_DAYS = [1, 1, 3, 7, 14, 30];
export const MEMORIZED_BOX = 3;

type HifzData = { verses: Record<string, VerseRecord>; lastSurah?: number };

type Ctx = {
  ready: boolean;
  records: Record<string, VerseRecord>;
  lastSurah?: number;
  grade: (key: string, correct: boolean) => void;
  setLastSurah: (n: number) => void;
  status: (key: string) => 'new' | 'learning' | 'memorized';
  dueKeys: string[];
  memorizedCount: number;
  learningCount: number;
  surahStats: (n: number) => { memorized: number; learning: number; total: number };
  reset: () => void;
};

const HifzContext = createContext<Ctx | null>(null);

export function HifzProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<HifzData>({ verses: {} });
  const [ready, setReady] = useState(false);
  const progress = useProgress();

  useEffect(() => {
    loadJSON<HifzData>('hifz', { verses: {} }).then((d) => {
      setData(d);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready) saveJSON('hifz', data);
  }, [data, ready]);

  const { markActiveToday } = progress;
  const grade = useCallback(
    (key: string, correct: boolean) => {
      const today = dayKey();
      setData((d) => {
        const r: VerseRecord = d.verses[key] ?? { box: 0, due: today, correct: 0, mistakes: 0, lastReviewed: 0 };
        let next: VerseRecord;
        if (correct) {
          const advance = r.lastCorrectDay !== today || r.box === 0;
          const box = advance ? Math.min(r.box + 1, INTERVAL_DAYS.length - 1) : r.box;
          next = { ...r, box, correct: r.correct + 1, lastCorrectDay: today, due: dayKey(addDays(new Date(), INTERVAL_DAYS[box])), lastReviewed: Date.now() };
        } else {
          next = { ...r, box: Math.max(0, r.box - 2), mistakes: r.mistakes + 1, due: dayKey(addDays(new Date(), 1)), lastReviewed: Date.now() };
        }
        return { ...d, verses: { ...d.verses, [key]: next } };
      });
      markActiveToday();
    },
    [markActiveToday],
  );

  const setLastSurah = useCallback((n: number) => setData((d) => (d.lastSurah === n ? d : { ...d, lastSurah: n })), []);
  const reset = useCallback(() => setData({ verses: {} }), []);

  const value = useMemo(() => {
    const today = dayKey();
    const records = data.verses;
    const status = (key: string) => {
      const r = records[key];
      if (!r) return 'new' as const;
      return r.box >= MEMORIZED_BOX ? ('memorized' as const) : ('learning' as const);
    };
    const entries = Object.entries(records);
    return {
      ready,
      records,
      lastSurah: data.lastSurah,
      grade,
      setLastSurah,
      status,
      // Due verses, most overdue first; keys sort by surah:verse within a day.
      dueKeys: entries
        .filter(([, r]) => r.due <= today)
        .sort(([ka, a], [kb, b]) => a.due.localeCompare(b.due) || ka.localeCompare(kb, undefined, { numeric: true }))
        .map(([k]) => k),
      memorizedCount: entries.filter(([, r]) => r.box >= MEMORIZED_BOX).length,
      learningCount: entries.filter(([, r]) => r.box < MEMORIZED_BOX).length,
      surahStats: (n: number) => {
        const s = HIFZ_SURAHS.find((x) => x.number === n);
        const keys = s?.verses.map((v) => v.key) ?? [];
        return {
          memorized: keys.filter((k) => (records[k]?.box ?? 0) >= MEMORIZED_BOX).length,
          learning: keys.filter((k) => records[k] && records[k].box < MEMORIZED_BOX).length,
          total: keys.length,
        };
      },
      reset,
    };
  }, [data, ready, grade, setLastSurah, reset]);

  return <HifzContext.Provider value={value}>{children}</HifzContext.Provider>;
}

export function useHifz() {
  const ctx = useContext(HifzContext);
  if (!ctx) throw new Error('useHifz must be used inside HifzProvider');
  return ctx;
}
