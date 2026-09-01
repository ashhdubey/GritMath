import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import useAppStore from '../src/store/useAppStore';
import { resetAllData } from '../src/storage/storage';
import { useTheme } from '../src/theme';

const COLORS = ['#0056D2', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#E84393', '#00CEC9', '#636E72'];
const THEMES = [
  { id: 'system', label: 'System', icon: 'smartphone' },
  { id: 'light', label: 'Light', icon: 'sun' },
  { id: 'dark', label: 'Dark', icon: 'moon' },
  { id: 'oled', label: 'OLED', icon: 'monitor' },
];

export default function Settings() {
  const router = useRouter();
  const theme = useTheme();
  const { accentColor, setAccentColor, themePreference, setThemePreference } = useAppStore();

  const handleReset = () => {
    Alert.alert('Reset All Data', 'This will erase all your streaks, high scores, and quiz history. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => { resetAllData(); router.replace('/'); } },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Feather name="arrow-left" size={24} color={theme.text} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

      {/* App Updates */}
      <View style={[styles.updateCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.updateTitle, { color: theme.text }]}>App Updates</Text>
          <Text style={[styles.updateSub, { color: theme.textSecondary }]}>Check for new features and bug fixes</Text>
        </View>
        <TouchableOpacity style={[styles.updateBtn, { backgroundColor: theme.primaryLight }]} onPress={() => router.push('/updater')}>
          <Feather name="download-cloud" size={18} color={theme.primary} />
          <Text style={[styles.updateBtnText, { color: theme.primary }]}>Check</Text>
        </TouchableOpacity>
      </View>

      {/* Theme Preference */}
      <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>App Theme</Text>
      <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>Select your preferred color scheme</Text>
      <View style={styles.themeRow}>
        {THEMES.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[
              styles.themeBtn,
              { backgroundColor: theme.surface, borderColor: theme.border },
              themePreference === t.id && { borderColor: theme.primary, backgroundColor: theme.primaryLight }
            ]}
            onPress={() => setThemePreference(t.id)}
          >
            <Feather name={t.icon} size={20} color={themePreference === t.id ? theme.primary : theme.textSecondary} />
            <Text style={[styles.themeLabel, { color: themePreference === t.id ? theme.primary : theme.textSecondary }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Accent Color */}
      <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>Accent Color</Text>
      <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>Customize the look of your buttons and highlights</Text>
      <View style={styles.colorGrid}>
        {COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[styles.colorSwatch, { backgroundColor: color }, accentColor === color && styles.colorSelected]}
            onPress={() => setAccentColor(color)}
          >
            {accentColor === color && <Feather name="check" size={24} color="#FFFFFF" />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Reset Data */}
      <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 36 }]}>Data & Storage</Text>
      <TouchableOpacity style={[styles.resetBtn, { backgroundColor: theme.dangerLight, borderColor: theme.danger }]} onPress={handleReset}>
        <Feather name="trash-2" size={20} color={theme.danger} style={{ marginRight: 12 }} />
        <Text style={[styles.resetText, { color: theme.danger }]}>Reset All Data</Text>
      </TouchableOpacity>
      <Text style={[styles.resetSub, { color: theme.textSecondary }]}>Erases streaks, high scores, and quiz history</Text>

      {/* About App */}
      <View style={[styles.aboutSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <View style={[styles.logoPlaceholder, { backgroundColor: theme.primaryLight }]}>
            <Feather name="hash" size={24} color={theme.primary} />
          </View>
          <View style={{ marginLeft: 16 }}>
            <Text style={[styles.aboutTitle, { color: theme.text }]}>GritMath</Text>
            <Text style={[styles.aboutText, { color: theme.textSecondary }]}>Version {require('../package.json').version}</Text>
          </View>
        </View>
        <Text style={[styles.aboutText, { color: theme.textSecondary }]}>100% offline speed math trainer</Text>
        <Text style={[styles.aboutText, { color: theme.textSecondary }]}>Made for competitive exam preparation</Text>
        <Text style={[styles.aboutText, { marginTop: 8, color: theme.primary, fontWeight: '700' }]}>Zero ads. Zero accounts. Zero cost.</Text>
      </View>

      {/* Developer Profile Link */}
      <TouchableOpacity 
        style={[styles.developerBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={() => router.push('/developer')}
      >
        <View style={[styles.developerIcon, { backgroundColor: theme.primaryLight }]}>
          <Feather name="code" size={20} color={theme.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.developerBtnTitle, { color: theme.text }]}>About the Developer</Text>
          <Text style={[styles.developerBtnSub, { color: theme.textSecondary }]}>Connect with Ashish Kumar Dubey</Text>
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </TouchableOpacity>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  backBtn: { paddingTop: 60, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '900', marginBottom: 32 },
  
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  sectionSub: { fontSize: 13, marginBottom: 16 },
  
  updateCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  updateTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  updateSub: { fontSize: 12 },
  updateBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  updateBtnText: { fontSize: 14, fontWeight: '700' },

  themeRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  themeBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  themeLabel: { fontSize: 12, fontWeight: '600', marginTop: 6 },
  
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 24 },
  colorSwatch: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  colorSelected: { borderWidth: 3, borderColor: '#FFFFFF' },
  
  resetBtn: { flexDirection: 'row', borderRadius: 12, padding: 16, marginTop: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  resetText: { fontSize: 16, fontWeight: '700' },
  resetSub: { fontSize: 12, marginTop: 8, textAlign: 'center' },
  
  aboutSection: { marginTop: 36, borderRadius: 16, padding: 20, borderWidth: 1 },
  logoPlaceholder: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  aboutTitle: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
  aboutText: { fontSize: 14, lineHeight: 22 },
  
  developerBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 16, borderRadius: 16, padding: 16, borderWidth: 1 },
  developerIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  developerBtnTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  developerBtnSub: { fontSize: 13 },
});
