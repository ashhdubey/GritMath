import { useState, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Animated,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { CATEGORIES } from '../../src/engine/MathEngine';
import { getStreak } from '../../src/storage/storage';
import { useTheme } from '../../src/theme';
import AdBanner from '../../src/components/AdBanner';

const { width } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (width - 48 - CARD_GAP) / 2;

const CategoryCard = ({ item, onPress, theme }) => {
  // BUG-13 FIX: Use useRef so the Animated.Value is not recreated on every render
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true, speed: 50 }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={() => onPress(item.key)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={[styles.cardIconBg, { backgroundColor: theme.primaryLight }]}>  
          <Text style={[styles.mathIcon, { color: theme.primary }]}>{item.icon}</Text>
        </View>
        <Text style={[styles.cardLabel, { color: theme.text }]}>{item.label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function Home() {
  const router = useRouter();
  const theme = useTheme();
  const [streak, setStreak] = useState({ count: 0 });

  useFocusEffect(useCallback(() => {
    setStreak(getStreak());
  }, []));

  const handleCategoryPress = (categoryKey) => router.push(`/practice-setup?category=${categoryKey}`);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.appName, { color: theme.text }]}>GritMath</Text>
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>Speed. Precision. Grit.</Text>
        </View>
        <View style={styles.headerActions}>
          <View style={[styles.miniStreak, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={styles.miniStreakIcon}>🔥</Text>
            <Text style={[styles.miniStreakText, { color: theme.text }]}>{streak.count}</Text>
          </View>
          <TouchableOpacity style={[styles.settingsBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => router.push('/settings')}>
            <Feather name="settings" size={20} color={theme.icon} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginBottom: 16, backgroundColor: 'transparent' }}>
        <AdBanner />
      </View>

      {/* Game Modes */}
      <View style={styles.modesGrid}>
        {/* Daily Challenge */}
        <TouchableOpacity 
          style={[styles.modeCard, { backgroundColor: theme.surface, borderColor: theme.border }]} 
          onPress={() => router.push('/daily-challenge')}
          activeOpacity={0.9}
        >
          <View style={[styles.modeIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Feather name="award" size={24} color="#10B981" />
          </View>
          <Text style={[styles.modeTitle, { color: theme.text }]}>Daily</Text>
        </TouchableOpacity>

        {/* Infinite Mode */}
        <TouchableOpacity 
          style={[styles.modeCard, { backgroundColor: theme.surface, borderColor: theme.border }]} 
          onPress={() => router.push('/infinite-setup')}
          activeOpacity={0.9}
        >
          <View style={[styles.modeIconBg, { backgroundColor: theme.primaryLight }]}>
            <Feather name="repeat" size={24} color={theme.primary} />
          </View>
          <Text style={[styles.modeTitle, { color: theme.text }]}>Endless</Text>
        </TouchableOpacity>

        {/* Survival Mode */}
        <TouchableOpacity 
          style={[styles.modeCard, { backgroundColor: theme.surface, borderColor: theme.border }]} 
          onPress={() => router.push('/survival-setup')}
          activeOpacity={0.9}
        >
          <View style={[styles.modeIconBg, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
            <Feather name="activity" size={24} color="#EF4444" />
          </View>
          <Text style={[styles.modeTitle, { color: theme.text }]}>Survival</Text>
        </TouchableOpacity>
      </View>

      {/* Ad Banner below game modes */}
      <View style={{ marginBottom: 28, marginTop: 12, backgroundColor: 'transparent' }}>
        <AdBanner />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Practice Categories</Text>
      <View style={styles.grid}>
        {CATEGORIES.map((cat) => (
          <CategoryCard key={cat.key} item={cat} onPress={handleCategoryPress} theme={theme} />
        ))}
      </View>
      
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingBottom: 20 },
  appName: { fontSize: 30, fontWeight: '900', letterSpacing: -1 },
  tagline: { fontSize: 14, marginTop: 2 },
  settingsBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  miniStreak: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, gap: 6 },
  miniStreakIcon: { fontSize: 16 },
  miniStreakText: { fontSize: 16, fontWeight: '800' },
  modesGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: CARD_GAP },
  modeCard: { flex: 1, borderRadius: 16, paddingVertical: 20, alignItems: 'center', borderWidth: 1, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  modeIconBg: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  modeTitle: { fontSize: 15, fontWeight: '800' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: CARD_GAP, marginBottom: 28 },
  card: { width: CARD_WIDTH, borderRadius: 16, padding: 16, borderWidth: 1 },
  cardIconBg: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  mathIcon: { fontSize: 22, fontWeight: '800' },
  cardLabel: { fontSize: 16, fontWeight: '700' },
});
