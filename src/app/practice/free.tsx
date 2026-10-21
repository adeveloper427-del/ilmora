import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { ArabicText, Chip } from '@/components/ui/Bits';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { WritingPractice } from '@/components/writing/WritingPractice';
import { LETTERS } from '@/data/letters';
import { WORDS } from '@/data/words';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';

type Model = { label: string; text: string } | null;

const MODELS: { label: string; text: string }[] = [
  ...WORDS.filter((w) => w.level !== 'advanced').map((w) => ({ label: w.transliteration, text: w.word })),
  ...LETTERS.slice(0, 6).map((l) => ({ label: l.name, text: l.char })),
];

export default function FreeWriting() {
  const s = useStyles();
  const { c } = useTheme();
  const [model, setModel] = useState<Model>(null);

  return (
    <Screen scroll={false} contentStyle={{ padding: 16, paddingTop: 0, gap: 10 }} edges={['top', 'bottom']}>
      <ScreenHeader title="Free writing" arabic="كتابة حرّة" subtitle="Write anything — optionally copy a model" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ flexGrow: 0 }}>
        <Chip label="Blank page" selected={!model} onPress={() => setModel(null)} icon="document-outline" />
        {MODELS.map((m) => (
          <Chip key={m.text} label={m.label} selected={model?.text === m.text} onPress={() => setModel(m)} />
        ))}
      </ScrollView>
      {model ? (
        <View style={s.model}>
          <ArabicText size={30} color={c.primary}>
            {model.text}
          </ArabicText>
        </View>
      ) : null}
      <WritingPractice
        key={model?.text ?? 'blank'}
        draftKey={`free:${model?.text ?? 'blank'}`}
        target={model?.text ?? ''}
        kind="free"
        refId={model?.text ?? 'blank'}
        title={model ? `Free writing: ${model.label}` : 'Free writing'}
      />
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  model: { backgroundColor: c.surface, borderRadius: 14, borderWidth: 1, borderColor: c.border },
}));
