import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Switch, Text, TextInput, View } from 'react-native';
import { Banner, ListRow, Segmented } from '@/components/ui/Bits';
import { Card } from '@/components/ui/Card';
import { Screen, ScreenHeader, SectionTitle } from '@/components/ui/Screen';
import { RECITERS } from '@/data/reciters';
import { confirm } from '@/lib/confirm';
import { clearAll } from '@/lib/storage';
import { useAuth } from '@/state/AuthProvider';
import { useHifz } from '@/state/HifzProvider';
import { useProgress } from '@/state/ProgressProvider';
import { useRecordings } from '@/state/RecordingsProvider';
import { DEFAULT_SETTINGS, GuideLevel, ThemePref, useSettings } from '@/state/SettingsProvider';
import { inkColors, penSizes } from '@/theme/colors';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/typography';

const AVATAR_COLORS = ['#145C45', '#2E4A8C', '#8A5A2B', '#6B3A6E', '#9B2F3A', '#3C5A5A'];

export default function Settings() {
  const s = useStyles();
  const { c } = useTheme();
  const { settings, update } = useSettings();
  const auth = useAuth();
  const progress = useProgress();
  const recordings = useRecordings();
  const hifz = useHifz();
  const [name, setName] = useState(settings.studentName);

  const resetAll = async () => {
    if (!(await confirm('Reset all progress?', 'This deletes your lessons, memorization, streak, saved writing and recordings from this device. It cannot be undone.', 'Reset'))) return;
    progress.reset();
    recordings.removeAll();
    hifz.reset();
    await clearAll();
    update({ ...DEFAULT_SETTINGS, onboarded: true, authMode: settings.authMode, studentName: settings.studentName });
  };

  return (
    <Screen keyboard edges={['top', 'bottom']}>
      <ScreenHeader title="Settings" arabic="الإعدادات" />

      <SectionTitle title="Student" />
      <Card style={{ gap: 12 }}>
        <Text style={s.label}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          onEndEditing={() => update({ studentName: name.trim() })}
          onBlur={() => update({ studentName: name.trim() })}
          placeholder="Your name"
          placeholderTextColor={c.textFaint}
          style={s.input}
          maxLength={40}
          accessibilityLabel="Your name"
        />
        <Text style={s.label}>Avatar colour</Text>
        <View style={s.swatches}>
          {AVATAR_COLORS.map((col) => (
            <Pressable
              key={col}
              onPress={() => update({ avatarColor: col })}
              accessibilityRole="radio"
              accessibilityState={{ checked: settings.avatarColor === col }}
              accessibilityLabel={`Avatar colour ${col}`}
              style={[s.swatch, { backgroundColor: col }, settings.avatarColor === col && { borderColor: c.gold, borderWidth: 3 }]}
            />
          ))}
        </View>
        <Text style={s.label}>Daily goal</Text>
        <Segmented
          value={settings.dailyGoalMinutes}
          onChange={(v) => update({ dailyGoalMinutes: v })}
          options={[5, 10, 15, 20, 30].map((m) => ({ label: `${m} min`, value: m }))}
        />
      </Card>

      <SectionTitle title="Appearance" />
      <Card style={{ gap: 12 }}>
        <Text style={s.label}>Theme</Text>
        <Segmented<ThemePref>
          value={settings.theme}
          onChange={(v) => update({ theme: v })}
          options={[
            { label: 'System', value: 'system' },
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
          ]}
        />
        <Toggle label="Show Arabic labels" hint="Arabic titles next to English headings" value={settings.showArabicLabels} onChange={(v) => update({ showArabicLabels: v })} />
      </Card>

      <SectionTitle title="Quran recitation" />
      <Card style={{ gap: 10 }}>
        <Text style={s.label}>Reciter</Text>
        <View style={{ gap: 4 }}>
          {RECITERS.map((r) => {
            const on = settings.reciter === r.id;
            return (
              <Pressable
                key={r.id}
                onPress={() => update({ reciter: r.id })}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                style={[s.reciterRow, on && { backgroundColor: c.primaryTint, borderColor: c.primary }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>{r.name}</Text>
                  <Text style={s.hint}>{r.style}</Text>
                </View>
                {on ? <Ionicons name="checkmark-circle" size={20} color={c.primary} /> : null}
              </Pressable>
            );
          })}
        </View>
        <Text style={s.label}>Repeat each verse</Text>
        <Segmented value={settings.verseRepeat} onChange={(v) => update({ verseRepeat: v })} options={[1, 3, 5].map((n) => ({ label: `${n}×`, value: n }))} />
        <Text style={s.hint}>Recitations stream from Quran.com and need an internet connection.</Text>
      </Card>

      <SectionTitle title="Sound & feel" />
      <Card style={{ gap: 4 }}>
        <Toggle label="Haptic feedback" hint="Gentle vibrations on taps and when you finish" value={settings.haptics} onChange={(v) => update({ haptics: v })} />
        <Toggle label="Play in silent mode" hint="iPhone: hear recordings even when the ringer is off" value={settings.playInSilentMode} onChange={(v) => update({ playInSilentMode: v })} />
      </Card>

      <SectionTitle title="Writing defaults" />
      <Card style={{ gap: 12 }}>
        <Text style={s.label}>Tracing guide</Text>
        <Segmented<GuideLevel>
          value={settings.guideLevel}
          onChange={(v) => update({ guideLevel: v })}
          options={[
            { label: 'Guide', value: 'strong' },
            { label: 'Faint', value: 'light' },
            { label: 'Hidden', value: 'off' },
          ]}
        />
        <Text style={s.label}>Pen size</Text>
        <Segmented value={settings.penSize} onChange={(v) => update({ penSize: v })} options={penSizes.map((p) => ({ label: p.name, value: p.value }))} />
        <Text style={s.label}>Ink colour</Text>
        <View style={s.swatches}>
          {inkColors.map((ink) => (
            <Pressable
              key={ink.value}
              onPress={() => update({ penColor: ink.value })}
              accessibilityRole="radio"
              accessibilityState={{ checked: settings.penColor === ink.value }}
              accessibilityLabel={`${ink.name} ink`}
              style={[s.swatch, { backgroundColor: ink.value }, settings.penColor === ink.value && { borderColor: c.gold, borderWidth: 3 }]}
            />
          ))}
        </View>
      </Card>

      <SectionTitle title="Language" />
      <Card>
        <Text style={s.body}>The interface is in English with Arabic headings. A full Arabic interface is planned; lesson content is always shown in Arabic script.</Text>
      </Card>

      <SectionTitle title="Account" />
      <Card style={{ padding: 6 }}>
        {auth.session ? (
          <ListRow icon="person-circle-outline" title="Signed in" subtitle={auth.email ?? ''} />
        ) : auth.configured ? (
          <ListRow icon="cloud-upload-outline" title="Sign in or create an account" subtitle="Sync progress across devices" onPress={() => router.push('/(auth)/login')} />
        ) : (
          <View style={{ padding: 8 }}>
            <Banner text="Development mode — cloud accounts are not connected in this build. Everything is saved on this device." />
          </View>
        )}
        <ListRow icon="trash-outline" title="Reset all progress" subtitle="Delete lessons, writing and recordings on this device" danger onPress={resetAll} />
      </Card>
    </Screen>
  );
}

function Toggle({ label, hint, value, onChange }: { label: string; hint: string; value: boolean; onChange: (v: boolean) => void }) {
  const s = useStyles();
  const { c } = useTheme();
  return (
    <View style={s.toggle}>
      <View style={{ flex: 1 }}>
        <Text style={s.label}>{label}</Text>
        <Text style={s.hint}>{hint}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: c.primary, false: c.border }} thumbColor="#fff" accessibilityLabel={label} />
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  label: { fontFamily: fonts.medium, fontSize: 14, color: c.text },
  hint: { fontFamily: fonts.regular, fontSize: 12, color: c.textMuted, marginTop: 2 },
  body: { fontFamily: fonts.regular, fontSize: 14, color: c.textMuted, lineHeight: 20 },
  input: { minHeight: 50, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, backgroundColor: c.bg, paddingHorizontal: 14, fontFamily: fonts.regular, fontSize: 16, color: c.text },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  swatch: { width: 40, height: 40, borderRadius: 20, borderColor: 'transparent', borderWidth: 0 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  reciterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: radius.sm, borderWidth: 1, borderColor: c.border },
}));
