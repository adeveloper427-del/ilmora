import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { computeStreak, dayKey } from '@/lib/dates';
import { uid } from '@/lib/id';
import { loadArray, loadJSON, saveJSON } from '@/lib/storage';

export type Stroke = { p: number[]; c: string; w: number };

export type AttemptKind = 'letter' | 'form' | 'joining' | 'word' | 'quran' | 'free';

export type WritingAttempt = {
  id: string;
  kind: AttemptKind;
  refId: string;
  title: string;
  arabic: string;
  guideShown: boolean;
  strokes: Stroke[];
  width: number;
  height: number;
  createdAt: number;
};

export type LessonRecord = { title: string; startedAt: number; completedAt?: number };

export type ProgressData = {
  lessons: Record<string, LessonRecord>;
  lettersPractised: string[];
  /** Seconds of active writing per local day (YYYY-MM-DD). A key with 0 still counts as an active day. */
  days: Record<string, number>;
  totalSeconds: number;
  lastStrokeAt: number;
  updatedAt: number;
};

const EMPTY: ProgressData = { lessons: {}, lettersPractised: [], days: {}, totalSeconds: 0, lastStrokeAt: 0, updatedAt: 0 };
const MAX_ATTEMPTS = 150;

type Ctx = {
  ready: boolean;
  data: ProgressData;
  attempts: WritingAttempt[];
  isCompleted: (key: string) => boolean;
  startLesson: (key: string, title: string) => void;
  completeLesson: (key: string, title: string) => void;
  markLetterPractised: (letterId: string) => void;
  markActiveToday: () => void;
  logStroke: (strokeMs: number) => void;
  saveAttempt: (a: Omit<WritingAttempt, 'id' | 'createdAt'>) => WritingAttempt;
  deleteAttempt: (id: string) => void;
  replaceAll: (data: ProgressData, attempts: WritingAttempt[]) => void;
  reset: () => void;
  stats: {
    completedCount: number;
    startedCount: number;
    streak: number;
    todaySeconds: number;
    recentCompleted: { key: string; title: string; completedAt: number }[];
    inProgress: { key: string; title: string; startedAt: number }[];
  };
};

const ProgressContext = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProgressData>(EMPTY);
  const [attempts, setAttempts] = useState<WritingAttempt[]>([]);
  const [ready, setReady] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Promise.all([loadJSON('progress', EMPTY), loadArray<WritingAttempt>('attempts')]).then(([p, a]) => {
      setData(p);
      setAttempts(a);
      setReady(true);
    });
  }, []);

  // Stroke logging can fire many times a minute, so writes to storage are debounced.
  useEffect(() => {
    if (!ready) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveJSON('progress', data), 600);
  }, [data, ready]);

  useEffect(() => {
    if (ready) saveJSON('attempts', attempts);
  }, [attempts, ready]);

  const mutate = useCallback((fn: (d: ProgressData) => ProgressData) => {
    setData((prev) => ({ ...fn(prev), updatedAt: Date.now() }));
  }, []);

  const touchToday = (d: ProgressData): Record<string, number> => {
    const k = dayKey();
    return k in d.days ? d.days : { ...d.days, [k]: 0 };
  };

  const startLesson = useCallback(
    (key: string, title: string) =>
      mutate((d) => (d.lessons[key] ? d : { ...d, lessons: { ...d.lessons, [key]: { title, startedAt: Date.now() } } })),
    [mutate],
  );

  const completeLesson = useCallback(
    (key: string, title: string) =>
      mutate((d) => {
        const prev = d.lessons[key];
        if (prev?.completedAt) return d;
        const now = Date.now();
        return {
          ...d,
          days: touchToday(d),
          lessons: { ...d.lessons, [key]: { title, startedAt: prev?.startedAt ?? now, completedAt: now } },
        };
      }),
    [mutate],
  );

  /** Counts today toward the streak (used by activities that aren't canvas writing, e.g. memorization). */
  const markActiveToday = useCallback(() => mutate((d) => (dayKey() in d.days ? d : { ...d, days: touchToday(d) })), [mutate]);

  const markLetterPractised = useCallback(
    (id: string) => mutate((d) => (d.lettersPractised.includes(id) ? d : { ...d, lettersPractised: [...d.lettersPractised, id] })),
    [mutate],
  );

  /**
   * Practice time = active writing: each stroke's own duration plus the pause before it,
   * but pauses longer than 30s are treated as the student stepping away.
   */
  const logStroke = useCallback(
    (strokeMs: number) =>
      mutate((d) => {
        const now = Date.now();
        const gap = now - strokeMs - d.lastStrokeAt;
        const ms = strokeMs + (gap > 0 && gap < 30000 ? gap : 0);
        const secs = Math.min(ms, 60000) / 1000;
        const k = dayKey();
        return {
          ...d,
          lastStrokeAt: now,
          totalSeconds: d.totalSeconds + secs,
          days: { ...d.days, [k]: (d.days[k] ?? 0) + secs },
        };
      }),
    [mutate],
  );

  const saveAttempt = useCallback((a: Omit<WritingAttempt, 'id' | 'createdAt'>) => {
    const attempt: WritingAttempt = {
      ...a,
      // Integer coordinates keep stored attempts small without visible loss.
      strokes: a.strokes.map((s) => ({ ...s, p: s.p.map((n) => Math.round(n)) })),
      id: uid(),
      createdAt: Date.now(),
    };
    setAttempts((prev) => [attempt, ...prev].slice(0, MAX_ATTEMPTS));
    return attempt;
  }, []);

  const deleteAttempt = useCallback((id: string) => setAttempts((prev) => prev.filter((a) => a.id !== id)), []);

  const replaceAll = useCallback((d: ProgressData, a: WritingAttempt[]) => {
    setData(d);
    setAttempts(a);
  }, []);

  const reset = useCallback(() => {
    setData({ ...EMPTY, updatedAt: Date.now() });
    setAttempts([]);
  }, []);

  const isCompleted = useCallback((key: string) => !!data.lessons[key]?.completedAt, [data.lessons]);

  const stats = useMemo(() => {
    const entries = Object.entries(data.lessons);
    const completed = entries.filter(([, l]) => l.completedAt);
    return {
      completedCount: completed.length,
      startedCount: entries.length,
      streak: computeStreak(new Set(Object.keys(data.days))),
      todaySeconds: data.days[dayKey()] ?? 0,
      recentCompleted: completed
        .map(([key, l]) => ({ key, title: l.title, completedAt: l.completedAt! }))
        .sort((a, b) => b.completedAt - a.completedAt)
        .slice(0, 5),
      inProgress: entries
        .filter(([, l]) => !l.completedAt)
        .map(([key, l]) => ({ key, title: l.title, startedAt: l.startedAt }))
        .sort((a, b) => b.startedAt - a.startedAt),
    };
  }, [data]);

  const value = useMemo(
    () => ({
      ready,
      data,
      attempts,
      isCompleted,
      startLesson,
      completeLesson,
      markLetterPractised,
      markActiveToday,
      logStroke,
      saveAttempt,
      deleteAttempt,
      replaceAll,
      reset,
      stats,
    }),
    [ready, data, attempts, isCompleted, startLesson, completeLesson, markLetterPractised, markActiveToday, logStroke, saveAttempt, deleteAttempt, replaceAll, reset, stats],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider');
  return ctx;
}
