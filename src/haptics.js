import * as Haptics from 'expo-haptics';
import useAppStore from './store/useAppStore';

export const hapticTap = async () => {
  if (useAppStore.getState().hapticsEnabled) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

export const hapticWrong = async () => {
  if (useAppStore.getState().hapticsEnabled) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }
};

export const hapticFinish = async () => {
  if (useAppStore.getState().hapticsEnabled) {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
};
