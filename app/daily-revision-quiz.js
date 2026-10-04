import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import useAppStore from '../src/store/useAppStore';
import { useTheme } from '../src/theme';
import MathEquation from '../src/components/MathEquation';
import { hapticTap, hapticWrong } from '../src/haptics';

const { width } = Dimensions.get('window');

const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'DEL'];

export default function DailyRevisionQuiz() {
  const router = useRouter();
  const navigation = useNavigation();
  const theme = useTheme();
  
  const { quiz, endQuiz, updateQuizConfig } = useAppStore();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const feedbackOpacity = useRef(new Animated.Value(0)).current;

  // Cleanup on unmount
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      endQuiz();
    });
    return unsubscribe;
  }, [navigation]);

  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading revision...</Text>
      </View>
    );
  }

  const currentQ = quiz.questions[currentIndex];
  
  const showFeedback = (isCorrect, correctAns) => {
    if (isCorrect) hapticTap();
    else hapticWrong();

    setFeedback({ correct: isCorrect, correctAnswer: correctAns });
    Animated.sequence([
      Animated.timing(feedbackOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(feedbackOpacity, { toValue: 0, duration: 400, delay: isCorrect ? 300 : 800, useNativeDriver: true }),
    ]).start(() => {
      setFeedback(null);
      setUserInput('');
      if (isCorrect) {
        if (currentIndex < quiz.questions.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          endQuiz();
          router.replace('/home'); // Or a completion screen
        }
      }
    });
  };

  const handleKeyPress = (key) => {
    if (feedback) return; // Prevent input while animating feedback
    hapticTap();
    
    if (key === 'DEL') {
      setUserInput(prev => prev.slice(0, -1));
    } else {
      setUserInput(prev => prev + key);
    }
  };

  const handleSubmit = () => {
    if (!userInput || feedback) return;
    
    const isCorrect = typeof currentQ.correctAnswer === 'string'
      ? userInput.trim() === currentQ.correctAnswer
      : Number(userInput) === currentQ.correctAnswer;
      
    showFeedback(isCorrect, currentQ.correctAnswer);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Daily Revision</Text>
        <Text style={[styles.counter, { color: theme.textSecondary }]}>{currentIndex + 1} / {quiz.questions.length}</Text>
        <TouchableOpacity onPress={() => { endQuiz(); router.replace('/(tabs)/revision'); }} style={{ padding: 4 }}>
          <Feather name="x" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Question */}
      <View style={styles.questionArea}>
        <MathEquation text={currentQ.questionText + ' = ?'} style={styles.questionText} color={theme.textSecondary} fontSize={42} />
        <View style={[styles.inputBox, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <Text style={[styles.inputText, { color: theme.text }]}>{userInput}</Text>
        </View>
      </View>

      {/* Feedback overlay */}
      {feedback && (
        <Animated.View style={[styles.feedbackBanner, { opacity: feedbackOpacity, backgroundColor: feedback.correct ? theme.successLight : theme.dangerLight }]}>
          <Text style={[styles.feedbackText, { color: feedback.correct ? theme.success : theme.danger }]}>
            {feedback.correct ? '✓ Correct!' : `✗ Answer: ${feedback.correctAnswer}`}
          </Text>
        </Animated.View>
      )}

      {/* Keypad */}
      <View style={styles.keypadContainer}>
        {KEYPAD.map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.keyBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => handleKeyPress(key)}
            disabled={!!feedback}
          >
            {key === 'DEL' ? <Feather name="delete" size={24} color={theme.text} /> : <Text style={[styles.keyText, { color: theme.text }]}>{key}</Text>}
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Submit Button */}
      <TouchableOpacity 
        style={[styles.submitBtn, { backgroundColor: userInput ? theme.primary : theme.border }]} 
        onPress={handleSubmit}
        disabled={!userInput || !!feedback}
      >
        <Text style={[styles.submitText, { color: userInput ? '#FFF' : theme.textSecondary }]}>Submit Answer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 40 },
  loadingText: { fontSize: 18, textAlign: 'center', marginTop: 100, fontWeight: '500' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  title: { fontSize: 20, fontWeight: '800' },
  counter: { fontSize: 15, fontWeight: '600' },
  questionArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  questionText: { fontSize: 42, fontWeight: '900', textAlign: 'center', letterSpacing: -1, marginBottom: 20 },
  inputBox: { minWidth: 150, height: 70, borderRadius: 16, borderWidth: 2, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  inputText: { fontSize: 36, fontWeight: '700' },
  feedbackBanner: { position: 'absolute', top: 120, left: 20, right: 20, borderRadius: 12, padding: 14, alignItems: 'center', zIndex: 10 },
  feedbackText: { fontSize: 18, fontWeight: '700' },
  keypadContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20, marginBottom: 20, justifyContent: 'center' },
  keyBtn: { width: (width - 60) / 3, height: 60, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  keyText: { fontSize: 24, fontWeight: '600' },
  submitBtn: { marginHorizontal: 20, height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  submitText: { fontSize: 18, fontWeight: '800' }
});
