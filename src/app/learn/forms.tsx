import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { ArabicText } from '@/components/ui/Bits';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/Progress';
import { Screen, ScreenHeader, SectionTitle } from '@/components/ui/Screen';
import { LEVELS, lessonKey, levelProgress } from '@/data/curriculum';
import { FORM_LABELS, FORMS, formText, LETTERS } from '@/data/letters';
import { useProgress } from '@/state/ProgressProvider';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/typography';

const NON_JOINERS = LETTERS.filter((l) => !l.joinsForward);

export default function Forms() {
  const s = useStyles();
  const { c } = useTheme();
  const { isCompleted } = useProgress();
  const p = levelProgress(LEVELS[1], isCompleted);

  return (
    <Screen>
      <ScreenHeader title="Letter forms" arabic="أشكال الحروف" subtitle="Level 2 · Isolated, initial, medial, final" />
      <Card>
        <Text style={s.body}>A letter’s shape depends on its neighbours. Here is bāʾ in each position — read from the right:</Text>
        <View style={s.demo}>
          {FORMS.map((f) => (
            <View key={f} style={s.demoCell}>
              <ArabicText size={40} color={c.primary}>
                {formText('ب', f, true)}
              </ArabicText>
              <Text style={s.demoLabel}>{FORM_LABELS[f]}</Text>
            </View>
          ))}
        </View>
      </Card>

      <SectionTitle title="Letters that do not join forward" />
      <Card tone="gold">
        <View style={s.nonJoin}>
          {NON_JOINERS.map((l) => (
            <ArabicText key={l.id} size={36} color={c.text}>
              {l.char}
            </ArabicText>
          ))}
        </View>
        <Text style={s.body}>These six letters connect to the letter before them but never to the letter after. The next letter starts fresh, which creates a small gap inside the word — as in دَرْس, written in three pieces.</Text>
      </Card>

      <View style={{ gap: 6 }}>
        <ProgressBar value={p.ratio} />
        <Text style={s.meta}>
          {p.done} of {p.total} letters written in all four forms
        </Text>
      </View>

      {LETTERS.map((l) => {
        const done = isCompleted(lessonKey.forms(l.id));
        return (
          <Card key={l.id} onPress={() => router.push(`/learn/letter/${l.id}?mode=forms`)} style={s.row} accessibilityLabel={`${l.name} forms${done ? ', completed' : ''}`}>
            <View style={{ width: 70 }}>
              <Text style={s.name}>{l.name}</Text>
              {done ? (
                <View style={s.doneRow}>
                  <Ionicons name="checkmark-circle" size={14} color={c.success} />
                  <Text style={s.doneText}>Done</Text>
                </View>
              ) : (
                <Text style={s.meta}>{l.joinsForward ? '4 shapes' : 'Non-joiner'}</Text>
              )}
            </View>
            <View style={s.formsRow}>
              {FORMS.map((f) => (
                <ArabicText key={f} size={26} color={c.text} style={{ flex: 1 }}>
                  {formText(l.char, f, l.joinsForward)}
                </ArabicText>
              ))}
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: c.text },
  demo: { flexDirection: 'row-reverse', gap: 8, marginTop: 10 },
  demoCell: { flex: 1, alignItems: 'center', backgroundColor: c.surfaceAlt, borderRadius: radius.sm },
  demoLabel: { fontFamily: fonts.medium, fontSize: 11, color: c.textMuted, marginTop: -6, marginBottom: 6 },
  nonJoin: { flexDirection: 'row-reverse', justifyContent: 'space-around', marginBottom: 6 },
  meta: { fontFamily: fonts.regular, fontSize: 12, color: c.textMuted },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, gap: 8 },
  name: { fontFamily: fonts.semibold, fontSize: 15, color: c.text },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  doneText: { fontFamily: fonts.medium, fontSize: 12, color: c.success },
  formsRow: { flex: 1, flexDirection: 'row-reverse' },
}));
