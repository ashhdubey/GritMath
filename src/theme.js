import { useColorScheme } from 'react-native';
import useAppStore from './store/useAppStore';

export const COLORS = {
  primary: '#0056D2', // Clean fintech blue
  primaryLight: '#E6F0FF',
  primaryDark: '#003B99',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
};

export const lightTheme = {
  background: '#F5F7FA',
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  icon: '#4B5563',
  ...COLORS,
  isDark: false,
};

export const darkTheme = {
  background: '#121212',
  surface: '#1E1E1E',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  border: '#333333',
  icon: '#E5E7EB',
  ...COLORS,
  isDark: true,
};

export const oledTheme = {
  background: '#000000',
  surface: '#0A0A0A',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  border: '#222222',
  icon: '#E5E7EB',
  ...COLORS,
  isDark: true,
};

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const themePreference = useAppStore(state => state.themePreference);

  let activeScheme = themePreference;
  if (activeScheme === 'system') {
    activeScheme = colorScheme || 'light';
  }

  if (activeScheme === 'oled') return oledTheme;
  if (activeScheme === 'dark') return darkTheme;
  return lightTheme;
};
