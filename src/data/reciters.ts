/**
 * Verse-by-verse recitation audio, as listed by the Quran.com API v4 (/recitations/{id}/by_chapter).
 * Every verse in the app (571) was checked to follow `<base><SSS><AAA>.mp3` for each reciter below.
 */
export type Reciter = { id: string; name: string; style: string; base: string };

export const RECITERS: Reciter[] = [
  { id: 'alafasy', name: 'Mishary al-ʿAfasy', style: 'Murattal', base: 'https://verses.quran.com/Alafasy/mp3/' },
  { id: 'husary-muallim', name: 'Maḥmūd al-Ḥuṣarī', style: 'Muʿallim — slow, for learners', base: 'https://mirrors.quranicaudio.com/everyayah/Husary_Muallim_128kbps/' },
  { id: 'abdulbaset', name: 'ʿAbd al-Bāsiṭ ʿAbd aṣ-Ṣamad', style: 'Murattal', base: 'https://verses.quran.com/AbdulBaset/Murattal/mp3/' },
  { id: 'minshawi', name: 'Muḥammad Ṣiddīq al-Minshāwī', style: 'Murattal', base: 'https://verses.quran.com/Minshawi/Murattal/mp3/' },
];

export const DEFAULT_RECITER = 'alafasy';

export function getReciter(id: string): Reciter {
  return RECITERS.find((r) => r.id === id) ?? RECITERS[0];
}

export function verseAudioUrl(reciterId: string, verseKey: string): string {
  const [s, a] = verseKey.split(':');
  return `${getReciter(reciterId).base}${s.padStart(3, '0')}${a.padStart(3, '0')}.mp3`;
}

/** Recited basmala before a surah: the reciter's recording of 1:1. */
export const BASMALA_KEY = '1:1';
