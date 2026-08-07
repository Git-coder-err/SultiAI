import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../context/ThemeContext';
import { useGame } from '../../../context/GameContext';
import { api } from '../../../services/api';
import { spacing, borderRadius } from '../../../theme';

const DAILY_REWARD_KEY = 'sultiai_daily_reward_date';

export function DailyRewardCard() {
  const { colors, getAnimationDuration } = useTheme();
  const { addXp, addCoins } = useGame();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: getAnimationDuration(600), useNativeDriver: true }).start();
    (async () => {
      try {
        const last = await AsyncStorage.getItem(DAILY_REWARD_KEY);
        const today = new Date().toDateString();
        setClaimed(last === today);
      } catch {}
    })();
  }, [getAnimationDuration]);

  const handleClaim = async () => {
    if (claiming || claimed) return;
    setClaiming(true);
    try {
      const data = await api.claimDailyReward();
      const reward = data?.reward || {};
      const xpAmount = Number(reward.xp) || 25;
      const coinAmount = Number(reward.coins) || 20;
      if (xpAmount > 0) addXp(xpAmount, 'daily_reward');
      if (coinAmount > 0) addCoins(coinAmount);
      setClaimed(true);
      try {
        await AsyncStorage.setItem(DAILY_REWARD_KEY, new Date().toDateString());
      } catch {}
    } catch {
      addXp(25, 'daily_reward');
      addCoins(20);
      setClaimed(true);
      try {
        await AsyncStorage.setItem(DAILY_REWARD_KEY, new Date().toDateString());
      } catch {}
    } finally {
      setClaiming(false);
    }
  };

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={claimed ? ['#475569', '#334155'] : ['#F59E0B', '#EA580C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={[styles.giftIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <Ionicons name={claimed ? 'checkmark' : 'gift'} size={22} color="#fff" />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{claimed ? 'Daily Reward Claimed' : 'Daily Reward'}</Text>
          <Text style={styles.subtitle}>
            {claimed ? 'Come back tomorrow for more!' : 'Claim 25 XP + 20 coins today'}
          </Text>
        </View>
        {!claimed && (
          <TouchableOpacity
            style={styles.claimBtn}
            onPress={handleClaim}
            disabled={claiming}
            activeOpacity={0.85}
          >
            <Text style={styles.claimText}>{claiming ? '...' : 'Claim'}</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  giftIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  title: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },
  subtitle: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  claimBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  claimText: { fontSize: 13, fontWeight: '800', color: '#EA580C' },
});
