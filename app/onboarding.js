/**
 * Onboarding Screen — 3-slide intro to GritMath's zero-distraction philosophy.
 */

import { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useTheme } from '../src/theme';
import { setOnboardingDone } from '../src/storage/storage';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🧘',
    title: 'Zero Distractions',
    subtitle: 'No ads, no accounts, no internet required.\nJust you and math.',
    gradient: ['#6C5CE7', '#A29BFE'],
  },
  {
    id: '2',
    emoji: '⚡',
    title: 'Speed is the Goal',
    subtitle: 'Timed practice with instant feedback.\nTrain like a competitor.',
    gradient: ['#00B894', '#55EFC4'],
  },
  {
    id: '3',
    emoji: '📈',
    title: 'Track Your Growth',
    subtitle: 'Daily streaks and high scores,\nall stored on your device.',
    gradient: ['#0984E3', '#74B9FF'],
  },
];

const SlideItem = ({ item, index, scrollX }) => {
  const theme = useTheme();
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.8, 1, 0.8],
    extrapolate: 'clamp',
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.4, 1, 0.4],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.slide}>
      {/* Background glowing orb for glassmorphism effect */}
      <Animated.View style={[
        styles.glowOrb, 
        { 
          backgroundColor: item.gradient[0],
          transform: [{ scale }]
        }
      ]} />
      
      <BlurView intensity={theme.isDark ? 80 : 100} tint={theme.isDark ? 'dark' : 'light'} style={styles.glassCard}>
        <Animated.View style={{ opacity, alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          <View style={[styles.emojiCircle, { backgroundColor: item.gradient[0] + '20', borderColor: item.gradient[0] + '50', borderWidth: 1 }]}>  
            <Text style={styles.emoji}>{item.emoji}</Text>
          </View>
          <Text style={[styles.title, { color: item.themeText }]}>{item.title}</Text>
          <Text style={[styles.subtitle, { color: item.themeSub }]}>{item.subtitle}</Text>
        </Animated.View>
      </BlurView>
    </View>
  );
};

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const router = useRouter();
  const theme = useTheme();

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      setOnboardingDone();
      router.replace('/dashboard');
    }
  };

  const handleSkip = () => {
    setOnboardingDone();
    router.replace('/dashboard');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {!isLastSlide && (
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={[styles.skipText, { color: theme.textSecondary }]}>Skip</Text>
        </TouchableOpacity>
      )}

      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES.map(s => ({...s, themeText: theme.text, themeSub: theme.textSecondary}))}
        renderItem={({ item, index }) => (
          <SlideItem item={item} index={index} scrollX={scrollX} />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        scrollEventThrottle={16}
      />

      <View style={styles.bottomSection}>
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, i) => {
            const dotScale = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [1, 1.5, 1],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    transform: [{ scale: dotScale }],
                    opacity: dotOpacity,
                    backgroundColor: SLIDES[currentIndex].gradient[0],
                  },
                ]}
              />
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: SLIDES[currentIndex].gradient[0] }]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextText}>
            {isLastSlide ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: { position: 'absolute', top: 60, right: 24, zIndex: 10, paddingHorizontal: 16, paddingVertical: 8 },
  skipText: { fontSize: 16, fontWeight: '600' },
  slide: { width, flex: 1, justifyContent: 'center', alignItems: 'center' },
  glowOrb: { position: 'absolute', width: 300, height: 300, borderRadius: 150, opacity: 0.4 },
  glassCard: { width: '85%', height: '60%', borderRadius: 32, padding: 32, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  emojiCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  emoji: { fontSize: 56 },
  title: { fontSize: 30, fontWeight: '900', textAlign: 'center', marginBottom: 16, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24, fontWeight: '500' },
  bottomSection: { paddingHorizontal: 24, paddingBottom: 50, alignItems: 'center' },
  dotsContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 36, gap: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  nextBtn: { width: '100%', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  nextText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', letterSpacing: 0.5 },
});
