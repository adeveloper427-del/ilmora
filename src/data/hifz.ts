import raw from './hifz-quran.json';

/**
 * Memorization text: Al-Fatihah and Juz ʿAmma (78–114), fetched verbatim from the Quran.com API v4
 * (text_imlaei) with page/juz/hizb metadata. Never edit verse text by hand.
 */
export type HifzVerse = { key: string; number: number; text: string; page: number; juz: number; hizb: number };
export type HifzSurah = {
  number: number;
  name: string;
  arabicName: string;
  meaning: string;
  revelation: string;
  bismillahPre: boolean;
  verses: HifzVerse[];
};

export const HIFZ_SOURCE: string = raw.source;
export const HIFZ_SURAHS: HifzSurah[] = raw.surahs;

/** Al-Fatihah first, then Juz ʿAmma from An-Nās backwards — the order most students memorize in. */
export const HIFZ_ORDER: HifzSurah[] = [HIFZ_SURAHS[0], ...HIFZ_SURAHS.slice(1).sort((a, b) => b.number - a.number)];

export const HIFZ_TOTAL_VERSES = HIFZ_SURAHS.reduce((n, s) => n + s.verses.length, 0);

/** The basmala shown above surahs, taken from the stored text of 1:1 rather than typed. */
export const BASMALA = HIFZ_SURAHS[0].verses[0].text;

export function getHifzSurah(n: number) {
  return HIFZ_SURAHS.find((s) => s.number === n);
}

export function getHifzVerse(key: string) {
  const surah = getHifzSurah(Number(key.split(':')[0]));
  const verse = surah?.verses.find((v) => v.key === key);
  return surah && verse ? { surah, verse } : undefined;
}

export function toArabicDigits(n: number): string {
  return String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
}

export function verseWords(text: string): string[] {
  return text.split(' ').filter(Boolean);
}
