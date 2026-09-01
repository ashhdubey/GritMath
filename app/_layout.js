import { useEffect, useState, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Animated, StyleSheet, Text, useColorScheme, Modal, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { loadStorage } from '../src/storage/storage';
import { useTheme } from '../src/theme';

// Keep the native splash screen visible until we're ready
ExpoSplashScreen.preventAutoHideAsync();

function AnimatedSplashScreen({ onFinish }) {
  const theme = useTheme();
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Hide the native splash screen, revealing this animated one
    ExpoSplashScreen.hideAsync();

    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 10, friction: 5 }),
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true })
    ]).start();

    // After 1.2s, fade out
    setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        onFinish();
      });
    }, 1200);
  }, []);

  return (
    <View style={[styles.splashContainer, { backgroundColor: theme.background }]}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Text style={[styles.splashTitle, { color: theme.primary }]}>GritMath</Text>
      </Animated.View>
    </View>
  );
}

export default function RootLayout() {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const [storageReady, setStorageReady] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    loadStorage().then(() => setStorageReady(true));
  }, []);

  if (!storageReady) {
    return null; // Return nothing while native splash is still showing
  }

  if (!splashFinished) {
    return <AnimatedSplashScreen onFinish={() => setSplashFinished(true)} />;
  }

  return <MainApp />;
}

function MainApp() {
  const theme = useTheme();
  const router = useRouter();
  
  const [updateInfo, setUpdateInfo] = useState(null);

  useEffect(() => {
    const checkUpdate = async () => {
      try {
        const res = await fetch('https://api.github.com/repos/ashhdubey/GritMath/releases/latest');
        if (!res.ok) return;
        const data = await res.json();
        const currentVersion = require('../package.json').version;
        const latestV = data.tag_name.replace('v', '');
        
        // Proper semver comparison: only show if GitHub version is strictly greater
        const isNewer = latestV.localeCompare(currentVersion, undefined, { numeric: true, sensitivity: 'base' }) > 0;
        
        if (isNewer) {
          setUpdateInfo(data);
        }
      } catch (e) {
        // Silently fail if offline or API error
      }
    };
    
    checkUpdate();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'slide_from_right',
        }}
      />
      
      {/* Custom Update Popup Modal */}
      {updateInfo && (
        <Modal transparent visible={!!updateInfo} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.modalIconBg, { backgroundColor: theme.primaryLight }]}>
                <Feather name="arrow-up-circle" size={32} color={theme.primary} />
              </View>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Update Available</Text>
              <Text style={[styles.modalText, { color: theme.textSecondary }]}>
                Version {updateInfo.tag_name} is ready to download!
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtnLater, { borderColor: theme.border }]} onPress={() => setUpdateInfo(null)}>
                  <Text style={[styles.modalBtnLaterText, { color: theme.textSecondary }]}>Later</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalBtnUpdate, { backgroundColor: theme.primary }]} 
                  onPress={() => {
                    setUpdateInfo(null);
                    router.push('/updater');
                  }}
                >
                  <Text style={styles.modalBtnUpdateText}>Update Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashTitle: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalIconBg: {
    width: 64, height: 64, borderRadius: 32,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  modalText: { fontSize: 15, textAlign: 'center', marginBottom: 24 },
  modalActions: { flexDirection: 'row', gap: 12, width: '100%' },
  modalBtnLater: { flex: 1, height: 48, borderRadius: 24, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  modalBtnLaterText: { fontSize: 15, fontWeight: '600' },
  modalBtnUpdate: { flex: 1, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  modalBtnUpdateText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
