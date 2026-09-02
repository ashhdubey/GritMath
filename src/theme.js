import { useColorScheme } from 'react-native';
import useAppStore from './store/useAppStore';

export const BASE_COLORS = {
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
};

/**
 * Generates the primary color group from a given accent hex.
 * Produces a lighter tint for 'primaryLight' automatically.
 */
const buildPrimaryColors = (accent) => {
  return {
    primary: accent,
    primaryLight: accent + '22', // 13% opacity overlay as tint
    primaryDark: accent,
  };
};

export const buildTheme = (base, accentColor) => ({
  ...base,
  ...buildPrimaryColors(accentColor),
});

const lightBase = {
  background: '#F5F7FA',
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  icon: '#4B5563',
  ...BASE_COLORS,
  isDark: false,
};

const darkBase = {
  background: '#121212',
  surface: '#1E1E1E',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  border: '#333333',
  icon: '#E5E7EB',
  ...BASE_COLORS,
  isDark: true,
};

const oledBase = {
  background: '#000000',
  surface: '#0A0A0A',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  border: '#222222',
  icon: '#E5E7EB',
  ...BASE_COLORS,
  isDark: true,
};

const DEFAULT_ACCENT = '#0056D2';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const themePreference = useAppStore(state => state.themePreference);
  // ACCENT COLOR FIX: Subscribe to accentColor from the store so theme re-renders on change
  const accentColor = useAppStore(state => state.accentColor) || DEFAULT_ACCENT;

  let activeScheme = themePreference;
  if (activeScheme === 'system') {
    activeScheme = colorScheme || 'light';
  }

  let base = lightBase;
  if (activeScheme === 'oled') base = oledBase;
  else if (activeScheme === 'dark') base = darkBase;

  return buildTheme(base, accentColor);
};
