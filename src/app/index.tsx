import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LogoMark, Wordmark } from '@/components/ui/Logo';
import { GeometricPattern } from '@/components/ui/Pattern';
import { useAuth } from '@/state/AuthProvider';
import { useSettings } from '@/state/SettingsProvider';
import { brand } from '@/theme/colors';

/** Branded splash, then routes to onboarding, sign-in or the app. */
export default function Splash() {
  const { settings } = useSettings();
  const auth = useAuth();
  const fade = useState(() => new Animated.Value(0))[0];
  const lift = useState(() => new Animated.Value(12))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [fade, lift]);

  useEffect(() => {
    if (auth.loading) return;
    const t = setTimeout(() => {
      if (!settings.onboarded) router.replace('/onboarding');
      else if (auth.session || settings.authMode === 'local') router.replace('/(tabs)');
      else router.replace('/(auth)/login');
    }, 900);
    return () => clearTimeout(t);
  }, [auth.loading, auth.session, settings.onboarded, settings.authMode]);

  return (
    <View style={styles.root}>
      <GeometricPattern color={brand.gold} opacity={0.14} size={64} />
      <Animated.View style={{ alignItems: 'center', gap: 20, opacity: fade, transform: [{ translateY: lift }] }}>
        <LogoMark size={96} ring={brand.ivory} star={brand.gold} glyph={brand.emerald} />
        <Wordmark color={brand.ivory} sub="#CFE1D6" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.emerald, alignItems: 'center', justifyContent: 'center' },
});
