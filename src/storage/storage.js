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
  DAILY_ACTIVE_TIME: 'dailyActiveTime',
  LAST_DAILY_COMPLETED: 'lastDailyCompletedDate',
  HAPTICS_ENABLED: 'hapticsEnabled',
  NOTIFS_ENABLED: 'notifsEnabled',
  NOTIFS_TIME: 'notifsTime', // e.g. "20:00"
  AUTO_UPDATE_ENABLED: 'autoUpdateEnabled',
  UPDATE_NOTIFS_ENABLED: 'updateNotifsEnabled',
  DAILY_STATS: 'dailyStats', // Add daily stats tracking
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

/**
 * BUG-05 FIX: Returns local-timezone date string YYYY-MM-DD.
 * toISOString() always uses UTC which causes wrong dates in IST (UTC+5:30).
 */
const toLocalDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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

export const getStreak = () => getVal(KEYS.DAILY_STREAK, { count: 0, max: 0, lastDate: null });

export const recordPracticeDay = () => {
  const streak = getStreak();
  // BUG-05 FIX: use local timezone date, not UTC
  const today = toLocalDateString(new Date());

  if (streak.lastDate === today) return streak;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toLocalDateString(yesterday);

  // Timezone travel safety: parse dates to check if lastDate is in the future
  const parsedLastDate = streak.lastDate ? new Date(streak.lastDate.split('-')) : null;
  const parsedToday = new Date(today.split('-'));

  if (streak.lastDate === yesterdayStr) {
    streak.count += 1;
  } else if (parsedLastDate && parsedLastDate > parsedToday) {
    // User traveled backwards in time (timezone shift). Don't reset streak, just return.
    return streak;
  } else {
    // If last practice was before yesterday, streak resets.
    streak.count = 1;
  }

  // Update max streak if current streak exceeds it
  if (streak.count > (streak.max || 0)) {
    streak.max = streak.count;
  }

  streak.lastDate = today;
  setVal(KEYS.DAILY_STREAK, streak);
  return streak;
};

// ──────────────────── Daily Active Time (Heatmap) ─────────

export const getDailyActiveTime = () => {
  const times = getVal(KEYS.DAILY_ACTIVE_TIME, {});
  return typeof times === 'object' && times !== null && !Array.isArray(times) ? times : {};
};

export const recordActiveMinutes = (minutes) => {
  if (minutes <= 0) return;
  const times = getDailyActiveTime();
  // BUG-05 FIX: use local timezone date
  const today = toLocalDateString(new Date());
  
  if (!times[today]) {
    times[today] = 0;
  }
  times[today] += minutes;
  
  setVal(KEYS.DAILY_ACTIVE_TIME, times);
};

// ──────────────────── Total Solved ───────────────────────

export const getTotalSolved = () => {
  const total = getVal(KEYS.TOTAL_SOLVED, 0);
  return typeof total === 'number' && !isNaN(total) ? total : 0;
};

export const addToTotalSolved = (count) => {
  setVal(KEYS.TOTAL_SOLVED, getTotalSolved() + count);
};

// ──────────────────── Daily Completion ───────────────────

export const getLastDailyCompletedDate = () => getVal(KEYS.LAST_DAILY_COMPLETED, null);

export const setLastDailyCompletedDate = (dateStr) => setVal(KEYS.LAST_DAILY_COMPLETED, dateStr);

// ──────────────────── User Preferences ───────────────────

export const getAccentColor = () => getVal(KEYS.ACCENT_COLOR, '#6C5CE7');

export const setAccentColor = (color) => setVal(KEYS.ACCENT_COLOR, color);

export const getThemePreference = () => getVal(KEYS.THEME_PREFERENCE, 'system');
export const setThemePreference = (pref) => setVal(KEYS.THEME_PREFERENCE, pref);

// ──────────────────── Haptics & Notifications ────────────

export const getHapticsEnabled = () => getVal(KEYS.HAPTICS_ENABLED, true);
export const setHapticsEnabled = (enabled) => setVal(KEYS.HAPTICS_ENABLED, enabled);

export const getNotifsEnabled = () => getVal(KEYS.NOTIFS_ENABLED, false);
export const setNotifsEnabled = (enabled) => setVal(KEYS.NOTIFS_ENABLED, enabled);

export const getNotifsTime = () => getVal(KEYS.NOTIFS_TIME, '20:00'); // Default 8 PM
export const setNotifsTime = (timeStr) => setVal(KEYS.NOTIFS_TIME, timeStr);

export const getAutoUpdateEnabled = () => getVal(KEYS.AUTO_UPDATE_ENABLED, true);
export const setAutoUpdateEnabled = (enabled) => setVal(KEYS.AUTO_UPDATE_ENABLED, enabled);

