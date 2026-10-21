import { Href, router } from 'expo-router';
import { ReactNode, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ArabicText } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { FinishInfo, WritingPractice } from '@/components/writing/WritingPractice';
import { AttemptKind, useProgress } from '@/state/ProgressProvider';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/typography';
import { Completion, StepIndicator } from './Lesson';

type Phase = 'trace' | 'memory';

type Props = {
  lessonKey: string;
  title: string;
  subtitle?: string;
  kind: AttemptKind;
  refId: string;
  /** Text to write, split into parts when it is long. Each part is traced, then written from memory. */
  parts: string[];
  intro: ReactNode;
  example: ReactNode;
  phases?: Phase[];
  /** Shown on the completion screen after the default buttons. */
  completionActions?: ReactNode;
  next?: { label: string; onPress: () => void };
  backToList: { label: string; route: string };
  headerRight?: ReactNode;
};

const PHASE_LABEL: Record<Phase, string> = { trace: 'Trace', memory: 'From memory' };

/** Intro → Example → Practice (trace, then from memory, part by part) → Done. */
export function WritingLesson({ lessonKey, title, subtitle, kind, refId, parts, intro, example, phases = ['trace', 'memory'], completionActions, next, backToList, headerRight }: Props) {
  const s = useStyles();
  const { c } = useTheme();
  const progress = useProgress();
  const [step, setStep] = useState(0);
  const [task, setTask] = useState(0);
  const [results, setResults] = useState<FinishInfo[]>([]);

  const tasks = parts.flatMap((part, i) => phases.map((phase) => ({ part, partIndex: i, phase })));
  const stepLabels = ['Intro', 'Example', ...phases.map((p) => PHASE_LABEL[p]), 'Done'];
  const current = tasks[task];
  const practiceStepIndex = 2 + phases.indexOf(current?.phase ?? 'trace');
  const indicatorIndex = step < 2 ? step : step === 3 ? stepLabels.length - 1 : practiceStepIndex;

  useEffect(() => {
    progress.startLesson(lessonKey, title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonKey]);

  const onFinish = (info: FinishInfo) => {
    setResults((r) => [...r, info]);
    if (task + 1 < tasks.length) {
      setTask(task + 1);
    } else {
      progress.completeLesson(lessonKey, title);
      setStep(3);
    }
  };

  const restart = () => {
    setResults([]);
    setTask(0);
    setStep(2);
  };

  const header = <ScreenHeader title={title} subtitle={subtitle} right={headerRight} />;

  if (step === 2 && current) {
    const isMemory = current.phase === 'memory';
    return (
      <Screen scroll={false} contentStyle={{ padding: 16, paddingTop: 0, gap: 10 }} edges={['top', 'bottom']}>
        {header}
        <StepIndicator steps={stepLabels} index={indicatorIndex} />
        <View style={s.taskRow}>
          <Text style={s.taskLabel}>
            {parts.length > 1 ? `Part ${current.partIndex + 1} of ${parts.length} · ` : ''}
            {isMemory ? 'Write it from memory' : 'Trace over the guide'}
          </Text>
          <Text style={s.taskCount}>
            {task + 1}/{tasks.length}
          </Text>
        </View>
        {isMemory ? (
          <Text style={s.memoryHint}>The guide is hidden. Write what you remember, then tap Compare to check.</Text>
        ) : (
          <View style={s.reference}>
            <ArabicText size={parts.length > 1 ? 26 : 30} color={c.primary}>
              {current.part}
            </ArabicText>
          </View>
        )}
        <WritingPractice
          key={`${task}`}
          draftKey={`${lessonKey}:${task}`}
          target={current.part}
          kind={kind}
          refId={refId}
          title={parts.length > 1 ? `${title} (part ${current.partIndex + 1})` : title}
          initialGuide={isMemory ? 'off' : 'strong'}
          onFinish={onFinish}
          finishLabel={task + 1 < tasks.length ? 'Next' : 'Finish'}
        />
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom']} scroll={false} contentStyle={{ padding: 16, paddingTop: 0 }}>
      {header}
      <StepIndicator steps={stepLabels} index={indicatorIndex} />
      {step === 3 ? (
        <Completion
          title="Lesson complete"
          message={`You traced and then wrote ${parts.length > 1 ? `all ${parts.length} parts` : 'it'} from memory. Saved attempts are in your writing collection.`}
          details={[
            `${results.reduce((n, r) => n + r.strokeCount, 0)} strokes across ${results.length} exercise${results.length === 1 ? '' : 's'}`,
            ...(results.some((r) => r.guideShown)
              ? [`${Math.round((results.filter((r) => r.guideShown).reduce((n, r) => n + r.insideRatio, 0) / Math.max(1, results.filter((r) => r.guideShown).length)) * 100)}% of traced ink was on the guide area`]
              : []),
            'Feedback shows where you wrote, not handwriting accuracy',
          ]}
        >
          {next ? <Button title={next.label} icon="arrow-forward" onPress={next.onPress} /> : null}
          {completionActions}
          <Button title="Practise again" variant="ghost" icon="refresh" onPress={restart} />
          <Button title={backToList.label} variant="ghost" onPress={() => router.replace(backToList.route as Href)} />
        </Completion>
      ) : (
        <ScrollView contentContainerStyle={{ gap: 16, paddingVertical: 16 }} showsVerticalScrollIndicator={false}>
          {step === 0 ? intro : example}
          <View style={s.nav}>
            {step > 0 ? <Button title="Back" variant="ghost" onPress={() => setStep(step - 1)} style={{ flex: 1 }} /> : null}
            <Button
              title={step === 1 ? 'Start writing' : 'Next'}
              icon={step === 1 ? 'create-outline' : 'arrow-forward'}
              onPress={() => {
                if (step === 1) setTask(0);
                setStep(step + 1);
              }}
              style={{ flex: 2 }}
            />
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  taskRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  taskLabel: { fontFamily: fonts.semibold, fontSize: 15, color: c.text, flex: 1 },
  taskCount: { fontFamily: fonts.medium, fontSize: 13, color: c.textMuted },
  memoryHint: { fontFamily: fonts.regular, fontSize: 13, color: c.textMuted, lineHeight: 19 },
  reference: { backgroundColor: c.surface, borderRadius: 14, borderWidth: 1, borderColor: c.border, paddingHorizontal: 12 },
  nav: { flexDirection: 'row', gap: 10, marginTop: 8 },
}));
