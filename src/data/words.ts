export type WordLevel = 'beginner' | 'intermediate' | 'advanced';

export type WordExercise = {
  id: string;
  level: WordLevel;
  word: string;
  transliteration: string;
  meaning: string;
};

export const WORD_LEVELS: { id: WordLevel; title: string; subtitle: string }[] = [
  { id: 'beginner', title: 'Beginner', subtitle: 'Short words, few connections' },
  { id: 'intermediate', title: 'Intermediate', subtitle: 'Longer words and mixed joins' },
  { id: 'advanced', title: 'Advanced', subtitle: 'Shadda, breaks and long words' },
];

export const WORDS: WordExercise[] = [
  { id: 'w-bab', level: 'beginner', word: 'بَاب', transliteration: 'bāb', meaning: 'door' },
  { id: 'w-yad', level: 'beginner', word: 'يَد', transliteration: 'yad', meaning: 'hand' },
  { id: 'w-nur', level: 'beginner', word: 'نُور', transliteration: 'nūr', meaning: 'light' },
  { id: 'w-qalam', level: 'beginner', word: 'قَلَم', transliteration: 'qalam', meaning: 'pen' },
  { id: 'w-bayt', level: 'beginner', word: 'بَيْت', transliteration: 'bayt', meaning: 'house' },
  { id: 'w-kitab', level: 'intermediate', word: 'كِتَاب', transliteration: 'kitāb', meaning: 'book' },
  { id: 'w-masjid', level: 'intermediate', word: 'مَسْجِد', transliteration: 'masjid', meaning: 'mosque' },
  { id: 'w-salam', level: 'intermediate', word: 'سَلَام', transliteration: 'salām', meaning: 'peace' },
  { id: 'w-shams', level: 'intermediate', word: 'شَمْس', transliteration: 'shams', meaning: 'sun' },
  { id: 'w-qamar', level: 'intermediate', word: 'قَمَر', transliteration: 'qamar', meaning: 'moon' },
  { id: 'w-ilm', level: 'advanced', word: 'عِلْم', transliteration: 'ʿilm', meaning: 'knowledge' },
  { id: 'w-muallim', level: 'advanced', word: 'مُعَلِّم', transliteration: 'muʿallim', meaning: 'teacher' },
  { id: 'w-talib', level: 'advanced', word: 'طَالِب', transliteration: 'ṭālib', meaning: 'student' },
  { id: 'w-maktaba', level: 'advanced', word: 'مَكْتَبَة', transliteration: 'maktaba', meaning: 'library' },
  { id: 'w-sadiq', level: 'advanced', word: 'صَدِيق', transliteration: 'ṣadīq', meaning: 'friend' },
];

export function getWord(id: string) {
  return WORDS.find((w) => w.id === id);
}
