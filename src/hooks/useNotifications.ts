import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { useGame } from '../context/GameContext';
import { api } from '../services/api';

let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch {
  // expo-notifications not installed - notifications will be no-ops
}

export function useNotifications() {
  const { streak, dailyXp, dailyGoal } = useGame();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<boolean>(false);

  useEffect(() => {
    registerForPushNotifications().then((token) => {
      if (token) setExpoPushToken(token);
    });
  }, []);

  useEffect(() => {
    if (streak > 0 && notificationPermission) {
      scheduleStreakReminder();
    }
  }, [streak, notificationPermission]);

  useEffect(() => {
    if (dailyXp >= dailyGoal && notificationPermission) {
      sendGoalAchievedNotification();
    }
  }, [dailyXp, dailyGoal, notificationPermission]);

  const registerForPushNotifications = async (): Promise<string | null> => {
    if (!Notifications) return null;
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#14B8A6',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setNotificationPermission(finalStatus === 'granted');

      if (finalStatus === 'granted') {
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        if (token) {
          await api.updateProfile({ pushToken: token });
        }
        return token;
      }

      return null;
    } catch {
      return null;
    }
  };

  const scheduleStreakReminder = async (): Promise<void> => {
    if (!Notifications) return;
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Don't lose your streak! 🔥",
          body: `You're on a ${streak}-day streak. Practice today to keep it going!`,
          data: { type: 'streak_reminder' },
        },
        trigger: {
          hour: 19,
          minute: 0,
          repeats: true,
        },
      });
    } catch {}
  };

  const scheduleDailyReminder = async (hour: number = 9, minute: number = 0): Promise<void> => {
    if (!Notifications) return;
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Time to learn Bisaya! 📚',
          body: 'A few minutes of practice today goes a long way.',
          data: { type: 'daily_reminder' },
        },
        trigger: { hour, minute, repeats: true },
      });
    } catch {}
  };

  const sendGoalAchievedNotification = async (): Promise<void> => {
    if (!Notifications) return;
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily goal achieved! 🎯',
          body: `Amazing! You've reached your ${dailyGoal} XP goal today.`,
          data: { type: 'goal_achieved' },
        },
        trigger: { seconds: 1 },
      });
    } catch {}
  };

  const cancelAllNotifications = async (): Promise<void> => {
    if (!Notifications) return;
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {}
  };

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (!Notifications) return false;
    const { status } = await Notifications.requestPermissionsAsync();
    const granted = status === 'granted';
    setNotificationPermission(granted);
    return granted;
  }, []);

  return {
    expoPushToken,
    notificationPermission,
    requestPermissions,
    scheduleStreakReminder,
    scheduleDailyReminder,
    sendGoalAchievedNotification,
    cancelAllNotifications,
  };
}
