export type LetterForm = 'isolated' | 'initial' | 'medial' | 'final';

export type Letter = {
  id: string;
  order: number;
  char: string;
  name: string;
  arabicName: string;
  sound: string;
  /** False for the six letters that never join to the letter after them. */
  joinsForward: boolean;
  example: { arabic: string; transliteration: string; meaning: string };
};

export const TATWEEL = 'ـ';

export const LETTERS: Letter[] = [
  { id: 'alif', order: 1, char: 'ا', name: 'Alif', arabicName: 'أَلِف', sound: 'a / long ā', joinsForward: false, example: { arabic: 'أَسَد', transliteration: 'asad', meaning: 'lion' } },
  { id: 'ba', order: 2, char: 'ب', name: 'Bā', arabicName: 'بَاء', sound: 'b', joinsForward: true, example: { arabic: 'بَاب', transliteration: 'bāb', meaning: 'door' } },
  { id: 'ta', order: 3, char: 'ت', name: 'Tā', arabicName: 'تَاء', sound: 't', joinsForward: true, example: { arabic: 'تُفَّاح', transliteration: 'tuffāḥ', meaning: 'apples' } },
  { id: 'tha', order: 4, char: 'ث', name: 'Thā', arabicName: 'ثَاء', sound: 'th (as in think)', joinsForward: true, example: { arabic: 'ثَعْلَب', transliteration: 'thaʿlab', meaning: 'fox' } },
  { id: 'jim', order: 5, char: 'ج', name: 'Jīm', arabicName: 'جِيم', sound: 'j', joinsForward: true, example: { arabic: 'جَمَل', transliteration: 'jamal', meaning: 'camel' } },
  { id: 'hha', order: 6, char: 'ح', name: 'Ḥā', arabicName: 'حَاء', sound: 'ḥ (breathy h)', joinsForward: true, example: { arabic: 'حِصَان', transliteration: 'ḥiṣān', meaning: 'horse' } },
  { id: 'kha', order: 7, char: 'خ', name: 'Khā', arabicName: 'خَاء', sound: 'kh', joinsForward: true, example: { arabic: 'خُبْز', transliteration: 'khubz', meaning: 'bread' } },
  { id: 'dal', order: 8, char: 'د', name: 'Dāl', arabicName: 'دَال', sound: 'd', joinsForward: false, example: { arabic: 'دُبّ', transliteration: 'dubb', meaning: 'bear' } },
  { id: 'dhal', order: 9, char: 'ذ', name: 'Dhāl', arabicName: 'ذَال', sound: 'dh (as in this)', joinsForward: false, example: { arabic: 'ذَهَب', transliteration: 'dhahab', meaning: 'gold' } },
  { id: 'ra', order: 10, char: 'ر', name: 'Rā', arabicName: 'رَاء', sound: 'r (rolled)', joinsForward: false, example: { arabic: 'رُمَّان', transliteration: 'rummān', meaning: 'pomegranate' } },
  { id: 'zay', order: 11, char: 'ز', name: 'Zāy', arabicName: 'زَاي', sound: 'z', joinsForward: false, example: { arabic: 'زَيْتُون', transliteration: 'zaytūn', meaning: 'olives' } },
  { id: 'sin', order: 12, char: 'س', name: 'Sīn', arabicName: 'سِين', sound: 's', joinsForward: true, example: { arabic: 'سَمَك', transliteration: 'samak', meaning: 'fish' } },
  { id: 'shin', order: 13, char: 'ش', name: 'Shīn', arabicName: 'شِين', sound: 'sh', joinsForward: true, example: { arabic: 'شَمْس', transliteration: 'shams', meaning: 'sun' } },
  { id: 'sad', order: 14, char: 'ص', name: 'Ṣād', arabicName: 'صَاد', sound: 'ṣ (heavy s)', joinsForward: true, example: { arabic: 'صَقْر', transliteration: 'ṣaqr', meaning: 'falcon' } },
  { id: 'dad', order: 15, char: 'ض', name: 'Ḍād', arabicName: 'ضَاد', sound: 'ḍ (heavy d)', joinsForward: true, example: { arabic: 'ضِفْدَع', transliteration: 'ḍifdaʿ', meaning: 'frog' } },
  { id: 'tta', order: 16, char: 'ط', name: 'Ṭā', arabicName: 'طَاء', sound: 'ṭ (heavy t)', joinsForward: true, example: { arabic: 'طَائِر', transliteration: 'ṭāʾir', meaning: 'bird' } },
  { id: 'dha', order: 17, char: 'ظ', name: 'Ẓā', arabicName: 'ظَاء', sound: 'ẓ (heavy dh)', joinsForward: true, example: { arabic: 'ظَرْف', transliteration: 'ẓarf', meaning: 'envelope' } },
  { id: 'ayn', order: 18, char: 'ع', name: 'ʿAyn', arabicName: 'عَيْن', sound: 'ʿ (from the throat)', joinsForward: true, example: { arabic: 'عَيْن', transliteration: 'ʿayn', meaning: 'eye' } },
  { id: 'ghayn', order: 19, char: 'غ', name: 'Ghayn', arabicName: 'غَيْن', sound: 'gh (gargled)', joinsForward: true, example: { arabic: 'غَيْمَة', transliteration: 'ghayma', meaning: 'cloud' } },
  { id: 'fa', order: 20, char: 'ف', name: 'Fā', arabicName: 'فَاء', sound: 'f', joinsForward: true, example: { arabic: 'فِيل', transliteration: 'fīl', meaning: 'elephant' } },
  { id: 'qaf', order: 21, char: 'ق', name: 'Qāf', arabicName: 'قَاف', sound: 'q (deep k)', joinsForward: true, example: { arabic: 'قَمَر', transliteration: 'qamar', meaning: 'moon' } },
  { id: 'kaf', order: 22, char: 'ك', name: 'Kāf', arabicName: 'كَاف', sound: 'k', joinsForward: true, example: { arabic: 'كِتَاب', transliteration: 'kitāb', meaning: 'book' } },
  { id: 'lam', order: 23, char: 'ل', name: 'Lām', arabicName: 'لَام', sound: 'l', joinsForward: true, example: { arabic: 'لَيْمُون', transliteration: 'laymūn', meaning: 'lemon' } },
  { id: 'mim', order: 24, char: 'م', name: 'Mīm', arabicName: 'مِيم', sound: 'm', joinsForward: true, example: { arabic: 'مَسْجِد', transliteration: 'masjid', meaning: 'mosque' } },
  { id: 'nun', order: 25, char: 'ن', name: 'Nūn', arabicName: 'نُون', sound: 'n', joinsForward: true, example: { arabic: 'نَجْمَة', transliteration: 'najma', meaning: 'star' } },
  { id: 'ha', order: 26, char: 'ه', name: 'Hā', arabicName: 'هَاء', sound: 'h', joinsForward: true, example: { arabic: 'هِلَال', transliteration: 'hilāl', meaning: 'crescent moon' } },
  { id: 'waw', order: 27, char: 'و', name: 'Wāw', arabicName: 'وَاو', sound: 'w / long ū', joinsForward: false, example: { arabic: 'وَرْدَة', transliteration: 'warda', meaning: 'rose' } },
  { id: 'ya', order: 28, char: 'ي', name: 'Yā', arabicName: 'يَاء', sound: 'y / long ī', joinsForward: true, example: { arabic: 'يَد', transliteration: 'yad', meaning: 'hand' } },
];

