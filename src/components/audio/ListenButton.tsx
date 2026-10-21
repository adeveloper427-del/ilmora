import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { getReciter } from '@/data/reciters';
import { useSettings } from '@/state/SettingsProvider';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/typography';
import { useRecitation } from './useRecitation';

/** Plays the recitation of one verse. */
export function ListenButton({ verseKey }: { verseKey: string }) {
  const s = useStyles();
  const { c } = useTheme();
  const { settings } = useSettings();
  const rec = useRecitation();

  const onPress = () => {
    if (rec.state === 'playing') rec.pause();
    else if (rec.state === 'paused') rec.resume();
    else if (rec.state === 'idle') rec.play([verseKey]);
  };

  return (
    <View style={{ gap: 6 }}>
      <View style={s.btn}>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={rec.state === 'playing' ? 'Pause recitation' : 'Listen to this verse'}
          style={({ pressed }) => [s.main, pressed && { opacity: 0.85 }]}
        >
          <View style={s.icon}>
            {rec.state === 'loading' ? (
              <ActivityIndicator color={c.onPrimary} size="small" />
            ) : (
              <Ionicons name={rec.state === 'playing' ? 'pause' : 'volume-high'} size={18} color={c.onPrimary} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>{rec.state === 'playing' ? 'Playing…' : rec.state === 'paused' ? 'Paused — tap to resume' : 'Listen to this verse'}</Text>
            <Text style={s.reciter} numberOfLines={1}>
              {getReciter(settings.reciter).name}
            </Text>
          </View>
        </Pressable>
        {rec.active ? (
          <Pressable onPress={rec.stop} hitSlop={8} accessibilityRole="button" accessibilityLabel="Stop recitation" style={s.stop}>
            <Ionicons name="stop-circle-outline" size={26} color={c.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {rec.error ? <Text style={s.error}>{rec.error}</Text> : null}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  btn: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.goldTint, borderRadius: radius.md },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10 },
  stop: { padding: 10 },
  icon: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.gold, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.semibold, fontSize: 14, color: c.text },
  reciter: { fontFamily: fonts.regular, fontSize: 12, color: c.textMuted },
  error: { fontFamily: fonts.regular, fontSize: 12, color: c.danger },
}));
