import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';
import { useGame } from '../../../context/GameContext';
import { getLevel } from '../../../constants';
import { api } from '../../../services/api';
import { spacing, borderRadius } from '../../../theme';

interface AILearningSummaryProps {
  onContinueLearning?: () => void;
}

type ModuleProgress = {
  moduleId: number;
  completionPercent: number;
  moduleTitle: string;
  difficulty?: string;
};

type LoadState = 'loading' | 'ready' | 'empty' | 'error';

export function AILearningSummary({ onContinueLearning }: AILearningSummaryProps) {
  const { colors, getAnimationDuration } = useTheme();
  const { xp, streak } = useGame();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const [state, setState] = useState<LoadState>('loading');
  const [module, setModule] = useState<ModuleProgress | null>(null);
  const [stats, setStats] = useState({ modulesCompleted: 0, modulesStarted: 0 });

  const fetchData = async () => {
    try {
      const [progressRes, analyticsRes] = await Promise.allSettled([
        api.getLearningProgress(),
        api.getLearningAnalytics(),
      ]);

      const progressRows: ModuleProgress[] =
        progressRes.status === 'fulfilled' && Array.isArray(progressRes.value) && progressRes.value.length > 0
          ? progressRes.value.map((row: any) => ({
              moduleId: Number(row?.moduleId) || Number(row?.module_id) || 0,
              completionPercent: Math.min(100, Math.max(0, Number(row?.completionPercent) || Number(row?.completion_percent) || 0)),
              moduleTitle: String(row?.moduleTitle || row?.module_title || 'Lesson'),
              difficulty: row?.difficulty,
            }))
          : [];

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value) {
        setStats({
          modulesCompleted: Math.max(0, Number(analyticsRes.value.modules_completed) || 0),
          modulesStarted: Math.max(0, Number(analyticsRes.value.modules_started) || 0),
        });
      }

      const inProgress = progressRows.find((m) => m.completionPercent > 0 && m.completionPercent < 100);
      const best = inProgress || progressRows[progressRows.length - 1] || null;

      if (best) {
        setModule(best);
        setState('ready');
      } else {
        setModule(null);
        setState(progressRows.length > 0 ? 'ready' : 'empty');
      }
    } catch {
      setState('error');
    }
  };

  const retry = () => {
    setState('loading');
    fetchData();
  };

  useEffect(() => {
    fetchData();
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: getAnimationDuration(500), useNativeDriver: true }),
      Animated.timing(progressAnim, { toValue: 1, duration: getAnimationDuration(900), useNativeDriver: false }),
    ]).start();
  }, [getAnimationDuration]);

  const level = getLevel(Math.max(0, Number(xp) || 0));
  const xpDisplay = Math.max(0, Number(xp) || 0).toLocaleString();
  const nextDisplay = Math.max(1, Number(level.nextLevelXp) || 1000).toLocaleString();
  const levelProgressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', `${Math.min(100, Math.max(0, level.progress))}%`],
  });

  const modulePercent = module ? Math.min(100, Math.max(0, Number(module.completionPercent) || 0)) : 0;
  const moduleWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', `${modulePercent}%`],
  });
  const remainingHint = `${Math.max(0, 100 - modulePercent)}% remaining to finish this lesson`;

  const renderBody = () => {
    if (state === 'loading') {
      return (
        <View style={styles.skeletonBox}>
          <View style={[styles.skeletonBar, { backgroundColor: 'rgba(255,255,255,0.25)' }]} />
          <View style={[styles.skeletonBarWide, { backgroundColor: 'rgba(255,255,255,0.18)' }]} />
        </View>
      );
    }

    if (state === 'error') {
      return (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>Couldn&apos;t load your progress</Text>
          <Text style={styles.stateText}>Please check your connection and try again.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={retry} activeOpacity={0.85} accessibilityRole="button">
            <Ionicons name="refresh" size={14} color="#fff" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              {state === 'empty' ? 'YOUR FIRST STEP' : 'LESSON PROGRESS'}
            </Text>
            {state === 'ready' && <Text style={styles.progressPercent}>{modulePercent}%</Text>}
          </View>

          {state === 'empty' ? (
            <Text style={styles.emptyTitle}>Start your first lesson</Text>
          ) : (
            <Text style={styles.moduleTitle} numberOfLines={1}>
              {module?.moduleTitle || 'Continue Learning'}
            </Text>
          )}

          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, { width: state === 'ready' ? moduleWidth : '0%' }]} />
          </View>

          <Text style={styles.progressHint}>
            {state === 'empty'
              ? 'Begin learning your first Bisaya phrases today.'
              : remainingHint}
          </Text>
        </View>

        {state === 'ready' && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statValue}>{stats.modulesCompleted}</Text>
              <Text style={styles.statLabel}>Done</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="layers" size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statValue}>{stats.modulesStarted}</Text>
              <Text style={styles.statLabel}>Started</Text>
            </View>
          </View>
        )}
      </>
    );
  };

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={[colors.gradientA, colors.gradientB]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
        accessibilityLabel="Continue Learning"
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>CONTINUE LEARNING</Text>
            <View style={styles.levelRow}>
              <Text style={styles.levelLabel}>LEVEL {level.level}</Text>
              <View style={[styles.streakBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Ionicons name="flame" size={14} color="#fff" />
                <Text style={styles.streakText}>{Math.max(0, streak)}</Text>
              </View>
            </View>
          </View>
        </View>

        {renderBody()}

        <View style={styles.xpSection}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpLabel}>PROGRESS TO LEVEL {level.level + 1}</Text>
            <Text style={styles.xpNumbers}>
              {xpDisplay} / {nextDisplay} XP
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, { width: levelProgressWidth }]} />
          </View>
        </View>

        {state === 'error' ? (
          <TouchableOpacity style={styles.ctaButton} onPress={retry} activeOpacity={0.85} accessibilityRole="button">
            <Ionicons name="refresh" size={16} color={colors.primary} />
            <Text style={[styles.ctaText, { color: colors.primary }]}>Retry</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={onContinueLearning}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Text style={[styles.ctaText, { color: colors.primary }]}>
              {state === 'empty' ? 'Start Learning' : modulePercent >= 100 ? 'Review Lesson' : 'Resume Lesson'}
            </Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
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
  headerText: { flex: 1 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: 'rgba(255,255,255,0.75)', marginBottom: 4 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  levelLabel: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.4 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.full },
  streakText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  progressSection: { gap: spacing.xs },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  progressPercent: { fontSize: 12, fontWeight: '700', color: '#fff' },
  moduleTitle: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: -0.2 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: -0.2 },
  progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#fff', borderRadius: 3 },
  progressHint: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.8)' },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 15, fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: 10, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },
  statDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.2)' },
  xpSection: { gap: spacing.xs },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  xpLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  xpNumbers: { fontSize: 12, fontWeight: '700', color: '#fff' },
  skeletonBox: { gap: spacing.sm, paddingVertical: spacing.xs },
  skeletonBar: { height: 18, borderRadius: 8 },
  skeletonBarWide: { height: 8, borderRadius: 4 },
  stateBox: { gap: spacing.sm, paddingVertical: spacing.xs },
  stateTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  stateText: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.8)' },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  retryText: { fontSize: 13, fontWeight: '700', color: '#fff' },
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