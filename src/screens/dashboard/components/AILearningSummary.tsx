import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';
import { useGame } from '../../../context/GameContext';
import { SafeUserStats } from '../../../utils/formatters';
import { spacing, borderRadius } from '../../../theme';

interface AILearningSummaryProps {
  onContinueLearning?: () => void;
}

export function AILearningSummary({ onContinueLearning }: AILearningSummaryProps) {
  const { colors, getAnimationDuration } = useTheme();
  const { xp, streak } = useGame();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const stats = SafeUserStats({ xp, streakDays: streak, wordsLearned: 62, dailyTargetXp: 50 });
  const weeklyProgress = 70;
  const accuracy = 87;
  const lessonsCompleted = 12;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: getAnimationDuration(500), useNativeDriver: true }),
      Animated.timing(progressAnim, { toValue: 1, duration: getAnimationDuration(1000), useNativeDriver: false }),
    ]).start();
  }, [getAnimationDuration]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', `${weeklyProgress}%`],
  });

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={[colors.primary, colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.levelLabel}>Level {stats.levelDisplay}</Text>
            <Text style={styles.xpText}>{stats.xpDisplay} XP</Text>
          </View>
          <View style={[styles.streakBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name="flame" size={14} color="#fff" />
            <Text style={styles.streakText}>{stats.streakCount}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Weekly Progress</Text>
            <Text style={styles.progressPercent}>{weeklyProgress}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.statValue}>{lessonsCompleted}</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="mic" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.statValue}>{accuracy}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="time" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.statValue}>4h</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.ctaButton} onPress={onContinueLearning} activeOpacity={0.85}>
          <Text style={[styles.ctaText, { color: colors.primary }]}>Continue Learning</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  card: {
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  levelLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: 2 },
  xpText: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.full },
  streakText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  progressSection: { gap: spacing.xs },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  progressPercent: { fontSize: 12, fontWeight: '700', color: '#fff' },
  progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#fff', borderRadius: 3 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 15, fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: 10, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },
  statDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.2)' },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#fff',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
  },
  ctaText: { fontSize: 15, fontWeight: '700' },
});
