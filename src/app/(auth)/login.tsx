import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Field, isEmail } from '@/components/AuthForm';
import { Banner } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { LogoMark } from '@/components/ui/Logo';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/state/AuthProvider';
import { useSettings } from '@/state/SettingsProvider';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/typography';

export default function Login() {
  const s = useStyles();
  const { c } = useTheme();
  const auth = useAuth();
  const { update } = useSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const e: typeof errors = {};
    if (!isEmail(email)) e.email = 'Enter a valid email address.';
    if (!password) e.password = 'Enter your password.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    const res = await auth.signIn(email, password);
    setBusy(false);
    if (!res.ok) return setErrors({ form: res.error });
    update({ authMode: 'cloud' });
    router.replace('/(tabs)');
  };

  const continueLocal = () => {
    update({ authMode: 'local' });
    router.replace('/(tabs)');
  };

  return (
    <Screen keyboard edges={['top', 'bottom']} contentStyle={{ paddingTop: 32 }}>
      <View style={s.brand}>
        <LogoMark size={64} ring={c.primary} star="#C6A15B" glyph="#F8F5EC" />
        <Text style={s.title}>Welcome back</Text>
        <Text style={s.subtitle}>Sign in to keep your progress safe across devices.</Text>
      </View>

      {!auth.configured ? (
        <Banner text="Development mode: cloud accounts are not connected in this build yet. You can use ILMORA fully — your progress is saved on this device." />
      ) : null}

      {errors.form ? <Banner tone="error" text={errors.form} /> : null}

      <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" error={errors.email} editable={auth.configured} />
      <Field label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secure autoComplete="password" error={errors.password} editable={auth.configured} onSubmitEditing={submit} />

      <Button title="Sign in" onPress={submit} loading={busy} disabled={!auth.configured} />

      <View style={s.divider}>
        <View style={s.line} />
        <Text style={s.or}>or</Text>
        <View style={s.line} />
      </View>

      <Button title="Continue without an account" variant="ghost" icon="phone-portrait-outline" onPress={continueLocal} accessibilityHint="Progress is stored only on this device" />

      {auth.configured ? (
        <Pressable onPress={() => router.push('/(auth)/register')} accessibilityRole="button" style={{ alignSelf: 'center', padding: 8 }}>
          <Text style={s.link}>
            New to ILMORA? <Text style={{ color: c.primary, fontFamily: fonts.semibold }}>Create an account</Text>
          </Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  brand: { alignItems: 'center', gap: 8, marginBottom: 8 },
  title: { fontFamily: fonts.bold, fontSize: 26, color: c.text, marginTop: 8 },
  subtitle: { fontFamily: fonts.regular, fontSize: 15, color: c.textMuted, textAlign: 'center' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  line: { flex: 1, height: 1, backgroundColor: c.border },
  or: { fontFamily: fonts.regular, color: c.textMuted },
  link: { fontFamily: fonts.regular, fontSize: 15, color: c.textMuted },
}));
