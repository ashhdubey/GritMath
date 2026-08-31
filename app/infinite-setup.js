import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { CATEGORIES } from '../src/engine/MathEngine';
import useAppStore from '../src/store/useAppStore';
import { useTheme } from '../src/theme';

const LIMITS = ['Infinity', 25, 50, 100];

export default function InfiniteSetup() {
  const router = useRouter();
  const theme = useTheme();
  const { updateQuizConfig, startQuiz } = useAppStore();

  const [categories, setCategories] = useState([CATEGORIES[0].key]);
  const [timePerQ, setTimePerQ] = useState(15);
  const [limit, setLimit] = useState('Infinity'); // 'Infinity' or number

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
      category: categories, // now passing array 
      difficulty: 'medium', 
      rangeMode: 'random', 
      customRange: null, 
      timePerQuestion: timePerQ,
      isInfinite: true,
      infiniteLimit: limit === 'Infinity' ? null : limit,
      questionCount: limit === 'Infinity' ? 5 : limit 
    });
    startQuiz();
    router.push('/infinite-quiz');
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
        <View style={[styles.headerIconBg, { backgroundColor: theme.primaryLight }]}>
          <Feather name="play-circle" size={28} color={theme.primary} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Infinite Mode</Text>
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>Select Categories (Multiple)</Text>
      <View style={styles.pillRow}>
        {CATEGORIES.map((cat) => (
          <PillButton key={cat.key} label={cat.label} active={categories.includes(cat.key)} onPress={() => toggleCategory(cat.key)} />
        ))}
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>Time per question: {timePerQ}s</Text>
      <View style={styles.pillRow}>
        {[5, 10, 15, 20, 30].map((t) => (
          <PillButton key={t} label={`${t}s`} active={timePerQ === t} onPress={() => setTimePerQ(t)} style={{ minWidth: 48, alignItems: 'center' }} />
        ))}
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>Question Limit</Text>
      <View style={styles.pillRow}>
        {LIMITS.map((lim) => (
          <PillButton key={lim} label={`${lim}`} active={limit === lim} onPress={() => setLimit(lim)} />
        ))}
      </View>

      <TouchableOpacity style={[styles.startBtn, { backgroundColor: theme.primary }]} onPress={handleStart} activeOpacity={0.8}>
        <Text style={styles.startText}>Start Scrolling</Text>
        <Feather name="arrow-right" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  backBtn: { paddingTop: 60, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  headerIconBg: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  title: { fontSize: 26, fontWeight: '800' },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 12, marginTop: 20 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pill: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  pillText: { fontSize: 15, fontWeight: '600' },
  startBtn: { marginTop: 36, height: 56, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: '#0056D2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  startText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
});
