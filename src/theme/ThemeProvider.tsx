import { createContext, ReactNode, useContext, useMemo } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { useSettings } from '@/state/SettingsProvider';
import { dark, light, Palette } from './colors';

type Theme = { c: Palette; isDark: boolean };

const ThemeContext = createContext<Theme>({ c: light, isDark: false });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const { settings } = useSettings();
  const isDark = settings.theme === 'system' ? system === 'dark' : settings.theme === 'dark';
  const value = useMemo(() => ({ c: isDark ? dark : light, isDark }), [isDark]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

type Styles = Parameters<typeof StyleSheet.create>[0];

/** Build a stylesheet from the active palette; recomputed only when the theme changes. */
export function makeStyles<T extends Styles>(factory: (c: Palette) => T & Styles) {
  return function useStyles(): Readonly<T> {
    const { c } = useTheme();
    return useMemo(() => StyleSheet.create(factory(c)), [c]);
  };
}
