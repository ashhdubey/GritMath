import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { useTheme } from '../../src/theme';
import useAppStore from '../../src/store/useAppStore';

export default function UpdaterSettings() {
  const router = useRouter();
  const theme = useTheme();
  
  const { 
    autoUpdateEnabled, setAutoUpdateEnabled,
    updateNotifsEnabled, setUpdateNotifsEnabled
  } = useAppStore();

  const handleClearDownloads = async () => {
    try {
      const dirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory);
      if (dirInfo.exists) {
        const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
        for (const file of files) {
          if (file.endsWith('.apk')) {
            await FileSystem.deleteAsync(FileSystem.documentDirectory + file, { idempotent: true });
          }
        }
      }
    } catch (e) {
      console.warn('Could not clear download:', e);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnWrapper}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Update Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>App Updates</Text>
        
        <View style={[styles.cardGroup, { backgroundColor: theme.surface }]}>
          
          {/* App Update */}
          <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: theme.border, paddingVertical: 20 }]}>
            <View style={styles.textContainer}>
              <Text style={[styles.rowTitle, { color: theme.text, fontSize: 18 }]}>App Updates</Text>
              <Text style={[styles.rowSubtitle, { color: theme.textSecondary, fontSize: 14 }]}>Check for new features and bug fixes</Text>
            </View>
            <TouchableOpacity 
              style={{ backgroundColor: '#2C2B3A', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, gap: 8 }} 
              onPress={() => router.push('/updater')}
              activeOpacity={0.7}
            >
              <Feather name="download-cloud" size={18} color="#9D8DF1" />
              <Text style={{ color: "#9D8DF1", fontWeight: '700', fontSize: 15 }}>Check</Text>
            </TouchableOpacity>
          </View>

          {/* Automatic Update Check */}
          <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
            <View style={[styles.iconContainer, { backgroundColor: theme.border }]}>
              <Feather name="clock" size={20} color={theme.textSecondary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.rowTitle, { color: theme.text }]}>Automatic update check</Text>
              <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>Automatically check for updates</Text>
            </View>
            <Switch 
              value={autoUpdateEnabled} 
              onValueChange={setAutoUpdateEnabled}
              trackColor={{ false: theme.border, true: theme.primaryLight }}
              thumbColor={autoUpdateEnabled ? theme.primary : '#f4f3f4'}
            />
          </View>

          {/* Update Notifications */}
          <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
            <View style={[styles.iconContainer, { backgroundColor: theme.border }]}>
              <Feather name="bell" size={20} color={theme.textSecondary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.rowTitle, { color: theme.text }]}>Update Notifications</Text>
              <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>Show a notification when a new update is found</Text>
            </View>
            <Switch 
              value={updateNotifsEnabled} 
              onValueChange={setUpdateNotifsEnabled}
              trackColor={{ false: theme.border, true: theme.primaryLight }}
              thumbColor={updateNotifsEnabled ? theme.primary : '#f4f3f4'}
            />
          </View>

          {/* Clear Downloads */}
          <TouchableOpacity 
            style={styles.row} 
            onPress={handleClearDownloads}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.border }]}>
              <Feather name="trash-2" size={20} color={theme.textSecondary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.rowTitle, { color: theme.text }]}>Clear downloaded updates</Text>
              <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>Remove downloaded APK files to free up space</Text>
            </View>
            <Feather name="info" size={20} color={theme.textSecondary} />
          </TouchableOpacity>

        </View>

        <View style={{ height: 40 }} />
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
    paddingBottom: 20 
  },
  backBtnWrapper: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  
  scrollContent: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12, marginLeft: 8 },
  
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
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
