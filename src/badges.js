import AsyncStorage from '@react-native-async-storage/async-storage';
import { getQuizHistory } from './storage/storage';

export const BADGES = [
  { id: 'mathlete', name: 'Mathlete', desc: 'Complete 25 total quizzes', icon: 'award', color: '#F59E0B' },
  { id: 'night_owl', name: 'Night Owl', desc: 'Complete a quiz between 12 AM and 4 AM', icon: 'moon', color: '#8B5CF6' },
  { id: 'flawless', name: 'Flawless', desc: '100% accuracy on a quiz (min 10 Qs)', icon: 'target', color: '#10B981' },
  { id: 'survivalist', name: 'Survivalist', desc: 'Score 15+ in Survival Mode', icon: 'shield', color: '#EF4444' },
];

let _unlockedBadges = null;

export const loadBadges = async () => {
  try {
    const data = await AsyncStorage.getItem('@GritMath_badges');
    _unlockedBadges = data ? JSON.parse(data) : [];
  } catch {
    _unlockedBadges = [];
  }
};

export const getUnlockedBadges = () => _unlockedBadges || [];

const unlockBadge = async (badgeId) => {
  if (!_unlockedBadges.includes(badgeId)) {
    _unlockedBadges.push(badgeId);
    await AsyncStorage.setItem('@GritMath_badges', JSON.stringify(_unlockedBadges));
    return true; // Newly unlocked
  }
  return false;
};

export const checkBadgesAfterQuiz = async (quizConfig, score, totalQuestions) => {
  const history = getQuizHistory();
  const unlockedNow = [];

  // 1. Mathlete
  if (history.length >= 25 && !_unlockedBadges.includes('mathlete')) {
    if (await unlockBadge('mathlete')) unlockedNow.push('mathlete');
  }

  // 2. Night Owl
  const hour = new Date().getHours();
  if (hour >= 0 && hour <= 4 && !_unlockedBadges.includes('night_owl')) {
    if (await unlockBadge('night_owl')) unlockedNow.push('night_owl');
  }

  // 3. Flawless
  if (totalQuestions >= 10 && score === totalQuestions && !_unlockedBadges.includes('flawless')) {
    if (await unlockBadge('flawless')) unlockedNow.push('flawless');
  }

  // 4. Survivalist
  if (quizConfig.isSurvival && score >= 15 && !_unlockedBadges.includes('survivalist')) {
    if (await unlockBadge('survivalist')) unlockedNow.push('survivalist');
  }

  return unlockedNow;
};
