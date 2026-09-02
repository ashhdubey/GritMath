import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { CATEGORIES } from '../src/engine/MathEngine';
import useAppStore from '../src/store/useAppStore';
import { useTheme } from '../src/theme';

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const QUESTION_COUNTS = [10, 15, 20, 25, 30, 40, 50];

export default function PracticeSetup() {
  const router = useRouter();
  const theme = useTheme();
  const { category } = useLocalSearchParams();
  const { updateQuizConfig, startQuiz } = useAppStore();
  const catInfo = CATEGORIES.find((c) => c.key === category) || CATEGORIES[0];

  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [rangeMode, setRangeMode] = useState('random');
  const [customMin, setCustomMin] = useState('2');
  const [customMax, setCustomMax] = useState('25');
  const [timePerQ, setTimePerQ] = useState(15);
  const [rangeError, setRangeError] = useState('');

  const handleStart = () => {
    // BUG-14 FIX: Validate custom range before starting
    if (rangeMode === 'specific') {
      const mn = parseInt(customMin, 10);
      const mx = parseInt(customMax, 10);
      if (isNaN(mn) || isNaN(mx) || mn >= mx || mn < 1) {
        setRangeError('Min must be less than Max and both must be positive.');
        return;
      }
    }
    setRangeError('');
    const customRange = rangeMode === 'specific'
      ? { min: parseInt(customMin, 10) || 2, max: parseInt(customMax, 10) || 25 }
      : null;
    updateQuizConfig({ category: catInfo.key, questionCount, difficulty, rangeMode, customRange, timePerQuestion: timePerQ });
    startQuiz();
    router.push('/quiz');
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
        <View style={[styles.catBadge, { backgroundColor: theme.primaryLight }]}>
          <Feather name={catInfo.featherIcon || 'hash'} size={24} color={theme.primary} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>{catInfo.label} Practice</Text>
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>Difficulty</Text>
      <View style={styles.pillRow}>
        {DIFFICULTIES.map((d) => (
          <PillButton key={d} label={d.charAt(0).toUpperCase() + d.slice(1)} active={difficulty === d} onPress={() => setDifficulty(d)} />
        ))}
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>Questions: {questionCount}</Text>
      <View style={styles.pillRow}>
        {QUESTION_COUNTS.map((n) => (
          <PillButton key={n} label={`${n}`} active={questionCount === n} onPress={() => setQuestionCount(n)} style={{ minWidth: 48, alignItems: 'center' }} />
        ))}
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>Time per question: {timePerQ}s</Text>
      <View style={styles.pillRow}>
        {[5, 10, 15, 20, 30].map((t) => (
          <PillButton key={t} label={`${t}s`} active={timePerQ === t} onPress={() => setTimePerQ(t)} style={{ minWidth: 48, alignItems: 'center' }} />
        ))}
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>Number Range</Text>
      <View style={styles.pillRow}>
        <PillButton label="Random" active={rangeMode === 'random'} onPress={() => setRangeMode('random')} />
        <PillButton label="Specific Range" active={rangeMode === 'specific'} onPress={() => setRangeMode('specific')} />
      </View>

      {rangeMode === 'specific' && (
        <View style={styles.rangeRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rangeLabel, { color: theme.textSecondary }]}>Min</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]} value={customMin} onChangeText={setCustomMin} keyboardType="number-pad" placeholderTextColor={theme.textSecondary} />
          </View>
          <Text style={[styles.rangeDash, { color: theme.textSecondary }]}>—</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rangeLabel, { color: theme.textSecondary }]}>Max</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]} value={customMax} onChangeText={setCustomMax} keyboardType="number-pad" placeholderTextColor={theme.textSecondary} />
          </View>
        </View>
      )}

      {rangeMode === 'specific' && rangeError ? (
        <Text style={{ color: theme.danger || '#EF4444', fontSize: 13, marginTop: 8, fontWeight: '600' }}>
          ⚠ {rangeError}
        </Text>
      ) : null}

      <TouchableOpacity style={[styles.startBtn, { backgroundColor: theme.primary }]} onPress={handleStart} activeOpacity={0.8}>
        <Text style={styles.startText}>Start Quiz</Text>
        <Feather name="zap" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  backBtn: { paddingTop: 60, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 32, gap: 14 },
  catBadge: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '800' },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 12, marginTop: 20 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pill: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  pillText: { fontSize: 15, fontWeight: '600' },
  rangeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  rangeLabel: { fontSize: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, fontSize: 18, fontWeight: '700' },
  rangeDash: { fontSize: 20, marginTop: 18 },
  startBtn: { marginTop: 36, height: 56, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: '#0056D2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  startText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
});
