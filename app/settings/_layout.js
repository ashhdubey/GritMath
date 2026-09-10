import { Stack } from 'expo-router';
import { useTheme } from '../../src/theme';

export default function SettingsLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="updates" />
      <Stack.Screen name="theme" />
      <Stack.Screen name="experience" />
      <Stack.Screen name="data" />
    </Stack>
  );
}