export const getUpdateNotifsEnabled = () => getVal(KEYS.UPDATE_NOTIFS_ENABLED, true);
export const setUpdateNotifsEnabled = (enabled) => setVal(KEYS.UPDATE_NOTIFS_ENABLED, enabled);

// ──────────────────── Advanced ───────────────────────────

export const isOnboardingDone = () => getVal(KEYS.ONBOARDING_DONE, false);

export const setOnboardingDone = () => setVal(KEYS.ONBOARDING_DONE, true);

// ──────────────────── Quiz History ───────────────────────

export const saveQuizSession = (session) => {
  let history = getVal(KEYS.QUIZ_HISTORY, []);
  if (!Array.isArray(history)) history = [];
  const now = new Date();
  history.unshift({ ...session, date: now.toISOString() });
  if (history.length > 50) history.length = 50;
  setVal(KEYS.QUIZ_HISTORY, history);

  // Update daily stats for Dashboard
  const today = toLocalDateString(now);
  let dailyStats = getVal(KEYS.DAILY_STATS, {});
  if (!dailyStats[today]) {
    dailyStats[today] = {
      endless: { total: 0, correct: 0, wrong: 0, skipped: 0 },
      survival: { total: 0, correct: 0, wrong: 0, skipped: 0 },
      practice: { total: 0, correct: 0, wrong: 0, skipped: 0 }
    };
  }

  const mode = session.isSurvival ? 'survival' : (session.isInfinite ? 'endless' : 'practice');
  
  dailyStats[today][mode].total += (session.total || 0);
  dailyStats[today][mode].correct += (session.correct || 0);
  dailyStats[today][mode].wrong += (session.wrong || 0);
  dailyStats[today][mode].skipped += (session.skipped || 0);

  setVal(KEYS.DAILY_STATS, dailyStats);
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

export const updateCategoryStats = (category, attempted, correct, timeTaken = 0) => {
  const stats = getCategoryStats();
  // BUG-11 FIX: if category is an array (infinite mode), store under 'mixed' key
  const key = Array.isArray(category) ? 'mixed' : category;
  if (!stats[key]) {
    stats[key] = { attempted: 0, correct: 0, totalTime: 0 };
  }
  stats[key].attempted += attempted;
  stats[key].correct += correct;
  stats[key].totalTime = (stats[key].totalTime || 0) + timeTaken;
  setVal(KEYS.CATEGORY_STATS, stats);
};

// ──────────────────── Dashboard Stats ────────────────────

export const getDashboardStats = (timeRange) => { // 'today', 'week', 'month', 'overall'
  const stats = getVal(KEYS.DAILY_STATS, {});
  
  let total = 0; let correct = 0; let wrong = 0; let skipped = 0;
  let practiceAcc = { correct: 0, total: 0 };
  let endlessAcc = { correct: 0, total: 0 };
  let survivalAcc = { correct: 0, total: 0 };

  const now = new Date();
  // Set time to start of day for accurate calculation
  now.setHours(0, 0, 0, 0);

  Object.keys(stats).forEach(dateStr => {
    const [y, m, d] = dateStr.split('-');
    const statDate = new Date(y, m - 1, d);
    
    const diffTime = Math.abs(now - statDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let includeInFilter = false;
    if (timeRange === 'today' && diffDays === 0) includeInFilter = true;
    else if (timeRange === 'week' && diffDays < 7) includeInFilter = true;
    else if (timeRange === 'month' && diffDays < 30) includeInFilter = true;
    else if (timeRange === 'overall') includeInFilter = true;

    const dayStat = stats[dateStr];

    // For performance section (Endless + Survival only)
    if (includeInFilter) {
      ['endless', 'survival'].forEach(mode => {
        total += dayStat[mode].total || 0;
        correct += dayStat[mode].correct || 0;
        wrong += dayStat[mode].wrong || 0;
        skipped += dayStat[mode].skipped || 0;
      });
    }

    // For Pie chart (Overall accuracy per mode)
    practiceAcc.correct += dayStat.practice?.correct || 0;
    practiceAcc.total += dayStat.practice?.total || 0;
    endlessAcc.correct += dayStat.endless?.correct || 0;
    endlessAcc.total += dayStat.endless?.total || 0;
    survivalAcc.correct += dayStat.survival?.correct || 0;
    survivalAcc.total += dayStat.survival?.total || 0;
  });

  return {
    performance: { total, correct, wrong, skipped },
    moduleAcc: {
      endless: endlessAcc.total > 0 ? (endlessAcc.correct / endlessAcc.total) * 100 : 0,
      survival: survivalAcc.total > 0 ? (survivalAcc.correct / survivalAcc.total) * 100 : 0
      // user requested: "Practice mode accuracy will not shown"
    }
  };
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
  getDashboardStats,
  getDailyActiveTime,
  recordActiveMinutes,
  resetAllData,
};
