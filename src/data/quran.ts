import raw from './quran-verses.json';

/**
 * Verse text is the Imlaei (standard Arabic orthography) script from the Quran.com API v4,
 * fetched verbatim and stored in quran-verses.json. Never edit verse text by hand.
 */
export type Verse = { key: string; number: number; text: string };
export type Surah = { number: number; name: string; arabicName: string; meaning: string; verses: Verse[] };

export const QURAN_SOURCE: string = raw.source;
export const SURAHS: Surah[] = raw.surahs;

export function getVerse(key: string): { surah: Surah; verse: Verse } | undefined {
  const [s] = key.split(':');
  const surah = SURAHS.find((x) => x.number === Number(s));
  const verse = surah?.verses.find((v) => v.key === key);
  return surah && verse ? { surah, verse } : undefined;
}

/**
 * Long verses are practised in parts so the writing stays a legible size on a phone.
 * Parts split only on spaces, so every word is kept intact and in order.
 */
export function verseParts(text: string, maxWords = 3): string[] {
  const words = text.split(' ').filter(Boolean);
  if (words.length <= maxWords + 1) return [text];
  const parts: string[] = [];
  for (let i = 0; i < words.length; i += maxWords) parts.push(words.slice(i, i + maxWords).join(' '));
  // Avoid a lonely last word.
  if (parts.length > 1 && parts[parts.length - 1].split(' ').length === 1) {
    const last = parts.pop()!;
    parts[parts.length - 1] += ' ' + last;
  }
  return parts;
}

export function verseLength(v: Verse) {
  return v.text.split(' ').length;
}

export const ALL_VERSE_KEYS = SURAHS.flatMap((s) => s.verses.map((v) => v.key));
