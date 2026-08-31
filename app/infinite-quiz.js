import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import useAppStore from '../src/store/useAppStore';
import { useTheme } from '../src/theme';
import MathEquation from '../src/components/MathEquation';

const { width, height } = Dimensions.get('window');

const QuestionSlide = ({ question, index, currentIndex, onAnswer, timerWidth, timerColor, theme }) => {
  const [localFeedback, setLocalFeedback] = useState(null);
  const isActive = index === currentIndex;

  const handlePress = (opt) => {
    if (localFeedback || !isActive) return;
    const isCorrect = String(opt) === String(question.correctAnswer);
    setLocalFeedback({ correct: isCorrect, userAnswer: opt, correctAnswer: question.correctAnswer });
    
    setTimeout(() => {
      onAnswer(opt);
    }, 600);
  };

  return (
    <View style={styles.slideContainer}>
      {isActive && (
        <View style={styles.timerContainer}>
          <Animated.View style={[styles.timerBar, {
            backgroundColor: timerColor,
            width: timerWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          }]} />
        </View>
      )}

      <View style={styles.questionArea}>
        <MathEquation text={question.questionText} style={styles.questionText} color={theme.text} fontSize={56} />
      </View>

      <View style={styles.mcqGrid}>
        {question.options.map((opt, i) => {
          let btnColor = theme.surface;
          let borderCol = theme.border;
          let textColor = theme.text;
          
          if (localFeedback) {
            if (String(opt) === String(localFeedback.correctAnswer)) {
              btnColor = theme.successLight;
              borderCol = theme.success;
              textColor = theme.success;
            } else if (String(opt) === String(localFeedback.userAnswer) && !localFeedback.correct) {
              btnColor = theme.dangerLight;
              borderCol = theme.danger;
              textColor = theme.danger;
            }
          }
          return (
            <TouchableOpacity
              key={i}
              style={[styles.mcqBtn, { backgroundColor: btnColor, borderColor: borderCol }]}
              onPress={() => handlePress(opt)}
              disabled={!!localFeedback || !isActive}
              activeOpacity={0.7}
            >
              <Text style={[styles.mcqText, { color: textColor }]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default function InfiniteQuiz() {
  const router = useRouter();
  const theme = useTheme();
  const { quiz, submitAnswer, tickTimer, timeUp, endQuiz, quizConfig } = useAppStore();
  const flatListRef = useRef(null);
  const timerWidth = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!quiz.isActive || quiz.isFinished) return;
    const interval = setInterval(() => { tickTimer(); }, 1000);
    return () => clearInterval(interval);
  }, [quiz.isActive, quiz.isFinished]);

  useEffect(() => {
    if (!quiz.isActive || quiz.isFinished) return;
    const pct = quiz.timeRemaining / quizConfig.timePerQuestion;
    Animated.timing(timerWidth, { toValue: pct, duration: 300, useNativeDriver: false }).start();
  }, [quiz.timeRemaining]);

  useEffect(() => {
    if (quiz.isActive && !quiz.isFinished && quiz.timeRemaining <= 0) {
      handleAnswer(null);
      timeUp();
    }
  }, [quiz.timeRemaining]);

  useEffect(() => {
    if (quiz.isFinished) {
      setTimeout(() => router.replace('/results'), 800);
    }
  }, [quiz.isFinished]);

  const handleAnswer = (userAns) => {
    const timeTaken = quizConfig.timePerQuestion - quiz.timeRemaining;
    submitAnswer(userAns, timeTaken);
    
    if (!quiz.isFinished) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: quiz.currentIndex + 1, animated: true });
      }, 100);
    }
  };

  if (!quiz.isActive || !quiz.questions.length) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading...</Text>
      </View>
    );
  }

  const timerColor = quiz.timeRemaining > quizConfig.timePerQuestion * 0.5 ? theme.success
    : quiz.timeRemaining > quizConfig.timePerQuestion * 0.25 ? theme.warning : theme.danger;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.quizHeader}>
        <Text style={[styles.counter, { color: theme.textSecondary }]}>
          Q {quiz.currentIndex + 1} {quizConfig.infiniteLimit ? `/ ${quizConfig.infiniteLimit}` : ' (Infinite)'}
        </Text>
        <TouchableOpacity onPress={() => { endQuiz(); router.replace('/home'); }} style={styles.closeBtn}>
          <Feather name="x" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={quiz.questions}
        keyExtractor={(item, index) => item.id + index}
        renderItem={({ item, index }) => (
          <QuestionSlide
            question={item}
            index={index}
            currentIndex={quiz.currentIndex}
            onAnswer={handleAnswer}
            timerWidth={timerWidth}
            timerColor={timerColor}
            theme={theme}
          />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        initialNumToRender={2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingText: { fontSize: 18, textAlign: 'center', marginTop: 100, fontWeight: '500' },
  quizHeader: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10
  },
  counter: { fontSize: 16, fontWeight: '700' },
  closeBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  
  slideContainer: { height: height, width: width, justifyContent: 'center' },
  timerContainer: { height: 4, backgroundColor: 'transparent', position: 'absolute', top: 120, left: 20, right: 20, borderRadius: 2, overflow: 'hidden' },
  timerBar: { height: 4, borderRadius: 2 },
  
  questionArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, marginTop: 40 },
  questionText: { fontSize: 56, fontWeight: '900', textAlign: 'center', letterSpacing: -2 },
  
  mcqGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, paddingHorizontal: 20, paddingBottom: 100 },
  mcqBtn: { width: (width - 56) / 2, paddingVertical: 24, borderRadius: 20, borderWidth: 1.5, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4 },
  mcqText: { fontSize: 26, fontWeight: '800' },
});
