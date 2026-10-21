import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadJSON, saveJSON } from '@/lib/storage';
import { DEFAULT_RECITER } from '@/data/reciters';
import { inkColors, penSizes } from '@/theme/colors';

export type ThemePref = 'system' | 'light' | 'dark';
export type GuideLevel = 'strong' | 'light' | 'off';

export type Settings = {
  onboarded: boolean;
  /** null until the student picks local (development) mode or signs in. */
  authMode: 'local' | 'cloud' | null;
  studentName: string;
  avatarColor: string;
  dailyGoalMinutes: number;
  theme: ThemePref;
  haptics: boolean;
  /** iOS: let recordings play while the ringer switch is on silent. */
  playInSilentMode: boolean;
  showArabicLabels: boolean;
  penColor: string;
  penSize: number;
  guideLevel: GuideLevel;
  reciter: string;
  /** How many times each verse is played when listening (memorization repetition). */
  verseRepeat: number;
};

export const DEFAULT_SETTINGS: Settings = {
  onboarded: false,
  authMode: null,
  studentName: '',
  avatarColor: '#145C45',
  dailyGoalMinutes: 10,
  theme: 'system',
  haptics: true,
  playInSilentMode: true,
  showArabicLabels: true,
  penColor: inkColors[0].value,
  penSize: penSizes[1].value,
  guideLevel: 'strong',
  reciter: DEFAULT_RECITER,
  verseRepeat: 1,
};

type Ctx = {
  settings: Settings;
  ready: boolean;
  update: (patch: Partial<Settings>) => void;
};

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadJSON('settings', DEFAULT_SETTINGS).then((s) => {
      setSettings(s);
      setReady(true);
    });
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveJSON('settings', next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ settings, ready, update }), [settings, ready, update]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
