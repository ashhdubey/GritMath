/**
 * useAppStore.js
 * ─────────────────────────────────────────────────────────
 * Zustand store for GritMath runtime state.
 *
 * Manages:
 *   • Active quiz state (questions, index, score, answers)
 *   • Countdown timer
 *   • UI preferences (accent color, input mode)
 *   • Practice setup configuration
 * ─────────────────────────────────────────────────────────
 */

import { create } from 'zustand';
import { generateQuiz, generateQuestion } from '../engine/MathEngine';
import {
  getAccentColor,
  setAccentColor as persistAccentColor,
  updateHighScore,
  addToTotalSolved,
  recordPracticeDay,
  saveQuizSession,
  updateCategoryStats,
  getThemePreference,
  setThemePreference as persistThemePreference,
} from '../storage/storage';

// ──────────────────── Default Constants ──────────────────

const DEFAULT_ACCENT = '#6C5CE7';

const DEFAULT_QUIZ_CONFIG = {
  category: 'square',
  questionCount: 10,
  difficulty: 'medium',
  rangeMode: 'random',  // 'random' | 'specific'
  customRange: null,     // { min, max } or null
  timePerQuestion: 15,   // seconds
  isInfinite: false,
  infiniteLimit: null,   // null for unlimited, or a number
};

const INITIAL_QUIZ_STATE = {
  isActive: false,
  questions: [],
  currentIndex: 0,
  score: 0,
  answers: [],          // { questionId, userAnswer, correct, timeTaken }
  timeRemaining: 0,
  isFinished: false,
  inputMode: 'mcq',     // 'mcq' | 'numpad'
};

// ──────────────────── Store ──────────────────────────────

const useAppStore = create((set, get) => ({

  // ─── UI Preferences ───
  accentColor: getAccentColor() || DEFAULT_ACCENT,

  setAccentColor: (color) => {
    persistAccentColor(color);
    set({ accentColor: color });
  },

  themePreference: getThemePreference(),

  setThemePreference: (pref) => {
    persistThemePreference(pref);
    set({ themePreference: pref });
  },

  // ─── Quiz Config (setup screen) ───
  quizConfig: { ...DEFAULT_QUIZ_CONFIG },

  updateQuizConfig: (partial) =>
    set((state) => ({
      quizConfig: { ...state.quizConfig, ...partial },
    })),

  resetQuizConfig: () => set({ quizConfig: { ...DEFAULT_QUIZ_CONFIG } }),

  // ─── Active Quiz State ───
  quiz: { ...INITIAL_QUIZ_STATE },

  /**
   * Start a new quiz session.
   */
  startQuiz: () => {
    const { quizConfig } = get();
    const questions = generateQuiz(
      quizConfig.category,
      quizConfig.questionCount,
      quizConfig.difficulty,
      quizConfig.customRange
    );

    set({
      quiz: {
        isActive: true,
        questions,
        currentIndex: 0,
        score: 0,
        answers: [],
        timeRemaining: quizConfig.timePerQuestion,
        isFinished: false,
        inputMode: get().quiz.inputMode, // preserve user's mode choice
      },
    });

    // Record that user practiced today
    recordPracticeDay();
  },

  /**
   * Submit an answer for the current question.
   */
  submitAnswer: (userAnswer, timeTaken) => {
    const { quiz, quizConfig } = get();
    if (!quiz.isActive || quiz.isFinished) return;

    const currentQ = quiz.questions[quiz.currentIndex];
    let correct;

    if (typeof currentQ.correctAnswer === 'string') {
      correct = String(userAnswer).trim() === currentQ.correctAnswer;
    } else {
      correct = Number(userAnswer) === currentQ.correctAnswer;
    }

    const newScore = correct ? quiz.score + 1 : quiz.score;
    const newAnswers = [
      ...quiz.answers,
      {
        questionId: currentQ.id,
        userAnswer,
        correctAnswer: currentQ.correctAnswer,
        correct,
        timeTaken,
      },
    ];

    const nextIndex = quiz.currentIndex + 1;
    let isFinished = nextIndex >= quiz.questions.length;

    if (isFinished) {
      get().saveQuizStats(quizConfig, quiz.questions.length, newScore, newAnswers);
    } else if (quizConfig.isInfinite) {
      // If infinite mode and not at limit, generate and push another question
      if (!quizConfig.infiniteLimit || nextIndex < quizConfig.infiniteLimit) {
        const nextQ = generateQuestion(quizConfig.category, quizConfig.difficulty, quizConfig.customRange);
        quiz.questions.push(nextQ);
        isFinished = false;
      }
    }

    set({
      quiz: {
        ...quiz,
        score: newScore,
        answers: newAnswers,
        currentIndex: isFinished ? quiz.currentIndex : nextIndex,
        isFinished,
        timeRemaining: isFinished ? 0 : quizConfig.timePerQuestion,
      },
    });
  },

  /**
   * Extracted persistence logic to allow saving stats for infinite mode when quitting.
   */
  saveQuizStats: (config, totalQuestions, score, answers) => {
    if (totalQuestions === 0) return;
    
    // Calculate total time taken across all answered questions
    const totalTime = answers.reduce((sum, ans) => sum + (ans.timeTaken || 0), 0);
    
    addToTotalSolved(totalQuestions);
    updateHighScore(config.category, score, totalQuestions);
    updateCategoryStats(config.category, totalQuestions, score, totalTime);
    saveQuizSession({
      category: config.category,
      score,
      total: totalQuestions,
      difficulty: config.difficulty,
      answers,
    });
  },

  /**
   * Called on timer expiry – auto‑skip the current question.
   */
  timeUp: () => {
    const { submitAnswer } = get();
    submitAnswer(null, get().quizConfig.timePerQuestion);
  },

  /**
   * Update the countdown timer (called every second).
   */
  tickTimer: () => {
    set((state) => {
      if (!state.quiz.isActive || state.quiz.isFinished) return state;
      const newTime = state.quiz.timeRemaining - 1;
      if (newTime <= 0) {
        // Time expired – will be handled by the component calling timeUp
        return { quiz: { ...state.quiz, timeRemaining: 0 } };
      }
      return { quiz: { ...state.quiz, timeRemaining: newTime } };
    });
  },

  /**
   * Toggle input mode between 'mcq' and 'numpad'.
   */
  toggleInputMode: () =>
    set((state) => ({
      quiz: {
        ...state.quiz,
        inputMode: state.quiz.inputMode === 'mcq' ? 'numpad' : 'mcq',
      },
    })),

  /**
   * Specifically for Infinite Mode to manually trigger saving before quitting.
   */
  manuallyFinishQuiz: () => {
    const { quiz, quizConfig, saveQuizStats } = get();
    // Only save if they actually answered something
    if (quiz.answers.length > 0) {
      saveQuizStats(quizConfig, quiz.answers.length, quiz.score, quiz.answers);
    }
    set({ quiz: { ...quiz, isFinished: true } });
  },

  /**
   * End the quiz and reset to initial state.
   */
  endQuiz: () => set({ quiz: { ...INITIAL_QUIZ_STATE } }),
}));

export default useAppStore;
