import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, TextInput, TextInputProps, View } from 'react-native';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/typography';

export function Field({ label, error, secure, ...props }: TextInputProps & { label: string; error?: string; secure?: boolean }) {
  const s = useStyles();
  const { c } = useTheme();
  const [hidden, setHidden] = useState(true);
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.inputWrap, !!error && { borderColor: c.danger }]}>
        <TextInput
          {...props}
          secureTextEntry={secure && hidden}
          placeholderTextColor={c.textFaint}
          style={s.input}
          accessibilityLabel={label}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} accessibilityRole="button" accessibilityLabel={hidden ? 'Show password' : 'Hide password'}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={c.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const useStyles = makeStyles((c) => ({
  label: { fontFamily: fonts.medium, fontSize: 14, color: c.text },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
    paddingHorizontal: 14,
    gap: 8,
  },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 16, color: c.text, paddingVertical: 12 },
  error: { fontFamily: fonts.regular, fontSize: 13, color: c.danger },
}));
