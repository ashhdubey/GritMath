import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import useAppStore from '../src/store/useAppStore';
import { useTheme } from '../src/theme';
import MathEquation from '../src/components/MathEquation';

const { width } = Dimensions.get('window');

// BUG-10 FIX: Numpad mode removed entirely. Only MCQ is supported.
export default function Quiz() {
  const router = useRouter();
  const theme = useTheme();
  const { quiz, submitAnswer, tickTimer, timeUp, endQuiz, quizConfig } = useAppStore();
  const [feedback, setFeedback] = useState(null); // { correct: bool, correctAnswer }
  const timerWidth = useRef(new Animated.Value(1)).current;
  const feedbackOpacity = useRef(new Animated.Value(0)).current;

  // Timer tick
  useEffect(() => {
    if (!quiz.isActive || quiz.isFinished) return;
    const interval = setInterval(() => { tickTimer(); }, 1000);
    return () => clearInterval(interval);
  }, [quiz.isActive, quiz.isFinished]);

  // Timer bar animation
  useEffect(() => {
    if (!quiz.isActive || quiz.isFinished) return;
    const pct = quiz.timeRemaining / quizConfig.timePerQuestion;
    Animated.timing(timerWidth, { toValue: pct, duration: 300, useNativeDriver: false }).start();
  }, [quiz.timeRemaining]);

  // Auto-skip on time up
  useEffect(() => {
    if (quiz.isActive && !quiz.isFinished && quiz.timeRemaining <= 0) {
      showFeedback(null, quiz.questions[quiz.currentIndex]?.correctAnswer);
      timeUp();
    }
  }, [quiz.timeRemaining]);

  // Navigate to results when finished
  useEffect(() => {
    if (quiz.isFinished) {
      setTimeout(() => router.replace('/results'), 800);
    }
  }, [quiz.isFinished]);

  const showFeedback = (userAns, correctAns) => {
    const isCorrect = typeof correctAns === 'string'
      ? String(userAns).trim() === correctAns
      : Number(userAns) === correctAns;
    setFeedback({ correct: isCorrect, correctAnswer: correctAns, userAnswer: userAns });
    Animated.sequence([
      Animated.timing(feedbackOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(feedbackOpacity, { toValue: 0, duration: 400, delay: isCorrect ? 300 : 600, useNativeDriver: true }),
    ]).start(() => setFeedback(null));
  };

  const handleMCQPress = (option) => {
    if (feedback) return;
    const currentQ = quiz.questions[quiz.currentIndex];
    const timeTaken = quizConfig.timePerQuestion - quiz.timeRemaining;
    showFeedback(option, currentQ.correctAnswer);
    setTimeout(() => {
      submitAnswer(option, timeTaken);
    }, typeof currentQ.correctAnswer === 'string' ? 800 : (option === currentQ.correctAnswer ? 500 : 800));
  };

  if (!quiz.isActive || !quiz.questions.length) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading quiz...</Text>
      </View>
    );
  }

  const currentQ = quiz.questions[quiz.currentIndex];
  const timerColor = quiz.timeRemaining > quizConfig.timePerQuestion * 0.5 ? theme.success
    : quiz.timeRemaining > quizConfig.timePerQuestion * 0.25 ? theme.warning : theme.danger;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Timer Bar */}
      <View style={styles.timerContainer}>
        <Animated.View style={[styles.timerBar, {
          backgroundColor: timerColor,
          width: timerWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }]} />
      </View>

      {/* Header */}
      <View style={styles.quizHeader}>
        <Text style={[styles.timerText, { color: theme.text }]}>{quiz.timeRemaining}s</Text>
        <Text style={[styles.counter, { color: theme.textSecondary }]}>Q {quiz.currentIndex + 1} / {quiz.questions.length}</Text>
        <TouchableOpacity onPress={() => { endQuiz(); router.replace('/home'); }} style={{ padding: 4 }}>
          <Feather name="x" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Question */}
      <View style={styles.questionArea}>
        <MathEquation text={currentQ.questionText} style={styles.questionText} color={theme.text} fontSize={42} />
      </View>

      {/* Feedback overlay */}
      {feedback && (
        <Animated.View style={[styles.feedbackBanner, { opacity: feedbackOpacity, backgroundColor: feedback.correct ? theme.successLight : theme.dangerLight }]}>
          <Text style={[styles.feedbackText, { color: feedback.correct ? theme.success : theme.danger }]}>
            {feedback.correct ? '✓ Correct!' : `✗ Answer: ${feedback.correctAnswer}`}
          </Text>
        </Animated.View>
      )}

      {/* MCQ Grid */}
      <View style={styles.mcqGrid}>
        {currentQ.options.map((opt, i) => {
          let btnColor = theme.surface;
          let borderCol = theme.border;
          let textColor = theme.text;

          if (feedback) {
            if (String(opt) === String(feedback.correctAnswer)) {
              btnColor = theme.successLight;
              borderCol = theme.success;
              textColor = theme.success;
            }
            else if (String(opt) === String(feedback.userAnswer) && !feedback.correct) {
              btnColor = theme.dangerLight;
              borderCol = theme.danger;
              textColor = theme.danger;
            }
          }
          return (
            <TouchableOpacity
              key={i}
              style={[styles.mcqBtn, { backgroundColor: btnColor, borderColor: borderCol }]}
              onPress={() => handleMCQPress(opt)}
              disabled={!!feedback}
            >
              <Text style={[styles.mcqText, { color: textColor }]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingText: { fontSize: 18, textAlign: 'center', marginTop: 100, fontWeight: '500' },
  timerContainer: { height: 4, backgroundColor: 'transparent', marginTop: 54 },
  timerBar: { height: 4, borderRadius: 2 },
  quizHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  timerText: { fontSize: 20, fontWeight: '800', width: 50 },
  counter: { fontSize: 15, fontWeight: '600' },
  questionArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, minHeight: 140 },
  questionText: { fontSize: 42, fontWeight: '900', textAlign: 'center', letterSpacing: -1 },
  feedbackBanner: { position: 'absolute', top: 120, left: 20, right: 20, borderRadius: 12, padding: 14, alignItems: 'center' },
  feedbackText: { fontSize: 18, fontWeight: '700' },
  mcqGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 20, paddingBottom: 40 },
  mcqBtn: { width: (width - 52) / 2, paddingVertical: 22, borderRadius: 14, borderWidth: 1.5, alignItems: 'center' },
  mcqText: { fontSize: 22, fontWeight: '800' },
});
