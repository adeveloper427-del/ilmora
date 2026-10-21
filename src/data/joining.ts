export type JoiningStage = 'two' | 'three' | 'word';

export type JoiningExercise = {
  id: string;
  stage: JoiningStage;
  word: string;
  transliteration: string;
  meaning: string;
  tip: string;
};

export const JOINING_STAGES: { id: JoiningStage; title: string; subtitle: string }[] = [
  { id: 'two', title: 'Two letters', subtitle: 'Your first connections' },
  { id: 'three', title: 'Three letters', subtitle: 'Initial, medial and final together' },
  { id: 'word', title: 'Complete words', subtitle: 'Longer words with breaks' },
];

export const JOINING_EXERCISES: JoiningExercise[] = [
  { id: 'j-man', stage: 'two', word: 'مَن', transliteration: 'man', meaning: 'who', tip: 'Mīm takes its initial form and reaches left to meet nūn, which ends the word in its final form.' },
  { id: 'j-fi', stage: 'two', word: 'فِي', transliteration: 'fī', meaning: 'in', tip: 'Fā shrinks to its initial form; the yā drops below the line as a final form.' },
  { id: 'j-an', stage: 'two', word: 'عَن', transliteration: 'ʿan', meaning: 'about', tip: 'The open ʿayn of the isolated form closes into a small hook when it starts a word.' },
  { id: 'j-yad', stage: 'two', word: 'يَد', transliteration: 'yad', meaning: 'hand', tip: 'Yā becomes two dots under a small tooth, then flows into dāl.' },
  { id: 'j-la', stage: 'two', word: 'لَا', transliteration: 'lā', meaning: 'no', tip: 'Lām followed by alif forms a special combined shape called lām-alif.' },
  { id: 'j-qalam', stage: 'three', word: 'قَلَم', transliteration: 'qalam', meaning: 'pen', tip: 'All three letters join: qāf initial, lām medial, mīm final.' },
  { id: 'j-bayt', stage: 'three', word: 'بَيْت', transliteration: 'bayt', meaning: 'house', tip: 'Bā and yā are both small teeth when joined; only the dots tell them apart.' },
  { id: 'j-kataba', stage: 'three', word: 'كَتَبَ', transliteration: 'kataba', meaning: 'he wrote', tip: 'Kāf keeps its top stroke; tā and bā are teeth on the line.' },
  { id: 'j-nur', stage: 'three', word: 'نُور', transliteration: 'nūr', meaning: 'light', tip: 'Wāw does not join forward, so rā stands alone after it.' },
  { id: 'j-dars', stage: 'three', word: 'دَرْس', transliteration: 'dars', meaning: 'lesson', tip: 'Dāl and rā never join forward: the word is written in three separate pieces.' },
  { id: 'j-shams', stage: 'word', word: 'شَمْس', transliteration: 'shams', meaning: 'sun', tip: 'Shīn begins with three teeth and three dots, mīm sits in the middle, sīn ends with a tail.' },
  { id: 'j-salam', stage: 'word', word: 'سَلَام', transliteration: 'salām', meaning: 'peace', tip: 'The lām-alif shape appears again; mīm stands alone after the alif.' },
  { id: 'j-kitab', stage: 'word', word: 'كِتَاب', transliteration: 'kitāb', meaning: 'book', tip: 'Alif breaks the word: the bā after it starts fresh in its isolated form.' },
  { id: 'j-masjid', stage: 'word', word: 'مَسْجِد', transliteration: 'masjid', meaning: 'mosque', tip: 'Four letters join in one flowing line, ending with a dāl.' },
  { id: 'j-madrasa', stage: 'word', word: 'مَدْرَسَة', transliteration: 'madrasa', meaning: 'school', tip: 'Dāl and rā cause two breaks; the word ends with tā marbūṭa.' },
];

export function getJoining(id: string) {
  return JOINING_EXERCISES.find((e) => e.id === id);
}
