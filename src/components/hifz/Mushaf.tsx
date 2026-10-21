import { memo } from 'react';
import { Text, View } from 'react-native';
import Svg, { Line, Polygon, Rect } from 'react-native-svg';
import { starPoints } from '@/components/ui/Pattern';
import { HifzVerse, toArabicDigits, verseWords } from '@/data/hifz';
import { baseLetters } from '@/data/letters';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/typography';

type Props = {
  verses: HifzVerse[];
  /** Words revealed per verse key while hidden; a value >= word count shows the whole verse. */
  revealed: Record<string, number>;
  hidden: boolean;
  currentKey?: string;
  /** Verse just checked: mistakes shown in context for self-review. */
  checkedKey?: string;
  /** Verse currently being recited aloud; highlighted so the reader can follow. */
  playingKey?: string | null;
  fontSize: number;
  onWordPress?: (key: string, wordIndex: number) => void;
  onVersePress?: (key: string) => void;
};

/** A hidden word becomes a faint kashida line about as long as the word, keeping the page's shape. */
function placeholder(word: string) {
  return 'ـ'.repeat(Math.max(2, Math.round(baseLetters(word).length * 1.6)));
}

/**
 * Continuous mushaf-style paragraph, right to left, with ornate ayah markers.
 * One Text tree so lines wrap like a printed page; each word is its own pressable span.
 */
export const MushafText = memo(function MushafText({ verses, revealed, hidden, currentKey, checkedKey, playingKey, fontSize, onWordPress, onVersePress }: Props) {
  const { c } = useTheme();
  return (
    <Text
      style={{ fontFamily: fonts.arabic, fontSize, lineHeight: fontSize * 2.1, color: c.text, writingDirection: 'rtl', textAlign: 'justify' }}
      accessibilityLanguage="ar"
    >
      {verses.map((v) => {
        const words = verseWords(v.text);
        const shown = hidden ? (revealed[v.key] ?? 0) : words.length;
        const isCurrent = v.key === currentKey;
        const isPlaying = v.key === playingKey;
        return (
          <Text key={v.key}>
            {words.map((w, i) => {
              const visible = i < shown;
              return (
                <Text
                  key={i}
                  onPress={onWordPress ? () => onWordPress(v.key, i) : undefined}
                  suppressHighlighting
                  style={[
                    !visible && { color: c.border, letterSpacing: 0 },
                    visible && v.key === checkedKey && { color: c.primary },
                    isCurrent && hidden && { backgroundColor: c.primaryTint },
                    isPlaying && { backgroundColor: c.goldTint },
                  ]}
                  accessibilityLabel={visible ? w : 'hidden word'}
                >
                  {visible ? w : placeholder(w)}
                  {i < words.length - 1 ? ' ' : ''}
                </Text>
              );
            })}
            <Text onPress={onVersePress ? () => onVersePress(v.key) : undefined} style={[{ color: c.gold }, isPlaying && { backgroundColor: c.goldTint }]} accessibilityLabel={`end of verse ${v.number}`}>
              {` ﴿${toArabicDigits(v.number)}﴾ `}
            </Text>
          </Text>
        );
      })}
    </Text>
  );
});

/** Ornamental surah title frame, drawn with the app's star motif. */
export function SurahBanner({ arabicName, width }: { arabicName: string; width: number }) {
  const { c } = useTheme();
  const h = 64;
  return (
    <View style={{ height: h, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={width} height={h} style={{ position: 'absolute' }}>
        <Rect x={1} y={1} width={width - 2} height={h - 2} rx={6} fill="none" stroke={c.gold} strokeWidth={1.5} />
        <Rect x={6} y={6} width={width - 12} height={h - 12} rx={4} fill={c.goldTint} stroke={c.gold} strokeWidth={0.75} />
        <Polygon points={starPoints(32, h / 2, 18)} fill="none" stroke={c.gold} strokeWidth={1.2} />
        <Polygon points={starPoints(width - 32, h / 2, 18)} fill="none" stroke={c.gold} strokeWidth={1.2} />
        <Line x1={58} y1={h / 2} x2={width * 0.28} y2={h / 2} stroke={c.gold} strokeWidth={0.75} />
        <Line x1={width * 0.72} y1={h / 2} x2={width - 58} y2={h / 2} stroke={c.gold} strokeWidth={0.75} />
      </Svg>
      <Text style={{ fontFamily: fonts.arabicBold, fontSize: 22, lineHeight: 40, color: c.text }}>{`سورة ${arabicName}`}</Text>
    </View>
  );
}
