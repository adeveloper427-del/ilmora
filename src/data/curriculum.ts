import { getJoining, JOINING_EXERCISES } from './joining';
import { getLetter, LETTERS } from './letters';
import { ALL_VERSE_KEYS, getVerse } from './quran';
import { getWord, WORDS } from './words';

export type LevelId = 1 | 2 | 3 | 4 | 5;

export type LevelInfo = {
  id: LevelId;
  title: string;
  arabicTitle: string;
  summary: string;
  topics: string[];
  route: string;
  icon: 'text' | 'shapes' | 'git-merge' | 'create' | 'book';
  /** Lesson keys in this level; completion is measured against these. */
  keys: string[];
};

export const lessonKey = {
  letter: (id: string) => `letter:${id}`,
  forms: (id: string) => `forms:${id}`,
  joining: (id: string) => `join:${id}`,
  word: (id: string) => `word:${id}`,
  quran: (verseKey: string) => `quran:${verseKey}`,
};

export const LEVELS: LevelInfo[] = [
  {
    id: 1,
    title: 'Arabic Foundations',
    arabicTitle: 'الأساسيات',
    summary: 'Meet the 28 letters, learn their names and trace each one.',
    topics: ['The Arabic alphabet', 'Recognising letters', 'Tracing letters', 'Letter names'],
    route: '/learn/alphabet',
    icon: 'text',
    keys: LETTERS.map((l) => lessonKey.letter(l.id)),
  },
  {
    id: 2,
    title: 'Letter Forms',
    arabicTitle: 'أشكال الحروف',
    summary: 'Each letter changes shape depending on where it sits in a word.',
    topics: ['Isolated', 'Initial', 'Medial', 'Final', 'Letters that do not join forward'],
    route: '/learn/forms',
    icon: 'shapes',
    keys: LETTERS.map((l) => lessonKey.forms(l.id)),
  },
  {
    id: 3,
    title: 'Joining Letters',
    arabicTitle: 'وصل الحروف',
    summary: 'See how letters connect, from pairs to complete words.',
    topics: ['Two-letter joins', 'Three-letter joins', 'Common words', 'Build your own'],
    route: '/learn/joining',
    icon: 'git-merge',
    keys: JOINING_EXERCISES.map((e) => lessonKey.joining(e.id)),
  },
  {
    id: 4,
    title: 'Word Writing',
    arabicTitle: 'كتابة الكلمات',
    summary: 'Trace whole words, then write them on your own.',
    topics: ['Tracing words', 'Writing independently', 'Beginner to advanced'],
    route: '/learn/words',
    icon: 'create',
    keys: WORDS.map((w) => lessonKey.word(w.id)),
  },
  {
    id: 5,
    title: 'Quranic Writing',
    arabicTitle: 'كتابة القرآن',
    summary: 'Write short verses from accurately sourced Quranic text.',
    topics: ['Short verses', 'Tracing', 'Writing from memory', 'Saved attempts'],
    route: '/learn/quran',
    icon: 'book',
    keys: ALL_VERSE_KEYS.map(lessonKey.quran),
  },
];

export function levelProgress(level: LevelInfo, completed: (key: string) => boolean) {
  const done = level.keys.filter(completed).length;
  return { done, total: level.keys.length, ratio: level.keys.length ? done / level.keys.length : 0 };
}

/** The first level that isn't finished, so the student's current level follows their real progress. */
export function currentLevel(completed: (key: string) => boolean): LevelInfo {
  return LEVELS.find((l) => levelProgress(l, completed).ratio < 1) ?? LEVELS[LEVELS.length - 1];
}

/** Title and screen for any lesson key, so dashboards can link straight back into a lesson. */
export function lessonMeta(key: string): { title: string; route: string } | null {
  const i = key.indexOf(':');
  const kind = key.slice(0, i);
  const id = key.slice(i + 1);
  switch (kind) {
    case 'letter': {
      const l = getLetter(id);
      return l ? { title: `Letter ${l.name}`, route: `/learn/letter/${id}` } : null;
    }
    case 'forms': {
      const l = getLetter(id);
      return l ? { title: `${l.name} — letter forms`, route: `/learn/letter/${id}?mode=forms` } : null;
    }
    case 'join': {
      const j = getJoining(id);
      return j ? { title: `Joining: ${j.transliteration}`, route: `/learn/joining/${id}` } : null;
    }
    case 'word': {
      const w = getWord(id);
      return w ? { title: `Word: ${w.transliteration}`, route: `/learn/words/${id}` } : null;
    }
    case 'quran': {
      const v = getVerse(id);
      return v ? { title: `${v.surah.name} ${id}`, route: `/learn/quran/${id}` } : null;
    }
  }
  return null;
}

/** The next lesson to suggest: the first unfinished lesson in the student's current level. */
export function nextLessonKey(completed: (key: string) => boolean): string {
  const level = currentLevel(completed);
  return level.keys.find((k) => !completed(k)) ?? level.keys[0];
}
