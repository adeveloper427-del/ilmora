import type { Stroke } from '@/state/ProgressProvider';

/**
 * Unfinished writing, kept in memory per exercise so a student who leaves to check
 * something (or switches tabs) comes back to their work for the rest of the session.
 */
const drafts = new Map<string, Stroke[]>();

export const Drafts = {
  get: (key: string) => drafts.get(key) ?? [],
  set: (key: string, strokes: Stroke[]) => {
    if (strokes.length) drafts.set(key, strokes);
    else drafts.delete(key);
  },
  clear: (key: string) => drafts.delete(key),
};
