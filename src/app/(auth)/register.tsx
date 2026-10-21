import { router } from 'expo-router';
import { useState } from 'react';
import { Field, isEmail } from '@/components/AuthForm';
import { Banner } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { useAuth } from '@/state/AuthProvider';
import { useSettings } from '@/state/SettingsProvider';

export default function Register() {
  const auth = useAuth();
  const { settings, update } = useSettings();
  const [name, setName] = useState(settings.studentName);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Enter your name.';
    if (!isEmail(email)) e.email = 'Enter a valid email address.';
    if (password.length < 8) e.password = 'Use at least 8 characters.';
    if (confirm !== password) e.confirm = 'Passwords do not match.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    const res = await auth.signUp(name, email, password);
    setBusy(false);
    if (!res.ok) return setErrors({ form: res.error });
    update({ studentName: name.trim() });
    if (res.needsConfirmation) {
      setSent(true);
      return;
    }
    update({ authMode: 'cloud' });
    router.replace('/(tabs)');
  };

  return (
    <Screen keyboard edges={['top', 'bottom']}>
      <ScreenHeader title="Create account" subtitle="Save your progress to the cloud" />
      {sent ? (
        <>
          <Banner tone="success" text={`We sent a confirmation link to ${email.trim()}. Open it, then come back and sign in.`} />
          <Button title="Back to sign in" onPress={() => router.replace('/(auth)/login')} />
        </>
      ) : (
        <>
          {errors.form ? <Banner tone="error" text={errors.form} /> : null}
          <Field label="Full name" value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" autoComplete="name" error={errors.name} />
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" error={errors.email} />
          <Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" secure autoComplete="new-password" error={errors.password} />
          <Field label="Confirm password" value={confirm} onChangeText={setConfirm} placeholder="Repeat your password" secure error={errors.confirm} onSubmitEditing={submit} />
          <Button title="Create account" onPress={submit} loading={busy} />
        </>
      )}
    </Screen>
  );
}
