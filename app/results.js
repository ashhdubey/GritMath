import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import useAppStore from '../src/store/useAppStore';
import { CATEGORIES } from '../src/engine/MathEngine';
import { useTheme } from '../src/theme';
import MathEquation from '../src/components/MathEquation';

export default function Results() {
  const router = useRouter();
  const theme = useTheme();
  const { quiz, quizConfig, endQuiz, startQuiz } = useAppStore();
  const catInfo = CATEGORIES.find((c) => c.key === quizConfig.category) || CATEGORIES[0];

  const score = quiz.score;
  const total = quiz.questions.length || 1;
  const pct = Math.round((score / total) * 100);
  const avgTime = quiz.answers.length > 0
    ? (quiz.answers.reduce((sum, a) => sum + (a.timeTaken || 0), 0) / quiz.answers.length).toFixed(1)
    : '0';

  const scoreColor = pct >= 80 ? theme.success : pct >= 50 ? theme.warning : theme.danger;

  // BUG-09 FIX: Route to the correct screen based on quiz mode
  const handleRetry = () => {
    endQuiz();
    startQuiz();
    if (quizConfig.isInfinite) {
      router.replace('/infinite-quiz');
    } else {
      router.replace('/quiz');
    }
  };
  const handleHome = () => { endQuiz(); router.replace('/home'); };

  // BUG-11 FIX: Show a friendly category label even when category is an array
  const getCategoryLabel = () => {
    if (Array.isArray(quizConfig.category)) return 'Mixed';
    return catInfo.label;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Quiz Complete!</Text>
        <Text style={[styles.headerSub, { color: theme.textSecondary }]}>{getCategoryLabel()} • {quizConfig.difficulty}</Text>
      </View>

      {/* Score Circle */}
      <View style={styles.scoreSection}>
        <View style={[styles.scoreCircle, { borderColor: scoreColor, backgroundColor: theme.surface }]}>
          <Text style={[styles.scorePercent, { color: scoreColor }]}>{pct}%</Text>
          <Text style={[styles.scoreRatio, { color: theme.textSecondary }]}>{score} / {total}</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.statValue2, { color: theme.text }]}>{score}</Text>
          <Text style={[styles.statLabel2, { color: theme.textSecondary }]}>Correct</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.statValue2, { color: theme.text }]}>{total - score}</Text>
          <Text style={[styles.statLabel2, { color: theme.textSecondary }]}>Wrong</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.statValue2, { color: theme.text }]}>{avgTime}s</Text>
          <Text style={[styles.statLabel2, { color: theme.textSecondary }]}>Avg Time</Text>
        </View>
      </View>

      {/* Answer Review */}
      <Text style={[styles.reviewTitle, { color: theme.text }]}>Review</Text>
      {quiz.answers.map((ans, i) => {
        const q = quiz.questions[i];
        if (!q) return null; // BUG-03 FIX: Guard against undefined question
        const itemColor = ans.correct ? theme.success : theme.danger;
        return (
          <View key={i} style={[styles.reviewItem, { backgroundColor: theme.surface, borderLeftColor: itemColor, borderColor: theme.border }]}>
            <MathEquation text={q?.questionText} style={styles.reviewQ} color={theme.text} fontSize={18} />
            <View style={styles.reviewRow}>
              <Text style={[styles.reviewAns, { color: itemColor }]}>
                {ans.correct ? '✓' : '✗'} Your answer: {ans.userAnswer ?? '—'}
              </Text>
              {!ans.correct && (
                <Text style={[styles.reviewCorrect, { color: theme.success }]}>Correct: {ans.correctAnswer}</Text>
              )}
            </View>
          </View>
        );
      })}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.retryBtn, { backgroundColor: theme.primary }]} onPress={handleRetry}>
          <Feather name="rotate-ccw" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.btnText}>Retry Same Quiz</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.homeBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={handleHome}>
          <Text style={[styles.btnText, { color: theme.textSecondary }]}>Back to Home</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { paddingTop: 70, paddingBottom: 10, alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '900' },
  headerSub: { fontSize: 14, marginTop: 4 },
  scoreSection: { alignItems: 'center', marginVertical: 30 },
  scoreCircle: { width: 160, height: 160, borderRadius: 80, borderWidth: 6, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  scorePercent: { fontSize: 42, fontWeight: '900' },
  scoreRatio: { fontSize: 16, marginTop: 2, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statBox: { flex: 1, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1 },
  statValue2: { fontSize: 22, fontWeight: '800' },
  statLabel2: { fontSize: 12, marginTop: 4, fontWeight: '600' },
  reviewTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  reviewItem: { borderRadius: 10, padding: 14, marginBottom: 8, borderLeftWidth: 4, borderWidth: 1 },
  reviewQ: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  reviewRow: {},
  reviewAns: { fontSize: 14, fontWeight: '600' },
  reviewCorrect: { fontSize: 13, marginTop: 4, fontWeight: '600' },
  actions: { marginTop: 24, gap: 12 },
  retryBtn: { height: 52, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: '#0056D2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  homeBtn: { height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
