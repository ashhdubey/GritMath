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
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../src/theme';
import { setOnboardingDone } from '../src/storage/storage';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'target',
    title: 'Zero Distractions',
    subtitle: 'The ultimate free math trainer. Master mental math at your own pace without any clutter.',
    color: '#0056D2',
    accent: '#E6F0FF',
  },
  {
    id: '2',
    icon: 'zap',
    title: 'Speed is the Goal',
    subtitle: 'Timed practice with instant feedback. Train your brain to calculate faster under pressure.',
    color: '#10B981',
    accent: '#D1FAE5',
  },
  {
    id: '3',
    icon: 'trending-up',
    title: 'Track Your Growth',
    subtitle: 'Daily streaks and high scores, stored securely on your device. Watch yourself improve.',
    color: '#F59E0B',
    accent: '#FEF3C7',
  },
];

const SlideItem = ({ item, index, scrollX }) => {
  const theme = useTheme();
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.5, 1, 0.5],
    extrapolate: 'clamp',
  });

  const translateY = scrollX.interpolate({
    inputRange,
    outputRange: [50, 0, 50],
    extrapolate: 'clamp',
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.slide}>
      <Animated.View style={[styles.iconContainer, { transform: [{ scale }], backgroundColor: theme.isDark ? item.color + '20' : item.accent }]}>
        <Feather name={item.icon} size={64} color={item.color} />
      </Animated.View>
      
      <Animated.View style={{ opacity, transform: [{ translateY }], paddingHorizontal: 32, alignItems: 'center' }}>
        <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text>
      </Animated.View>
    </View>
  );
};

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const router = useRouter();
  const theme = useTheme();

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      setOnboardingDone();
      router.replace('/home');
    }
  };

  const handleSkip = () => {
    setOnboardingDone();
    router.replace('/home');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        {!isLastSlide ? (
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
            <Text style={[styles.skipText, { color: theme.textSecondary }]}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.skipBtn} />
        )}
      </View>

      <View style={styles.flatListContainer}>
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
          bounces={false}
        />
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, i) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [8, 24, 8],
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
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor: theme.primary,
                  },
                ]}
              />
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: theme.primary }]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextText}>{isLastSlide ? "Start Training" : "Continue"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 100, justifyContent: 'flex-end', alignItems: 'flex-end', paddingHorizontal: 24, paddingBottom: 16 },
  skipBtn: { padding: 8 },
  skipText: { fontSize: 16, fontWeight: '600' },
  flatListContainer: { flex: 1 },
  slide: { width, flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconContainer: { width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center', marginBottom: 60 },
  title: { fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: 16, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 26, fontWeight: '500' },
  bottomSection: { paddingHorizontal: 32, paddingBottom: 60, alignItems: 'center' },
  dotsContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 40, gap: 8, height: 8 },
  dot: { height: 8, borderRadius: 4 },
  nextBtn: { width: '100%', height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#0056D2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  nextText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', letterSpacing: 0.5 },
});
