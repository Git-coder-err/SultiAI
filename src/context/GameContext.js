import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const GameContext = createContext(null);

const STREAK_KEY = 'sultiai_streak';
const XP_KEY = 'sultiai_xp';
const COINS_KEY = 'sultiai_coins';
const HEARTS_KEY = 'sultiai_hearts';
const DAILY_GOAL_KEY = 'sultiai_daily_goal';
const BADGES_KEY = 'sultiai_badges';
const ACHIEVEMENTS_KEY = 'sultiai_achievements';
const LAST_ACTIVE_KEY = 'sultiai_last_active';

export function GameProvider({ children }) {
  const [xp, setXp] = useState(0);
  const [coins, setCoins] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [streak, setStreak] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(50);
  const [dailyXp, setDailyXp] = useState(0);
  const [badges, setBadges] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [lastActive, setLastActive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGameState();
  }, []);

  useEffect(() => {
    checkStreak();
  }, [lastActive]);

  const loadGameState = async () => {
    try {
      const [xpVal, coinsVal, heartsVal, streakVal, dailyGoalVal, badgesVal, achievementsVal, lastActiveVal] =
        await Promise.all([
          AsyncStorage.getItem(XP_KEY),
          AsyncStorage.getItem(COINS_KEY),
          AsyncStorage.getItem(HEARTS_KEY),
          AsyncStorage.getItem(STREAK_KEY),
          AsyncStorage.getItem(DAILY_GOAL_KEY),
          AsyncStorage.getItem(BADGES_KEY),
          AsyncStorage.getItem(ACHIEVEMENTS_KEY),
          AsyncStorage.getItem(LAST_ACTIVE_KEY),
        ]);
      if (xpVal) setXp(parseInt(xpVal, 10));
      if (coinsVal) setCoins(parseInt(coinsVal, 10));
      if (heartsVal) setHearts(parseInt(heartsVal, 10));
      if (streakVal) setStreak(parseInt(streakVal, 10));
      if (dailyGoalVal) setDailyGoal(parseInt(dailyGoalVal, 10));
      if (badgesVal) setBadges(JSON.parse(badgesVal));
      if (achievementsVal) setAchievements(JSON.parse(achievementsVal));
      if (lastActiveVal) setLastActive(lastActiveVal);
    } catch {} finally {
      setLoading(false);
    }
  };

  const checkStreak = () => {
    if (!lastActive) return;
    const last = new Date(lastActive);
    const today = new Date();
    const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return;
    if (diffDays === 1) {
      setStreak((s) => s + 1);
      AsyncStorage.setItem(STREAK_KEY, String(streak + 1));
    } else if (diffDays > 1) {
      setStreak(0);
      AsyncStorage.setItem(STREAK_KEY, '0');
    }
    setLastActive(today.toISOString());
    AsyncStorage.setItem(LAST_ACTIVE_KEY, today.toISOString());
  };

  const addXp = async (amount, source) => {
    const newXp = xp + amount;
    setXp(newXp);
    setDailyXp((d) => d + amount);
    await AsyncStorage.setItem(XP_KEY, String(newXp));
    const today = new Date().toISOString();
    setLastActive(today);
    await AsyncStorage.setItem(LAST_ACTIVE_KEY, today);
    checkAchievements({ xp: newXp, source });
    syncToServer({ xp: newXp });
  };

  const addCoins = async (amount) => {
    const newCoins = coins + amount;
    setCoins(newCoins);
    await AsyncStorage.setItem(COINS_KEY, String(newCoins));
  };

  const spendCoins = async (amount) => {
    if (coins < amount) return false;
    const newCoins = coins - amount;
    setCoins(newCoins);
    await AsyncStorage.setItem(COINS_KEY, String(newCoins));
    return true;
  };

  const useHeart = async () => {
    if (hearts <= 0) return false;
    const newHearts = hearts - 1;
    setHearts(newHearts);
    await AsyncStorage.setItem(HEARTS_KEY, String(newHearts));
    return true;
  };

  const refillHearts = async (amount = 5) => {
    setHearts(amount);
    await AsyncStorage.setItem(HEARTS_KEY, String(amount));
  };

  const addBadge = async (badge) => {
    if (badges.find((b) => b.id === badge.id)) return;
    const newBadges = [...badges, { ...badge, earnedAt: new Date().toISOString() }];
    setBadges(newBadges);
    await AsyncStorage.setItem(BADGES_KEY, JSON.stringify(newBadges));
  };

  const addAchievement = async (achievement) => {
    if (achievements.find((a) => a.id === achievement.id)) return;
    const newAchievements = [...achievements, { ...achievement, earnedAt: new Date().toISOString() }];
    setAchievements(newAchievements);
    await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(newAchievements));
    addCoins(achievement.coinReward || 50);
    addXp(achievement.xpReward || 100, 'achievement');
  };

  const checkAchievements = async ({ xp: currentXp, source }) => {
    if (currentXp >= 100) addAchievement({ id: 'first_100_xp', title: 'First Steps', description: 'Earn 100 XP', icon: 'star', xpReward: 50, coinReward: 20 });
    if (currentXp >= 1000) addAchievement({ id: 'thousand_xp', title: 'Century', description: 'Earn 1,000 XP', icon: 'trophy', xpReward: 200, coinReward: 100 });
    if (currentXp >= 5000) addAchievement({ id: 'five_thousand_xp', title: 'Dedicated', description: 'Earn 5,000 XP', icon: 'diamond', xpReward: 500, coinReward: 250 });
    if (streak >= 3) addAchievement({ id: 'streak_3', title: 'Getting Started', description: '3-day streak', icon: 'sparkles', xpReward: 50, coinReward: 30 });
    if (streak >= 7) addAchievement({ id: 'streak_7', title: 'Consistent', description: '7-day streak', icon: 'calendar', xpReward: 100, coinReward: 50 });
    if (streak >= 30) addAchievement({ id: 'streak_30', title: 'Unstoppable', description: '30-day streak', icon: 'crown', xpReward: 500, coinReward: 200 });
    if (source === 'lesson' && dailyXp >= dailyGoal) addAchievement({ id: 'daily_goal', title: 'Goal Crusher', description: 'Reach daily goal', icon: 'target', xpReward: 50, coinReward: 25 });
    try {
      await api.checkAchievements({ xp: currentXp, streak, dailyXp, dailyGoal });
    } catch {}
  };

  const syncToServer = async (data) => {
    try {
      await api.updateGameStats(data);
    } catch {}
  };

  const resetDaily = () => {
    setDailyXp(0);
  };

  return (
    <GameContext.Provider
      value={{
        xp, coins, hearts, streak, dailyGoal, dailyXp, badges, achievements, loading,
        addXp, addCoins, spendCoins, useHeart, refillHearts,
        addBadge, addAchievement, setDailyGoal, resetDaily, checkStreak,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
