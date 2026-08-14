import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';
import { useGame } from '../../../context/GameContext';
import { spacing, borderRadius } from '../../../theme';

interface TodayMissionProps {
  onStart?: () => void;
}

const DAILY_TARGETS = [
  { label: 'Learn 10 new Bisaya words', count: 10 },
  { label: 'Practice 10 phrases with SULTI', count: 10 },
  { label: 'Master 8 new words today', count: 8 },
  { label: 'Speak 12 words out loud', count: 12 },
];

export function TodayMission({ onStart }: TodayMissionProps) {
  const { colors, getAnimationDuration } = useTheme();
  const { dailyXp, dailyGoal } = useGame();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const target = DAILY_TARGETS[new Date().getDate() % DAILY_TARGETS.length];
  const goal = dailyGoal > 0 ? dailyGoal : 50;
  const earned = Math.min(dailyXp, goal);
  const progress = Math.round((earned / goal) * 100);
  const remaining = Math.max(goal - earned, 0);
  const done = earned >= goal;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: getAnimationDuration(500), useNativeDriver: true }),
      Animated.timing(progressAnim, { toValue: 1, duration: getAnimationDuration(800), useNativeDriver: false }),
    ]).start();
  }, [getAnimationDuration]);

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${progress}%`] });

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={done ? [colors.success, colors.gradientB] : [colors.gradientA, colors.gradientB]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>TODAY&apos;S GOAL</Text>
            <Text style={styles.title}>{done ? 'Goal complete! Great job!' : target.label}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name="trophy" size={14} color="#fff" />
          </View>
        </View>

        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{done ? 'All done for today' : `${remaining} to go`}</Text>
          <Text style={styles.progressPercent}>
            {earned}/{goal}
          </Text>
        </View>

        <View style={styles.progressBarBg}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>

        {!done && (
          <TouchableOpacity style={styles.ctaButton} onPress={onStart} activeOpacity={0.85}>
            <Text style={[styles.ctaText, { color: colors.primary }]}>Keep Going</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  card: { borderRadius: borderRadius.xxl, padding: spacing.xl, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  headerText: { flex: 1 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  title: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  badge: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  progressPercent: { fontSize: 12, fontWeight: '700', color: '#fff' },
  progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#fff', borderRadius: 4 },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#fff',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    marginTop: spacing.xs,
  },
  ctaText: { fontSize: 14, fontWeight: '700' },
});