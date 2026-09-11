import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, FlatList } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import useAppStore from '../src/store/useAppStore';
import { useTheme } from '../src/theme';
import MathEquation from '../src/components/MathEquation';
import { hapticTap, hapticWrong } from '../src/haptics';
import { showInterstitialAd } from '../src/ads/AdManager';

const { width, height } = Dimensions.get('window');

const QuestionSlide = ({ question, index, currentIndex, onAnswer, onInteractionStart, theme }) => {
  const [localFeedback, setLocalFeedback] = useState(null);
  const isActive = index === currentIndex;

  useEffect(() => {
    if (isActive) {
      setLocalFeedback(null);
    }
  }, [isActive]);

  const handlePress = (opt) => {
    if (localFeedback || !isActive) return;
    const isCorrect = String(opt) === String(question.correctAnswer);
    
    if (isCorrect) hapticTap();
    else hapticWrong();
    
    setLocalFeedback({ correct: isCorrect, userAnswer: opt, correctAnswer: question.correctAnswer });
    onInteractionStart();
    
    setTimeout(() => {
      onAnswer(opt, isCorrect);
    }, 600);
  };

  return (
    <View style={styles.slideContainer}>
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

export default function SurvivalQuiz() {
  const router = useRouter();
  const navigation = useNavigation();
  const theme = useTheme();
  const { quiz, submitAnswer, tickTimer, timeUp, manuallyFinishQuiz, quizConfig } = useAppStore();
  const flatListRef = useRef(null);
  const [timePopup, setTimePopup] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (useAppStore.getState().quiz.isFinished) return;
      e.preventDefault();
      manuallyFinishQuiz();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (!quiz.isActive || quiz.isFinished || isPaused) return;
    const interval = setInterval(() => { tickTimer(); }, 1000);
    return () => clearInterval(interval);
  }, [quiz.isActive, quiz.isFinished, isPaused]);

  useEffect(() => {
    if (quiz.isActive && !quiz.isFinished && quiz.timeRemaining <= 0 && !isPaused) {
      timeUp(); // Ends quiz
    }
  }, [quiz.timeRemaining, isPaused, quiz.isActive, quiz.isFinished]);

  useEffect(() => {
    if (quiz.isFinished) {
      setTimeout(() => {
        showInterstitialAd(() => {
          router.replace('/results');
        });
      }, 800);
    }
  }, [quiz.isFinished]);

  const handleAnswer = (userAns, isCorrect) => {
    setIsPaused(false);
    if (userAns !== null) {
      const delta = isCorrect ? 2 : -3;
      setTimePopup(delta > 0 ? '+2s' : '-3s');
      setTimeout(() => setTimePopup(null), 800);
    }

    const timeTaken = 1; // Not accurate but doesn't matter for survival mode saving
    submitAnswer(userAns, timeTaken);
    
    setTimeout(() => {
      const updatedIndex = useAppStore.getState().quiz.currentIndex;
      if (!useAppStore.getState().quiz.isFinished) {
        flatListRef.current?.scrollToIndex({ index: updatedIndex, animated: true });
      }
    }, 100);
  };

  if (!quiz.isActive || !quiz.questions.length) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading...</Text>
      </View>
    );
  }

  const timerColor = quiz.timeRemaining > 5 ? theme.text : theme.danger;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.quizHeader}>
        <Text style={[styles.counter, { color: theme.textSecondary }]}>
          Score: {quiz.score}
        </Text>
        <TouchableOpacity onPress={() => manuallyFinishQuiz()} style={styles.closeBtn}>
          <Feather name="x" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.clockContainer}>
        <Feather name="clock" size={24} color={timerColor} />
        <Text style={[styles.clockText, { color: timerColor }]}>{quiz.timeRemaining}s</Text>
        
        {timePopup && (
          <Text style={[
            styles.timePopup, 
            { color: timePopup.startsWith('+') ? theme.success : theme.danger }
          ]}>
            {timePopup}
          </Text>
        )}
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
            onInteractionStart={() => setIsPaused(true)}
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
  counter: { fontSize: 18, fontWeight: '800' },
  closeBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  
  clockContainer: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    gap: 8,
  },
  clockText: { fontSize: 32, fontWeight: '900' },
  timePopup: {
    position: 'absolute',
    right: '25%',
    fontSize: 24,
    fontWeight: '900',
  },

  slideContainer: { height: height, width: width, justifyContent: 'center' },
  questionArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, marginTop: 80 },
  questionText: { fontSize: 56, fontWeight: '900', textAlign: 'center', letterSpacing: -2 },
  
  mcqGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, paddingHorizontal: 20, paddingBottom: 100 },
  mcqBtn: { width: (width - 56) / 2, paddingVertical: 24, borderRadius: 20, borderWidth: 1.5, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4 },
  mcqText: { fontSize: 26, fontWeight: '800' },
});
