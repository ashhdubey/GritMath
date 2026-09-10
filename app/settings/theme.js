import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import useAppStore from '../../src/store/useAppStore';
import { useTheme } from '../../src/theme';

const COLORS = ['#0056D2', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#E84393', '#00CEC9', '#636E72'];
const THEMES = [
  { id: 'system', label: 'System', icon: 'smartphone' },
  { id: 'light', label: 'Light', icon: 'sun' },
  { id: 'dark', label: 'Dark', icon: 'moon' },
  { id: 'oled', label: 'OLED', icon: 'monitor' },
];

export default function ThemeSettings() {
  const router = useRouter();
  const theme = useTheme();
  const { accentColor, setAccentColor, themePreference, setThemePreference } = useAppStore();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnWrapper}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>App Theme</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Color Scheme</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.surface }]}>
          {THEMES.map((t, index) => (
            <TouchableOpacity 
              key={t.id}
              style={[
                styles.row, 
                index !== THEMES.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }
              ]} 
              onPress={() => setThemePreference(t.id)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Feather name={t.icon} size={20} color={themePreference === t.id ? theme.primary : theme.textSecondary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.rowTitle, { color: themePreference === t.id ? theme.primary : theme.text }]}>{t.label}</Text>
              </View>
              {themePreference === t.id && (
                <Feather name="check" size={20} color={theme.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: 16 }]}>Accent Color</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.surface, padding: 16 }]}>
          <View style={styles.colorGrid}>
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[styles.colorSwatch, { backgroundColor: color }, accentColor === color && { borderWidth: 3, borderColor: theme.text }]}
                onPress={() => setAccentColor(color)}
              >
                {accentColor === color && <Feather name="check" size={24} color="#FFFFFF" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 60, 
    paddingBottom: 24 
  },
  backBtnWrapper: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  
  scrollContent: { paddingHorizontal: 16 },
  sectionTitle: { 
    fontSize: 14, 
    fontWeight: '600', 
    marginBottom: 8, 
    marginLeft: 8 
  },
  
  cardGroup: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center' },
  colorSwatch: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
});
