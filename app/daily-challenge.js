import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { setSeed, clearSeed, CATEGORIES } from '../src/engine/MathEngine';
import useAppStore from '../src/store/useAppStore';
import { useTheme } from '../src/theme';
import { getLastDailyCompletedDate, setLastDailyCompletedDate } from '../src/storage/storage';

export default function DailyChallenge() {
  const router = useRouter();
  const theme = useTheme();
  const { updateQuizConfig, startQuiz, quiz } = useAppStore();
  
  const [hasCompleted, setHasCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Get current UTC date string (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Check if they finished today
    const lastDate = getLastDailyCompletedDate();
    if (lastDate === todayStr) {
      setHasCompleted(true);
      // We don't save the exact score in storage yet, but we could.
    }
  }, []);

  const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  const handleStart = () => {
    if (hasCompleted) return;

    // 1. Set the RNG seed to today's date so everyone gets the same quiz
    const seed = hashString(todayStr);
    setSeed(seed);

    // 2. Configure a 20-question mixed quiz
    const allCategories = CATEGORIES.map(c => c.key);
    
    updateQuizConfig({ 
      category: allCategories,
      difficulty: 'hard', 
      rangeMode: 'random', 
      customRange: null, 
      timePerQuestion: 15,
      isInfinite: false,
      isSurvival: false,
      isDaily: true, // Custom flag to track daily mode in store if needed
      questionCount: 20
    });

    startQuiz();

    // 3. Clear the seed immediately so future procedural generation goes back to random
    clearSeed();

    // 4. Mark as completed today
    setLastDailyCompletedDate(todayStr);
    setHasCompleted(true);

    router.push('/quiz');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Feather name="arrow-left" size={24} color={theme.text} />
      </TouchableOpacity>

      <View style={styles.headerRow}>
        <View style={[styles.headerIconBg, { backgroundColor: theme.primaryLight }]}>
          <Feather name="globe" size={28} color={theme.primary} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Daily Challenge</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Today's Gauntlet</Text>
        <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
          A 20-question mix of hard arithmetic, squares, cubes, and percentages. 
          Everyone in the world gets the exact same questions today.
        </Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: theme.primary }]}>20</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Questions</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: theme.warning }]}>15s</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Per Q</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: theme.danger }]}>Hard</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Difficulty</Text>
          </View>
        </View>

        {hasCompleted ? (
          <View style={[styles.completedBox, { backgroundColor: theme.successLight }]}>
            <Feather name="check-circle" size={24} color={theme.success} style={{ marginBottom: 8 }} />
            <Text style={[styles.completedText, { color: theme.success }]}>You completed today's challenge!</Text>
            <Text style={{ color: theme.success, marginTop: 4, fontWeight: '600' }}>Come back tomorrow.</Text>
          </View>
        ) : (
          <TouchableOpacity style={[styles.startBtn, { backgroundColor: theme.primary }]} onPress={handleStart} activeOpacity={0.8}>
            <Text style={styles.startText}>Start Challenge</Text>
            <Feather name="play" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  backBtn: { paddingTop: 60, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  headerIconBg: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  title: { fontSize: 26, fontWeight: '800' },
  card: { padding: 24, borderRadius: 20, borderWidth: 1, marginTop: 12 },
  cardTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  cardDesc: { fontSize: 15, lineHeight: 22, marginBottom: 24 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  statBox: { alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '900', marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  startBtn: { height: 56, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: '#0056D2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  startText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  completedBox: { padding: 20, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  completedText: { fontSize: 16, fontWeight: '800', textAlign: 'center' }
});
