import { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Animated,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { CATEGORIES } from '../../src/engine/MathEngine';
import { getStreak } from '../../src/storage/storage';
import { useTheme } from '../../src/theme';

const { width } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (width - 48 - CARD_GAP) / 2;

const CategoryCard = ({ item, onPress, theme }) => {
  const scaleAnim = new Animated.Value(1);
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
        <TouchableOpacity style={[styles.settingsBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => router.push('/settings')}>
          <Feather name="settings" size={20} color={theme.icon} />
        </TouchableOpacity>
      </View>

      <View style={[styles.statsBanner, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.statItem}>
          <View style={[styles.statIconBg, { backgroundColor: theme.warningLight }]}>
            <Feather name="zap" size={20} color={theme.warning} />
          </View>
          <View>
            <Text style={[styles.statValue, { color: theme.text }]}>{streak.count} Days</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Current Streak</Text>
          </View>
        </View>
      </View>

      {/* Infinite Scroll CTA */}
      <TouchableOpacity 
        style={[styles.infiniteBanner, { backgroundColor: theme.primary }]} 
        onPress={() => router.push('/infinite-setup')}
        activeOpacity={0.9}
      >
        <View style={styles.infiniteContent}>
          <View style={styles.infiniteTextContainer}>
            <Text style={styles.infiniteTitle}>Infinite Mode</Text>
            <Text style={styles.infiniteDesc}>Non-stop training reels</Text>
          </View>
          <View style={[styles.infiniteIconBg, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Feather name="play" size={20} color="#FFFFFF" />
          </View>
        </View>
      </TouchableOpacity>

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
  statsBanner: { flexDirection: 'row', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1 },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  statIconBg: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 13, fontWeight: '500' },
  infiniteBanner: { borderRadius: 16, padding: 20, marginBottom: 28, shadowColor: '#0056D2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  infiniteContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  infiniteIconBg: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', paddingLeft: 2 },
  infiniteTextContainer: { flex: 1 },
  infiniteTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  infiniteDesc: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: CARD_GAP, marginBottom: 28 },
  card: { width: CARD_WIDTH, borderRadius: 16, padding: 16, borderWidth: 1 },
  cardIconBg: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  mathIcon: { fontSize: 22, fontWeight: '800' },
  cardLabel: { fontSize: 16, fontWeight: '700' },
});
