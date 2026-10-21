import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Avatar, ListRow, StatTile } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { GeometricPattern } from '@/components/ui/Pattern';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { currentLevel } from '@/data/curriculum';
import { confirm } from '@/lib/confirm';
import { useAuth } from '@/state/AuthProvider';
import { useProgress } from '@/state/ProgressProvider';
import { useRecordings } from '@/state/RecordingsProvider';
import { useSettings } from '@/state/SettingsProvider';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/typography';

export default function Profile() {
  const s = useStyles();
  const { c } = useTheme();
  const { settings, update } = useSettings();
  const auth = useAuth();
  const { stats, attempts, isCompleted } = useProgress();
  const { recordings } = useRecordings();
  const level = currentLevel(isCompleted);
  const name = settings.studentName.trim() || 'Student';

  const logOut = async () => {
    const message = auth.session
      ? 'Your progress stays on this device. Sign in again to keep syncing.'
      : 'You will return to the login screen. Your progress stays saved on this device.';
    if (!(await confirm('Log out?', message, 'Log out'))) return;
    if (auth.session) await auth.signOut();
    update({ authMode: null });
    router.replace('/(auth)/login');
  };

  return (
    <Screen>
      <ScreenHeader title="Profile" arabic="ملفي" back={false} />
      <Card tone="primary" style={s.hero}>
        <GeometricPattern color="#C6A15B" opacity={0.15} size={52} />
        <Avatar name={name} color={settings.avatarColor} size={72} />
        <Text style={s.name}>{name}</Text>
        <Text style={s.level}>
          Level {level.id} · {level.title}
        </Text>
        <Text style={s.account}>{auth.session ? auth.email : 'Progress saved on this device'}</Text>
      </Card>

      <Pressable onPress={() => router.push('/upgrade')} accessibilityRole="button" accessibilityLabel="Upgrade to ILMORA Pro" style={({ pressed }) => [s.pro, pressed && { opacity: 0.9 }]}>
        <View style={s.proIcon}>
          <Ionicons name="sparkles" size={18} color="#2A2112" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.proTitle}>Go Pro for your madrasa</Text>
          <Text style={s.proBody}>Attendance, fees and hifz tracking · KSh 3,000/month</Text>
        </View>
        <View style={s.proBtn}>
          <Text style={s.proBtnText}>Upgrade</Text>
        </View>
      </Pressable>

      <View style={s.tiles}>
        <StatTile icon="checkmark-done" value={`${stats.completedCount}`} label="lessons done" />
        <StatTile icon="flame" tint={c.gold} value={`${stats.streak}`} label="day streak" />
      </View>
      <View style={s.tiles}>
        <StatTile icon="bookmark" value={`${attempts.length}`} label="writing saved" />
        <StatTile icon="mic" value={`${recordings.length}`} label="recordings" />
      </View>

      <Card style={{ padding: 6 }}>
        <ListRow icon="stats-chart-outline" title="Progress" subtitle="Levels, practice time and streak" onPress={() => router.push('/progress')} />
        <ListRow icon="bookmark-outline" title="Saved writing" subtitle={`${attempts.length} attempts`} onPress={() => router.push('/attempts')} />
        <ListRow icon="albums-outline" title="Saved recordings" subtitle={`${recordings.length} recordings`} onPress={() => router.push('/recordings')} />
        <ListRow icon="flag-outline" title="Daily goal" subtitle={`${settings.dailyGoalMinutes} minutes of writing a day`} onPress={() => router.push('/settings')} />
      </Card>

      <Card style={{ padding: 6 }}>
        <ListRow icon="settings-outline" title="Settings" subtitle="Theme, sound, writing and account" onPress={() => router.push('/settings')} />
        {!auth.session && auth.configured ? (
          <ListRow icon="cloud-upload-outline" title="Sign in to sync" subtitle="Keep your progress safe across devices" onPress={() => router.push('/(auth)/login')} />
        ) : null}
      </Card>

      <Button title="Log out" variant="danger" icon="log-out-outline" onPress={logOut} accessibilityHint="Returns to the login screen" />
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  hero: { alignItems: 'center', paddingVertical: 24, gap: 6 },
  name: { fontFamily: fonts.bold, fontSize: 22, color: '#fff', marginTop: 6 },
  level: { fontFamily: fonts.medium, fontSize: 14, color: '#E5D3A7' },
  account: { fontFamily: fonts.regular, fontSize: 13, color: '#CFE1D6' },
  tiles: { flexDirection: 'row', gap: 10 },
  pro: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.goldTint, borderRadius: radius.lg, borderWidth: 1.5, borderColor: '#D9B871', padding: 14 },
  proIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#D9B871', alignItems: 'center', justifyContent: 'center' },
  proTitle: { fontFamily: fonts.bold, fontSize: 15, color: c.text },
  proBody: { fontFamily: fonts.regular, fontSize: 12, color: c.textMuted, marginTop: 2 },
  proBtn: { backgroundColor: c.primary, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8 },
  proBtnText: { fontFamily: fonts.semibold, fontSize: 13, color: c.onPrimary },
}));
