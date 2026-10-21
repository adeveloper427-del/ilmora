import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, NativeScrollEvent, NativeSyntheticEvent, Platform, Pressable, ScrollView, ScrollViewInstance, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArabicText } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { LogoMark } from '@/components/ui/Logo';
import { GeometricPattern } from '@/components/ui/Pattern';
import { useSettings } from '@/state/SettingsProvider';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/typography';

const SLIDES = [
  {
    icon: 'create-outline' as const,
    arabic: 'ب ت ث',
    title: 'Write Arabic by hand',
    body: 'Trace every letter of the alphabet with your finger or a stylus, then learn how letters change shape and join together.',
  },
  {
    icon: 'eye-off-outline' as const,
    arabic: 'كِتَاب',
    title: 'Trace, then write alone',
    body: 'Start with a clear guide, fade it, then hide it and write from memory. Compare with the model whenever you like.',
  },
  {
    icon: 'mic-outline' as const,
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
    title: 'Practise Quranic writing and recitation',
    body: 'Write short verses from accurately sourced text, and record yourself reading so you can listen back.',
  },
];

export default function Onboarding() {
  const s = useStyles();
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const { settings, update } = useSettings();
  const [page, setPage] = useState(0);
  const [name, setName] = useState(settings.studentName);
  const scroller = useRef<ScrollViewInstance>(null);
  const last = SLIDES.length; // name page index

  const go = (i: number) => {
    scroller.current?.scrollTo({ x: i * width, animated: true });
    setPage(i);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => setPage(Math.round(e.nativeEvent.contentOffset.x / width));

  const finish = () => {
    update({ onboarded: true, studentName: name.trim() });
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={s.root}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.top}>
          <LogoMark size={40} ring={c.primary} star="#C6A15B" glyph="#F8F5EC" />
          {page < last ? (
            <Pressable onPress={() => go(last)} hitSlop={10} accessibilityRole="button">
              <Text style={s.skip}>Skip</Text>
            </Pressable>
          ) : null}
        </View>
        <ScrollView ref={scroller} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={onScroll} keyboardShouldPersistTaps="handled">
          {SLIDES.map((sl) => (
            <View key={sl.title} style={[s.page, { width }]}>
              <View style={s.art}>
                <GeometricPattern color={c.gold} opacity={0.18} size={48} />
                <ArabicText size={sl.arabic.length > 8 ? 34 : 54} color={c.primary}>
                  {sl.arabic}
                </ArabicText>
                <View style={s.artIcon}>
                  <Ionicons name={sl.icon} size={22} color={c.onPrimary} />
                </View>
              </View>
              <Text style={s.title}>{sl.title}</Text>
              <Text style={s.body}>{sl.body}</Text>
            </View>
          ))}
          <View style={[s.page, { width }]}>
            <Text style={s.salaam}>Assalamu Alaikum</Text>
            <ArabicText size={30} color={c.gold}>
              السلام عليكم
            </ArabicText>
            <Text style={[s.body, { marginTop: 12 }]}>What should we call you? This is shown on your dashboard and profile.</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={c.textFaint}
              style={s.input}
              autoCapitalize="words"
              returnKeyType="done"
              maxLength={40}
              onSubmitEditing={finish}
              accessibilityLabel="Your name"
            />
          </View>
        </ScrollView>
        <View style={s.footer}>
          <View style={s.dots}>
            {[...SLIDES, null].map((_, i) => (
              <View key={i} style={[s.dot, i === page && s.dotActive]} />
            ))}
          </View>
          {page < last ? <Button title="Next" icon="arrow-forward" onPress={() => go(page + 1)} /> : <Button title="Start learning" onPress={finish} />}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.bg },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, height: 56 },
  skip: { fontFamily: fonts.semibold, fontSize: 15, color: c.primary },
  page: { paddingHorizontal: 28, justifyContent: 'center', gap: 12 },
  art: {
    height: 220,
    borderRadius: radius.lg,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 20,
  },
  artIcon: { position: 'absolute', bottom: 14, right: 14, width: 40, height: 40, borderRadius: 20, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.bold, fontSize: 26, color: c.text },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: c.textMuted },
  salaam: { fontFamily: fonts.bold, fontSize: 28, color: c.text, textAlign: 'center' },
  input: {
    marginTop: 8,
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
    paddingHorizontal: 16,
    fontFamily: fonts.regular,
    fontSize: 17,
    color: c.text,
  },
  footer: { padding: 20, gap: 18 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.border },
  dotActive: { width: 24, backgroundColor: c.primary },
}));
