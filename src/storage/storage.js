/**
 * storage.js
 * ─────────────────────────────────────────────────────────
 * Local device storage for GritMath.
 * Uses AsyncStorage with an in-memory sync cache layer.
 * Handles daily streaks, high scores, and user preferences.
 *
 * 100 % offline – zero network calls.
 * ─────────────────────────────────────────────────────────
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ───────────────────── In-Memory Cache ───────────────────
// Reads are synchronous from this cache.
// Writes update cache immediately + persist to AsyncStorage.

let _cache = {};
let _loaded = false;

/**
 * Must be called once at app startup to hydrate the cache.
 */
export const loadStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    if (keys.length > 0) {
      const pairs = await AsyncStorage.multiGet(keys);
      pairs.forEach(([key, value]) => {
        try {
          _cache[key] = JSON.parse(value);
        } catch {
          _cache[key] = value;
        }
      });
    }
  } catch (e) {
    console.warn('Storage load error:', e);
  }
  _loaded = true;
};

// ───────────────────── Key Constants ─────────────────────

const KEYS = {
  HIGH_SCORES: 'highScores',
  DAILY_STREAK: 'dailyStreak',
  TOTAL_SOLVED: 'totalSolved',
  ACCENT_COLOR: 'accentColor',
  ONBOARDING_DONE: 'onboardingDone',
  CATEGORY_STATS: 'categoryStats',
  THEME_PREFERENCE: 'themePreference',
  QUIZ_HISTORY: 'quizHistory',
};

// ──────────────────── Helpers ────────────────────────────

const getVal = (key, fallback = null) => {
  const val = _cache[key];
  return val !== undefined ? val : fallback;
};

const setVal = (key, value) => {
  _cache[key] = value;
  // Fire-and-forget persist
  AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
};

// ──────────────────── High Scores ────────────────────────

export const getHighScores = () => {
  const scores = getVal(KEYS.HIGH_SCORES, {});
  return typeof scores === 'object' && scores !== null && !Array.isArray(scores) ? scores : {};
};

export const updateHighScore = (category, score, total) => {
  const scores = getHighScores();
  const percentage = Math.round((score / total) * 100);
  const existing = scores[category];

  if (!existing || percentage > existing.percentage) {
    scores[category] = {
      score,
      total,
      percentage,
      date: new Date().toISOString(),
    };
    setVal(KEYS.HIGH_SCORES, scores);
    return true;
  }
  return false;
};

// ──────────────────── Daily Streak ───────────────────────

const toDateString = (date) => date.toISOString().slice(0, 10);

export const getStreak = () => getVal(KEYS.DAILY_STREAK, { count: 0, lastDate: null });

export const recordPracticeDay = () => {
  const streak = getStreak();
  const today = toDateString(new Date());

  if (streak.lastDate === today) return streak;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDateString(yesterday);

  if (streak.lastDate === yesterdayStr) {
    streak.count += 1;
  } else {
    streak.count = 1;
  }

  streak.lastDate = today;
  setVal(KEYS.DAILY_STREAK, streak);
  return streak;
};

// ──────────────────── Total Solved ───────────────────────

export const getTotalSolved = () => {
  const total = getVal(KEYS.TOTAL_SOLVED, 0);
  return typeof total === 'number' && !isNaN(total) ? total : 0;
};

export const addToTotalSolved = (count) => {
  setVal(KEYS.TOTAL_SOLVED, getTotalSolved() + count);
};

// ──────────────────── User Preferences ───────────────────

export const getAccentColor = () => getVal(KEYS.ACCENT_COLOR, '#6C5CE7');

export const setAccentColor = (color) => setVal(KEYS.ACCENT_COLOR, color);

export const getThemePreference = () => getVal(KEYS.THEME_PREFERENCE, 'system');

export const setThemePreference = (pref) => setVal(KEYS.THEME_PREFERENCE, pref);

export const isOnboardingDone = () => getVal(KEYS.ONBOARDING_DONE, false);

export const setOnboardingDone = () => setVal(KEYS.ONBOARDING_DONE, true);

// ──────────────────── Quiz History ───────────────────────

export const saveQuizSession = (session) => {
  let history = getVal(KEYS.QUIZ_HISTORY, []);
  if (!Array.isArray(history)) history = [];
  history.unshift({ ...session, date: new Date().toISOString() });
  if (history.length > 50) history.length = 50;
  setVal(KEYS.QUIZ_HISTORY, history);
};

export const getQuizHistory = () => {
  const history = getVal(KEYS.QUIZ_HISTORY, []);
  return Array.isArray(history) ? history : [];
};

// ──────────────────── Category Stats ─────────────────────

export const getCategoryStats = () => {
  const stats = getVal(KEYS.CATEGORY_STATS, {});
  return typeof stats === 'object' && stats !== null && !Array.isArray(stats) ? stats : {};
};

export const updateCategoryStats = (category, attempted, correct) => {
  const stats = getCategoryStats();
  if (!stats[category]) {
    stats[category] = { attempted: 0, correct: 0 };
  }
  stats[category].attempted += attempted;
  stats[category].correct += correct;
  setVal(KEYS.CATEGORY_STATS, stats);
};

// ──────────────────── Reset ──────────────────────────────

export const resetAllData = () => {
  _cache = {};
  AsyncStorage.clear().catch(() => {});
};

export default {
  loadStorage,
  getHighScores,
  updateHighScore,
  getStreak,
  recordPracticeDay,
  getTotalSolved,
  addToTotalSolved,
  getAccentColor,
  setAccentColor,
  getThemePreference,
  setThemePreference,
  isOnboardingDone,
  setOnboardingDone,
  saveQuizSession,
  getQuizHistory,
  getCategoryStats,
  updateCategoryStats,
  resetAllData,
};
