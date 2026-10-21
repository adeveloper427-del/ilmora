import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/typography';
import type { IconName } from '@/components/ui/Button';

const TABS: { name: string; title: string; icon: IconName; active: IconName }[] = [
  { name: 'index', title: 'Home', icon: 'home-outline', active: 'home' },
  { name: 'learn', title: 'Learn', icon: 'book-outline', active: 'book' },
  { name: 'practice', title: 'Practice', icon: 'create-outline', active: 'create' },
  { name: 'audio', title: 'Audio', icon: 'mic-outline', active: 'mic' },
  { name: 'profile', title: 'Profile', icon: 'person-outline', active: 'person' },
];

export default function TabLayout() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textFaint,
        tabBarStyle: {
          backgroundColor: c.tabBar,
          borderTopColor: c.border,
          height: 62 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
        sceneStyle: { backgroundColor: c.bg },
        animation: Platform.OS === 'web' ? 'none' : 'fade',
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? t.active : t.icon} size={23} color={color as string} />,
          }}
        />
      ))}
    </Tabs>
  );
}
