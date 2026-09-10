import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import useAppStore from '../../src/store/useAppStore';
import { resetAllData } from '../../src/storage/storage';
import { useTheme } from '../../src/theme';

export default function DataSettings() {
  const router = useRouter();
  const theme = useTheme();
  const { resetStorePreferences } = useAppStore();

  const handleReset = () => {
    Alert.alert('Reset All Data', 'This will erase all your streaks, high scores, badges, and quiz history. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => {
        resetAllData();
        resetStorePreferences();
        router.replace('/');
      }},
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnWrapper}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Data & Storage</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Privacy</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.surface }]}>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Feather name="lock" size={20} color={theme.textSecondary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.rowTitle, { color: theme.text }]}>100% Offline</Text>
              <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>
                GritMath operates entirely offline. All of your data, history, and preferences are stored securely on this device.
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.danger, marginTop: 16 }]}>Danger Zone</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.surface }]}>
          <TouchableOpacity 
            style={styles.row} 
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Feather name="trash-2" size={20} color={theme.danger} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.rowTitle, { color: theme.danger }]}>Reset All Data</Text>
              <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>Permanently erases streaks, high scores, and quiz history. This cannot be undone.</Text>
            </View>
          </TouchableOpacity>
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
  infoRow: {
    flexDirection: 'row',
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
    marginBottom: 4,
  },
  rowSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    paddingRight: 12,
  },
});
