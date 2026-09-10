import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { CATEGORIES } from '../src/engine/MathEngine';
import useAppStore from '../src/store/useAppStore';
import { useTheme } from '../src/theme';

export default function SurvivalSetup() {
  const router = useRouter();
  const theme = useTheme();
  const { updateQuizConfig, startQuiz } = useAppStore();

  const [categories, setCategories] = useState([CATEGORIES[0].key]);
  const [difficulty, setDifficulty] = useState('medium');

  const toggleCategory = (key) => {
    if (categories.includes(key)) {
      if (categories.length > 1) {
        setCategories(categories.filter((c) => c !== key));
      }
    } else {
      setCategories([...categories, key]);
    }
  };

  const handleStart = () => {
    updateQuizConfig({ 
      category: categories,
      difficulty: difficulty, 
      rangeMode: 'random', 
      customRange: null, 
      timePerQuestion: 10, // Starts at 10s
      isInfinite: false,
      isSurvival: true,
      infiniteLimit: null,
      questionCount: 5, // Must be > 1 to provide a buffer for dynamic appending
    });
    startQuiz();
    router.push('/survival-quiz');
  };

  const PillButton = ({ label, active, onPress, style }) => (
    <TouchableOpacity
      style={[
        styles.pill,
        { backgroundColor: theme.surface, borderColor: theme.border },
        active && { backgroundColor: theme.primary, borderColor: theme.primary },
        style
      ]}
      onPress={onPress}
    >
      <Text style={[styles.pillText, { color: theme.textSecondary }, active && { color: '#FFF' }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Feather name="arrow-left" size={24} color={theme.text} />
      </TouchableOpacity>

      <View style={styles.headerRow}>
        <View style={[styles.headerIconBg, { backgroundColor: '#FEE2E2' }]}>
          <Feather name="clock" size={28} color="#EF4444" />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Survival Mode</Text>
      </View>

      <View style={[styles.rulesCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.rulesTitle, { color: theme.text }]}>How it works:</Text>
        <View style={styles.ruleItem}>
          <Feather name="play" size={16} color={theme.primary} />
          <Text style={[styles.ruleText, { color: theme.textSecondary }]}>Start with exactly 10 seconds.</Text>
        </View>
        <View style={styles.ruleItem}>
          <Feather name="check-circle" size={16} color="#10B981" />
          <Text style={[styles.ruleText, { color: theme.textSecondary }]}>Every correct answer adds +2 seconds.</Text>
        </View>
        <View style={styles.ruleItem}>
          <Feather name="x-circle" size={16} color="#EF4444" />
          <Text style={[styles.ruleText, { color: theme.textSecondary }]}>Every wrong answer deducts -3 seconds.</Text>
        </View>
        <View style={styles.ruleItem}>
          <Feather name="alert-triangle" size={16} color="#F59E0B" />
          <Text style={[styles.ruleText, { color: theme.textSecondary }]}>Game over when the clock hits zero!</Text>
        </View>
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>Select Categories (Multiple)</Text>
      <View style={styles.pillRow}>
        {CATEGORIES.map((cat) => (
          <PillButton key={cat.key} label={cat.label} active={categories.includes(cat.key)} onPress={() => toggleCategory(cat.key)} />
        ))}
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>Difficulty</Text>
      <View style={styles.pillRow}>
        {['easy', 'medium', 'hard'].map((d) => (
          <PillButton key={d} label={d.charAt(0).toUpperCase() + d.slice(1)} active={difficulty === d} onPress={() => setDifficulty(d)} />
        ))}
      </View>

      <TouchableOpacity style={[styles.startBtn, { backgroundColor: '#EF4444' }]} onPress={handleStart} activeOpacity={0.8}>
        <Text style={styles.startText}>Fight for Survival</Text>
        <Feather name="activity" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  backBtn: { paddingTop: 60, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  headerIconBg: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  title: { fontSize: 26, fontWeight: '800' },
  rulesCard: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  rulesTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  ruleItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  ruleText: { fontSize: 14, fontWeight: '500' },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 12, marginTop: 12 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pill: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  pillText: { fontSize: 15, fontWeight: '600' },
  startBtn: { marginTop: 36, height: 56, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  startText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
});
