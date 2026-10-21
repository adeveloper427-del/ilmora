import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';
import { ProgressData, useProgress, WritingAttempt } from './ProgressProvider';
import { useRecordings } from './RecordingsProvider';
import { useSettings } from './SettingsProvider';

/** Union of two progress snapshots; nothing a student earned on either device is lost. */
export function mergeProgress(a: ProgressData, b: ProgressData): ProgressData {
  const lessons = { ...b.lessons };
  for (const [k, l] of Object.entries(a.lessons)) {
    const o = lessons[k];
    if (!o) lessons[k] = l;
    else
      lessons[k] = {
        title: l.title,
        startedAt: Math.min(l.startedAt, o.startedAt),
        completedAt: l.completedAt && o.completedAt ? Math.min(l.completedAt, o.completedAt) : (l.completedAt ?? o.completedAt),
      };
  }
  const days = { ...b.days };
  for (const [k, s] of Object.entries(a.days)) days[k] = Math.max(s, days[k] ?? 0);
  return {
    lessons,
    days,
    lettersPractised: Array.from(new Set([...a.lettersPractised, ...b.lettersPractised])),
    totalSeconds: Object.values(days).reduce((x, y) => x + y, 0),
    lastStrokeAt: Math.max(a.lastStrokeAt, b.lastStrokeAt),
    updatedAt: Date.now(),
  };
}

/**
 * Mirrors local progress to Supabase while a student is signed in.
 * Local storage stays the source of truth, so the app works fully offline.
 * Audio files stay on the device for now; only their metadata is synced.
 */
export function CloudSync() {
  const { session } = useAuth();
  const progress = useProgress();
  const { recordings } = useRecordings();
  const { settings } = useSettings();
  const pulledFor = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userId = session?.user.id ?? null;

  // Pull once per sign-in and merge into local data.
  useEffect(() => {
    if (!supabase || !userId || !progress.ready || pulledFor.current === userId) return;
    pulledFor.current = userId;
    (async () => {
      const [snap, att] = await Promise.all([
        supabase!.from('progress_snapshots').select('data').eq('user_id', userId).maybeSingle(),
        supabase!.from('writing_attempts').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(150),
      ]);
      if (snap.error || att.error) {
        console.warn('[sync] pull failed', snap.error ?? att.error);
        return;
      }
      const remoteData = snap.data?.data as ProgressData | undefined;
      const merged = remoteData ? mergeProgress(progress.data, remoteData) : progress.data;
      const localIds = new Set(progress.attempts.map((a) => a.id));
      const remoteAttempts: WritingAttempt[] = (att.data ?? [])
        .filter((r) => !localIds.has(r.id))
        .map((r) => ({
          id: r.id,
          kind: r.kind,
          refId: r.ref_id,
          title: r.title,
          arabic: r.arabic,
          guideShown: r.guide_shown,
          strokes: r.strokes,
          width: r.width,
          height: r.height,
          createdAt: new Date(r.created_at).getTime(),
        }));
      const attempts = [...progress.attempts, ...remoteAttempts].sort((a, b) => b.createdAt - a.createdAt).slice(0, 150);
      progress.replaceAll(merged, attempts);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, progress.ready]);

  // Push (debounced) whenever local data changes.
  useEffect(() => {
    if (!supabase || !userId || pulledFor.current !== userId) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const db = supabase!;
      const results = await Promise.all([
        db.from('profiles').upsert({ id: userId, display_name: settings.studentName, daily_goal_minutes: settings.dailyGoalMinutes }),
        db.from('progress_snapshots').upsert({ user_id: userId, data: progress.data, updated_at: new Date().toISOString() }),
        progress.attempts.length
          ? db.from('writing_attempts').upsert(
              progress.attempts.map((a) => ({
                id: a.id,
                user_id: userId,
                kind: a.kind,
                ref_id: a.refId,
                title: a.title,
                arabic: a.arabic,
                guide_shown: a.guideShown,
                strokes: a.strokes,
                width: a.width,
                height: a.height,
                created_at: new Date(a.createdAt).toISOString(),
              })),
            )
          : Promise.resolve({ error: null }),
        recordings.length
          ? db.from('recordings').upsert(
              recordings.map((r) => ({
                id: r.id,
                user_id: userId,
                title: r.title,
                lesson_ref: r.lessonRef ?? null,
                duration_ms: Math.round(r.durationMs),
                created_at: new Date(r.createdAt).toISOString(),
              })),
            )
          : Promise.resolve({ error: null }),
      ]);
      // Deletions made on this device.
      const keepAttempts = progress.attempts.map((a) => a.id);
      const keepRecordings = recordings.map((r) => r.id);
      await Promise.all([
        db.from('writing_attempts').delete().eq('user_id', userId).not('id', 'in', `(${keepAttempts.join(',') || '00000000-0000-0000-0000-000000000000'})`),
        db.from('recordings').delete().eq('user_id', userId).not('id', 'in', `(${keepRecordings.join(',') || '00000000-0000-0000-0000-000000000000'})`),
      ]);
      const failed = results.find((r) => r.error);
      if (failed?.error) console.warn('[sync] push failed', failed.error);
    }, 4000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [userId, progress.data, progress.attempts, recordings, settings.studentName, settings.dailyGoalMinutes]);

  return null;
}
