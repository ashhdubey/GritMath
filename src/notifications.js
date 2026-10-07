import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
};

export const scheduleDailyReminder = async (timeStr) => {
  // Clear any existing reminders first
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6C5CE7',
    });
  }

  // timeStr is format "20:00"
  const [hour, minute] = timeStr.split(':').map(Number);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Keep your GritMath streak alive! 🔥",
      body: "Just 5 minutes of practice a day keeps the rust away. Tap to train!",
      sound: true,
      vibrate: [0, 250, 250, 250],
      color: '#6C5CE7',
    },
    trigger: {
      hour,
      minute,
      repeats: true,
      channelId: 'default',
    },
  });
};

export const cancelAllReminders = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
