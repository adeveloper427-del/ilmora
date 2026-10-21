import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { ArabicText } from '@/components/ui/Bits';
import { baseLetters, findByChar, FORM_LABELS, formsInSequence, formText } from '@/data/letters';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/typography';

/**
 * Shows each letter on its own, the form it takes in this word, and the joined result.
 * Laid out right-to-left so the first letter of the word sits on the right.
 */
export function JoinBreakdown({ word, compact }: { word: string; compact?: boolean }) {
  const s = useStyles();
  const { c } = useTheme();
  const chars = baseLetters(word);
  const forms = formsInSequence(chars);
  const tile = compact ? 30 : 34;

  return (
    <View style={{ gap: 10 }}>
      <View style={s.tiles}>
        {chars.map((ch, i) => {
          const info = findByChar(ch);
          const breaks = i < chars.length - 1 && !info?.joinsForward;
          return (
            <View key={`${ch}-${i}`} style={s.tileWrap}>
              <View style={[s.tile, breaks && { borderColor: c.gold }]}>
                <ArabicText size={tile} color={c.text}>
                  {ch}
                </ArabicText>
                <Ionicons name="arrow-down" size={12} color={c.textFaint} style={{ marginTop: -8 }} />
                <ArabicText size={tile} color={c.primary}>
                  {formText(ch, forms[i], !!info?.joinsForward)}
                </ArabicText>
                <Text style={s.formLabel}>{FORM_LABELS[forms[i]]}</Text>
              </View>
              <Text style={s.name} numberOfLines={1}>
                {info?.name ?? ch}
              </Text>
              {breaks ? <Text style={s.breakText}>no join →</Text> : null}
            </View>
          );
        })}
      </View>
      <View style={s.result}>
        <Ionicons name="arrow-down-circle" size={18} color={c.gold} />
        <ArabicText size={compact ? 44 : 56} color={c.primary} bold>
          {word}
        </ArabicText>
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  tiles: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  tileWrap: { alignItems: 'center', gap: 2 },
  tile: { minWidth: 58, alignItems: 'center', backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1.5, borderColor: c.border, paddingHorizontal: 6 },
  formLabel: { fontFamily: fonts.medium, fontSize: 10, color: c.textMuted, marginTop: -8, marginBottom: 4 },
  name: { fontFamily: fonts.regular, fontSize: 11, color: c.textMuted, maxWidth: 70 },
  breakText: { fontFamily: fonts.medium, fontSize: 10, color: c.gold },
  result: { alignItems: 'center' },
}));
