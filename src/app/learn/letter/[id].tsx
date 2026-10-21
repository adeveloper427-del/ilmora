import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Completion, StepIndicator } from '@/components/lesson/Lesson';
import { ArabicText, Banner, Chip, EmptyState } from '@/components/ui/Bits';
import { Button, IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { FinishInfo, WritingPractice } from '@/components/writing/WritingPractice';
import { lessonKey } from '@/data/curriculum';
import { FORM_LABELS, FORMS, formText, getLetter, LetterForm, LETTERS } from '@/data/letters';
import { useProgress } from '@/state/ProgressProvider';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/typography';

const STEPS = ['Intro', 'Example', 'Practice', 'Done'];

export default function LetterLesson() {
  const s = useStyles();
  const { c } = useTheme();
  const params = useLocalSearchParams<{ id: string; mode?: string }>();
  const formsMode = params.mode === 'forms';
  const letter = getLetter(params.id);
  const progress = useProgress();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<LetterForm>('isolated');
  const [formsDone, setFormsDone] = useState<LetterForm[]>([]);
  const [result, setResult] = useState<FinishInfo | null>(null);

  const key = letter ? (formsMode ? lessonKey.forms(letter.id) : lessonKey.letter(letter.id)) : '';
  const title = letter ? (formsMode ? `${letter.name} — letter forms` : `Letter ${letter.name}`) : '';

  useEffect(() => {
    if (letter) progress.startLesson(key, title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!letter) {
    return (
      <Screen>
        <ScreenHeader title="Letter not found" />
        <EmptyState icon="alert-circle-outline" title="We couldn't find that letter" message="It may have been removed. Go back to the alphabet to choose another." action={<Button title="Open alphabet" onPress={() => router.replace('/learn/alphabet')} />} />
      </Screen>
    );
  }

  const index = LETTERS.indexOf(letter);
  const prev = LETTERS[index - 1];
  const next = LETTERS[index + 1];
  const goLetter = (id: string) => router.replace(`/learn/letter/${id}${formsMode ? '?mode=forms' : ''}`);

  const onFinish = (info: FinishInfo) => {
    progress.markLetterPractised(letter.id);
    setResult(info);
    if (!formsMode) {
      progress.completeLesson(lessonKey.letter(letter.id), `Letter ${letter.name}`);
      setStep(3);
      return;
    }
    const done = formsDone.includes(form) ? formsDone : [...formsDone, form];
    setFormsDone(done);
    const remaining = FORMS.filter((f) => !done.includes(f));
    if (remaining.length === 0) {
      progress.completeLesson(lessonKey.forms(letter.id), `${letter.name} — letter forms`);
      setStep(3);
    } else {
      setForm(remaining[0]);
    }
  };

  const header = (
    <ScreenHeader
      title={title}
      subtitle={`Letter ${letter.order} of 28`}
      right={
        <View style={{ flexDirection: 'row' }}>
          <IconButton icon="chevron-back" label="Previous letter" onPress={() => prev && goLetter(prev.id)} disabled={!prev} size={40} />
          <IconButton icon="chevron-forward" label="Next letter" onPress={() => next && goLetter(next.id)} disabled={!next} size={40} />
        </View>
      }
    />
  );

  if (step === 2) {
    return (
      <Screen scroll={false} contentStyle={{ padding: 16, paddingTop: 0, gap: 10 }} edges={['top', 'bottom']}>
        {header}
        <StepIndicator steps={STEPS} index={step} />
        <View style={s.chips}>
          {FORMS.map((f) => (
            <Chip key={f} label={FORM_LABELS[f]} selected={form === f} icon={formsDone.includes(f) ? 'checkmark-circle' : undefined} onPress={() => setForm(f)} />
          ))}
        </View>
        <View style={s.targetRow}>
          <Text style={s.targetLabel}>
            {FORM_LABELS[form]} form of {letter.name}
            {formsMode ? ` · ${formsDone.length}/4 done` : ''}
          </Text>
          <ArabicText size={26} color={c.primary}>
            {formText(letter.char, form, letter.joinsForward)}
          </ArabicText>
        </View>
        <WritingPractice
          key={`${letter.id}-${form}`}
          draftKey={`letter:${letter.id}:${form}`}
          target={formText(letter.char, form, letter.joinsForward)}
          kind={form === 'isolated' ? 'letter' : 'form'}
          refId={`${letter.id}:${form}`}
          title={`${letter.name} (${FORM_LABELS[form].toLowerCase()})`}
          onFinish={onFinish}
          finishLabel={formsMode ? 'Done' : form === 'isolated' ? 'Finish' : 'Done'}
        />
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom']} scroll={false} contentStyle={{ padding: 16, paddingTop: 0 }}>
      {header}
      <StepIndicator steps={STEPS} index={step} />
      {step === 3 ? (
        <Completion
          title={formsMode ? `All four forms of ${letter.name}` : `You traced ${letter.name}!`}
          message={formsMode ? 'You wrote this letter in every position it can take in a word.' : 'Practise the other forms whenever you are ready, or move on to the next letter.'}
          details={
            result
              ? [
                  `${result.strokeCount} stroke${result.strokeCount === 1 ? '' : 's'} in your last attempt`,
                  result.guideShown ? `${Math.round(result.insideRatio * 100)}% of your ink was on the guide area` : 'Written with the guide hidden',
                  'Feedback shows where you wrote, not handwriting accuracy',
                ]
              : undefined
          }
        >
          {next ? <Button title={`Next letter: ${next.name}`} icon="arrow-forward" onPress={() => goLetter(next.id)} /> : <Button title="Back to the alphabet" onPress={() => router.replace(formsMode ? '/learn/forms' : '/learn/alphabet')} />}
          {!formsMode ? <Button title="Practise all four forms" variant="secondary" icon="shapes-outline" onPress={() => router.replace(`/learn/letter/${letter.id}?mode=forms`)} /> : null}
          <Button
            title="Try again"
            variant="ghost"
            icon="refresh"
            onPress={() => {
              setFormsDone([]);
              setForm('isolated');
              setStep(2);
            }}
          />
        </Completion>
      ) : (
        <ScrollView contentContainerStyle={{ gap: 16, paddingVertical: 16 }} showsVerticalScrollIndicator={false}>
          {step === 0 ? (
            <>
              <Card style={s.hero}>
                <ArabicText size={120} color={c.primary}>
                  {letter.char}
                </ArabicText>
                <Text style={s.name}>{letter.name}</Text>
                <ArabicText size={24} color={c.gold}>
                  {letter.arabicName}
                </ArabicText>
              </Card>
              <Card>
                <Row icon="volume-medium-outline" label="Sound" value={letter.sound} />
                <Row icon="git-merge-outline" label="Joining" value={letter.joinsForward ? 'Joins to the letter after it' : 'Never joins to the letter after it'} />
                <Row icon="list-outline" label="Position" value={`Letter ${letter.order} of the alphabet`} />
              </Card>
              {formsMode ? (
                <Banner text={`In this lesson you will write ${letter.name} in all four positions: on its own, at the start, in the middle and at the end of a word.`} />
              ) : (
                <Banner text="When writing, start on the right and move left. Write the main shape first, then add any dots." />
              )}
            </>
          ) : (
            <>
              <Text style={s.section}>The four forms</Text>
              <View style={s.forms}>
                {FORMS.map((f) => (
                  <View key={f} style={s.formCell}>
                    <ArabicText size={44} color={c.text}>
                      {formText(letter.char, f, letter.joinsForward)}
                    </ArabicText>
                    <Text style={s.formLabel}>{FORM_LABELS[f]}</Text>
                  </View>
                ))}
              </View>
              {!letter.joinsForward ? (
                <Banner text={`${letter.name} is one of six letters (ا د ذ ر ز و) that never connect to the next letter, so its initial form looks like its isolated form and its medial form looks like its final form.`} />
              ) : null}
              <Text style={s.section}>Example word</Text>
              <Card tone="gold" style={{ alignItems: 'center' }}>
                <ArabicText size={52} color={c.primary}>
                  {letter.example.arabic}
                </ArabicText>
                <Text style={s.translit}>{letter.example.transliteration}</Text>
                <Text style={s.meaning}>“{letter.example.meaning}”</Text>
              </Card>
            </>
          )}
          <View style={s.nav}>
            {step > 0 ? <Button title="Back" variant="ghost" onPress={() => setStep(step - 1)} style={{ flex: 1 }} /> : null}
            <Button title={step === 1 ? 'Start writing' : 'Next'} icon={step === 1 ? 'create-outline' : 'arrow-forward'} onPress={() => setStep(step + 1)} style={{ flex: 2 }} />
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}

function Row({ icon, label, value }: { icon: 'volume-medium-outline' | 'git-merge-outline' | 'list-outline'; label: string; value: string }) {
  const s = useStyles();
  const { c } = useTheme();
  return (
    <View style={s.row}>
      <Ionicons name={icon} size={18} color={c.primary} />
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value}</Text>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  hero: { alignItems: 'center', paddingVertical: 8 },
  name: { fontFamily: fonts.bold, fontSize: 24, color: c.text, marginTop: -10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  rowLabel: { fontFamily: fonts.medium, fontSize: 14, color: c.textMuted, width: 70 },
  rowValue: { fontFamily: fonts.regular, fontSize: 14, color: c.text, flex: 1 },
  section: { fontFamily: fonts.semibold, fontSize: 17, color: c.text },
  // Forms read right to left: isolated on the right, final on the left.
  forms: { flexDirection: 'row-reverse', gap: 8 },
  formCell: { flex: 1, backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, alignItems: 'center', paddingVertical: 6 },
  formLabel: { fontFamily: fonts.medium, fontSize: 11, color: c.textMuted, marginTop: -6, marginBottom: 4 },
  translit: { fontFamily: fonts.semibold, fontSize: 16, color: c.text, marginTop: -6 },
  meaning: { fontFamily: fonts.regular, fontSize: 14, color: c.textMuted },
  nav: { flexDirection: 'row', gap: 10, marginTop: 8 },
  chips: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  targetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  targetLabel: { fontFamily: fonts.medium, fontSize: 14, color: c.textMuted, flex: 1 },
}));
