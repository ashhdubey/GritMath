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
    <Animated.View style={[styles.slide, { transform: [{ scale }], opacity }]}>
      <View style={[styles.emojiCircle, { backgroundColor: item.gradient[0] + '25' }]}>  
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </Animated.View>
  );
};

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const router = useRouter();

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
    <View style={styles.container}>
      {!isLastSlide && (
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
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
  container: { flex: 1, backgroundColor: '#0A0A14' },
  skipBtn: { position: 'absolute', top: 60, right: 24, zIndex: 10, paddingHorizontal: 16, paddingVertical: 8 },
  skipText: { color: '#8B8B9E', fontSize: 16, fontWeight: '500' },
  slide: { width, flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emojiCircle: { width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  emoji: { fontSize: 64 },
  title: { fontSize: 32, fontWeight: '800', color: '#F0F0F5', textAlign: 'center', marginBottom: 16, letterSpacing: -0.5 },
  subtitle: { fontSize: 17, color: '#8B8B9E', textAlign: 'center', lineHeight: 26 },
  bottomSection: { paddingHorizontal: 24, paddingBottom: 50, alignItems: 'center' },
  dotsContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 32, gap: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  nextBtn: { width: '100%', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  nextText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});
