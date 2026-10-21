import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { Platform } from 'react-native';
import { useSettings } from '@/state/SettingsProvider';

export function useFeedback() {
  const { settings } = useSettings();
  const enabled = settings.haptics && Platform.OS !== 'web';
  return useMemo(
    () => ({
      tap: () => enabled && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
      select: () => enabled && Haptics.selectionAsync().catch(() => {}),
      success: () => enabled && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
      warn: () => enabled && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {}),
    }),
    [enabled],
  );
}
