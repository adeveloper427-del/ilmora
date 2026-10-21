import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useSettings } from '@/state/SettingsProvider';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/typography';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  contentStyle?: ViewStyle;
  keyboard?: boolean;
};

/** Page shell: safe areas, themed background, optional scrolling and keyboard avoidance. */
export function Screen({ children, scroll = true, edges = ['top'], contentStyle, keyboard }: ScreenProps) {
  const s = useStyles();
  const body = scroll ? (
    <ScrollView contentContainerStyle={[s.content, contentStyle]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[s.fill, contentStyle]}>{children}</View>
  );
  return (
    <SafeAreaView style={s.root} edges={edges}>
      {keyboard ? (
        <KeyboardAvoidingView style={s.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
}

type HeaderProps = { title: string; arabic?: string; subtitle?: string; back?: boolean; right?: ReactNode };

export function ScreenHeader({ title, arabic, subtitle, back = true, right }: HeaderProps) {
  const s = useStyles();
  const { c } = useTheme();
  const { settings } = useSettings();
  return (
    <View style={s.header}>
      {back && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={({ pressed }) => [s.back, pressed && { backgroundColor: c.surfaceAlt }]}
        >
          <Ionicons name="chevron-back" size={24} color={c.text} />
        </Pressable>
      )}
      <View style={{ flex: 1 }}>
        <Text style={s.title} numberOfLines={1} accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? <Text style={s.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {arabic && settings.showArabicLabels ? <Text style={s.arabic}>{arabic}</Text> : null}
      {right}
    </View>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const s = useStyles();
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button">
          <Text style={s.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.bg },
  fill: { flex: 1 },
  content: { padding: 16, paddingBottom: 40, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 52 },
  back: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: -8 },
  title: { fontFamily: fonts.bold, fontSize: 22, color: c.text },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, color: c.textMuted, marginTop: 1 },
  arabic: { fontFamily: fonts.arabic, fontSize: 20, color: c.gold, lineHeight: 36 },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  sectionTitle: { fontFamily: fonts.semibold, fontSize: 17, color: c.text },
  sectionAction: { fontFamily: fonts.semibold, fontSize: 14, color: c.primary },
}));
