import { useEffect, useState, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Animated, StyleSheet, Text, useColorScheme } from 'react-native';
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
});