/** Tā marbūṭa is not one of the 28 letters but appears in words; it only ever ends a word. */
const EXTRA: Record<string, Pick<Letter, 'char' | 'name' | 'joinsForward'>> = {
  'ة': { char: 'ة', name: 'Tā marbūṭa', joinsForward: false },
  'أ': { char: 'أ', name: 'Alif with hamza', joinsForward: false },
  'إ': { char: 'إ', name: 'Alif with hamza', joinsForward: false },
  'آ': { char: 'آ', name: 'Alif madda', joinsForward: false },
};

export const FORM_LABELS: Record<LetterForm, string> = {
  isolated: 'Isolated',
  initial: 'Initial',
  medial: 'Medial',
  final: 'Final',
};

export const FORMS: LetterForm[] = ['isolated', 'initial', 'medial', 'final'];

export function getLetter(id: string): Letter | undefined {
  return LETTERS.find((l) => l.id === id);
}

export function findByChar(char: string): Pick<Letter, 'char' | 'name' | 'joinsForward'> | undefined {
  return LETTERS.find((l) => l.char === char) ?? EXTRA[char];
}

/**
 * The glyph sequence that makes the text engine draw a given positional form.
 * The tatweel (kashida) gives the letter something to connect to on each side.
 * Non-joining letters have no distinct initial/medial shapes, so they fall back to the honest form.
 */
export function formText(char: string, form: LetterForm, joinsForward: boolean): string {
  switch (form) {
    case 'isolated':
      return char;
    case 'initial':
      return joinsForward ? char + TATWEEL : char;
    case 'medial':
      return joinsForward ? TATWEEL + char + TATWEEL : TATWEEL + char;
    case 'final':
      return TATWEEL + char;
  }
}

/** Which form each letter takes inside a sequence, following the joining rules. */
export function formsInSequence(chars: string[]): LetterForm[] {
  return chars.map((c, i) => {
    const prev = i > 0 ? findByChar(chars[i - 1]) : undefined;
    const self = findByChar(c);
    const joinsPrev = !!prev?.joinsForward;
    const joinsNext = i < chars.length - 1 && !!self?.joinsForward;
    if (joinsPrev && joinsNext) return 'medial';
    if (joinsNext) return 'initial';
    if (joinsPrev) return 'final';
    return 'isolated';
  });
}

/** Strip harakat so letter-by-letter breakdowns work on vowelled words. */
export function baseLetters(word: string): string[] {
  return Array.from(word.replace(/[ً-ٰٟۖ-ۭ]/g, ''));
}

export function dailyLetter(date = new Date()): Letter {
  const start = new Date(date.getFullYear(), 0, 0).getTime();
  const dayOfYear = Math.floor((date.getTime() - start) / 86400000);
  return LETTERS[dayOfYear % LETTERS.length];
}
