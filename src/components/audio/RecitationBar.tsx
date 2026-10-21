import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { getReciter, RECITERS } from '@/data/reciters';
import { useSettings } from '@/state/SettingsProvider';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/typography';
import type { useRecitation } from './useRecitation';

type Recitation = ReturnType<typeof useRecitation>;

/** Now-playing strip: verse, reciter (tap to change), repeat count, pause/resume and stop. */
export function RecitationBar({ rec, label }: { rec: Recitation; label: string }) {
  const s = useStyles();
  const { c } = useTheme();
  const { settings, update } = useSettings();
  const [picking, setPicking] = useState(false);
  const reciter = getReciter(settings.reciter);

  return (
    <View style={s.bar}>
      <View style={s.row}>
        <Pressable
          onPress={rec.state === 'playing' ? rec.pause : rec.resume}
          disabled={rec.state === 'loading'}
          accessibilityRole="button"
          accessibilityLabel={rec.state === 'playing' ? 'Pause recitation' : 'Resume recitation'}
          style={s.play}
        >
          {rec.state === 'loading' ? <ActivityIndicator color={c.onPrimary} /> : <Ionicons name={rec.state === 'playing' ? 'pause' : 'play'} size={20} color={c.onPrimary} />}
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.title} numberOfLines={1}>
            {label}
          </Text>
          <Pressable onPress={() => setPicking((p) => !p)} accessibilityRole="button" accessibilityLabel={`Reciter: ${reciter.name}. Change reciter`} hitSlop={6}>
            <Text style={s.reciter} numberOfLines={1}>
              {reciter.name} <Ionicons name={picking ? 'chevron-up' : 'chevron-down'} size={11} />
            </Text>
          </Pressable>
        </View>
        <View style={s.repeat} accessibilityRole="radiogroup" accessibilityLabel="Repeat each verse">
          {[1, 3, 5].map((n) => (
            <Pressable
              key={n}
              onPress={() => update({ verseRepeat: n })}
              accessibilityRole="radio"
              accessibilityState={{ checked: settings.verseRepeat === n }}
              accessibilityLabel={`Repeat each verse ${n} time${n === 1 ? '' : 's'}`}
              style={[s.repeatOpt, settings.verseRepeat === n && s.repeatOn]}
            >
              <Text style={[s.repeatText, settings.verseRepeat === n && { color: c.onPrimary }]}>{n}×</Text>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={rec.stop} accessibilityRole="button" accessibilityLabel="Stop recitation" hitSlop={6} style={s.stop}>
          <Ionicons name="stop" size={18} color={c.text} />
        </Pressable>
      </View>
      {picking ? (
        <View style={s.picker}>
          {RECITERS.map((r) => (
            <Pressable
              key={r.id}
              onPress={() => {
                update({ reciter: r.id });
                setPicking(false);
              }}
              accessibilityRole="radio"
              accessibilityState={{ checked: r.id === reciter.id }}
              style={[s.option, r.id === reciter.id && { backgroundColor: c.primaryTint }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={s.optName}>{r.name}</Text>
                <Text style={s.optStyle}>{r.style}</Text>
              </View>
              {r.id === reciter.id ? <Ionicons name="checkmark" size={18} color={c.primary} /> : null}
            </Pressable>
          ))}
          <Text style={s.note}>Changing reciter applies the next time you press listen.</Text>
        </View>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  bar: { backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, padding: 8, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  play: { width: 40, height: 40, borderRadius: 20, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.semibold, fontSize: 14, color: c.text },
  reciter: { fontFamily: fonts.regular, fontSize: 12, color: c.gold },
  repeat: { flexDirection: 'row', backgroundColor: c.surfaceAlt, borderRadius: radius.pill, padding: 2 },
  repeatOpt: { minWidth: 30, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  repeatOn: { backgroundColor: c.primary },
  repeatText: { fontFamily: fonts.semibold, fontSize: 12, color: c.textMuted },
  stop: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  picker: { gap: 2 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingVertical: 8, borderRadius: radius.sm },
  optName: { fontFamily: fonts.medium, fontSize: 14, color: c.text },
  optStyle: { fontFamily: fonts.regular, fontSize: 12, color: c.textMuted },
  note: { fontFamily: fonts.regular, fontSize: 11, color: c.textFaint, paddingHorizontal: 10 },
}));
