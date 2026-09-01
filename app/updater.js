import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import { useTheme } from '../src/theme';

const { width } = Dimensions.get('window');

export default function Updater() {
  const router = useRouter();
  const theme = useTheme();
  
  const [release, setRelease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [status, setStatus] = useState('idle'); // idle, downloading, ready
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchLatestRelease();
  }, []);

  const fetchLatestRelease = async () => {
    try {
      const res = await fetch('https://api.github.com/repos/ashhdubey/GritMath/releases/latest');
      if (!res.ok) throw new Error('Failed to fetch update info');
      const data = await res.json();
      
      const currentVersion = require('../package.json').version;
      const latestV = data.tag_name.replace('v', '');
      const isNewer = latestV.localeCompare(currentVersion, undefined, { numeric: true, sensitivity: 'base' }) > 0;
      
      setRelease({ ...data, isNewer });
    } catch (err) {
      setError('Could not check for updates.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!release || !release.assets || release.assets.length === 0) return;
    
    setStatus('downloading');
    setProgress(0);
    
    // Find the APK asset
    const apkAsset = release.assets.find(a => a.name.endsWith('.apk'));
    if (!apkAsset) {
      setError('No APK found in the latest release.');
      setStatus('idle');
      return;
    }

    try {
      const fileUri = FileSystem.documentDirectory + apkAsset.name;
      
      const downloadResumable = FileSystem.createDownloadResumable(
        apkAsset.browser_download_url,
        fileUri,
        {},
        (downloadProgress) => {
          const pct = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setProgress(pct);
        }
      );

      const { uri } = await downloadResumable.downloadAsync();
      
      setStatus('ready');
      // Store the downloaded URI to install later
      setRelease(prev => ({ ...prev, downloadedUri: uri }));
    } catch (err) {
      console.warn(err);
      setError('Download failed.');
      setStatus('idle');
    }
  };

  const handleInstall = async () => {
    try {
      // In Expo SDK 50+, we need to get a content URI to share the file with the Android package installer
      const contentUri = await FileSystem.getContentUriAsync(release.downloadedUri);
      
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 268435457, // FLAG_GRANT_READ_URI_PERMISSION | FLAG_ACTIVITY_NEW_TASK
        type: 'application/vnd.android.package-archive'
      });
    } catch (err) {
      console.warn('Install failed:', err);
      setError('Failed to launch installer. Ensure permissions are granted.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary }}>Checking for updates...</Text>
      </View>
    );
  }

  if (error || !release) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.danger }}>{error || 'No updates found.'}</Text>
        <TouchableOpacity style={[styles.backBtn, { marginTop: 20 }]} onPress={() => router.back()}>
          <Text style={{ color: theme.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const apkAsset = release.assets?.find(a => a.name.endsWith('.apk'));
  const sizeMb = apkAsset ? (apkAsset.size / (1024 * 1024)).toFixed(1) : 'Unknown';
  const releaseDate = new Date(release.published_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnWrapper}>
          <View style={[styles.backIconBg, { backgroundColor: theme.surface }]}>
            <Feather name="arrow-left" size={20} color={theme.text} />
          </View>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>New update <Text style={{ color: theme.primary }}>{release.tag_name}</Text></Text>
      </View>

      {/* Info */}
      <View style={styles.infoSection}>
        <Text style={[styles.metaText, { color: theme.textSecondary }]}>Released on: {releaseDate}</Text>
        <Text style={[styles.metaText, { color: theme.textSecondary }]}>Size: {sizeMb} MB</Text>
      </View>

      {/* Changelog */}
      <ScrollView style={styles.changelogScroll} showsVerticalScrollIndicator={false}>
        {!release.isNewer && (
          <View style={{ backgroundColor: theme.success + '20', padding: 16, borderRadius: 12, marginBottom: 24, flexDirection: 'row', alignItems: 'center' }}>
            <Feather name="check-circle" size={24} color={theme.success} style={{ marginRight: 12 }} />
            <Text style={{ color: theme.success, fontSize: 16, fontWeight: '700', flex: 1 }}>You are already on the newest version!</Text>
          </View>
        )}
        <Text style={[styles.changelogText, { color: theme.textSecondary }]}>{release.body || 'No release notes provided.'}</Text>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        {status === 'downloading' && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBarBg, { backgroundColor: theme.surface }]}>
              <Animated.View style={[styles.progressBarFill, { backgroundColor: theme.primary, width: `${progress * 100}%` }]} />
            </View>
          </View>
        )}
        
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.laterBtn, { borderColor: theme.border }]} onPress={() => router.back()}>
            <Text style={[styles.laterText, { color: theme.text }]}>{release.isNewer ? 'Later' : 'Close'}</Text>
          </TouchableOpacity>

          {status === 'idle' && release.isNewer && (
            <TouchableOpacity style={[styles.updateBtn, { backgroundColor: theme.primaryLight }]} onPress={handleDownload}>
              <Text style={[styles.updateText, { color: theme.primary }]}>Update</Text>
            </TouchableOpacity>
          )}

          {status === 'downloading' && (
            <TouchableOpacity style={[styles.updateBtn, { backgroundColor: theme.surface }]} disabled>
              <Text style={[styles.updateText, { color: theme.textSecondary }]}>{Math.round(progress * 100)}%</Text>
            </TouchableOpacity>
          )}

          {status === 'ready' && (
            <TouchableOpacity style={[styles.updateBtn, { backgroundColor: theme.primary }]} onPress={handleInstall}>
              <Text style={[styles.updateText, { color: '#FFF' }]}>Install</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  backBtnWrapper: { marginBottom: 20, alignSelf: 'flex-start' },
  backIconBg: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700' },
  infoSection: { paddingHorizontal: 20, marginBottom: 20 },
  metaText: { fontSize: 14, marginBottom: 4 },
  changelogScroll: { flex: 1, paddingHorizontal: 20 },
  changelogText: { fontSize: 15, lineHeight: 24 },
  bottomBar: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20, borderTopWidth: 1 },
  actionRow: { flexDirection: 'row', gap: 12 },
  laterBtn: { flex: 1, height: 50, borderRadius: 25, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  laterText: { fontSize: 16, fontWeight: '600' },
  updateBtn: { flex: 1, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  updateText: { fontSize: 16, fontWeight: '700' },
  progressContainer: { marginBottom: 16 },
  progressBarBg: { height: 6, borderRadius: 3, width: '100%', overflow: 'hidden' },
  progressBarFill: { height: '100%' }
});
