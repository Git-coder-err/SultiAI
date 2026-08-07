import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from '../GlassCard';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import { api } from '../../services/api';

const DIFFICULTY_STARS = {
  1: '⭐',
  2: '⭐⭐',
  3: '⭐⭐⭐',
  4: '⭐⭐⭐⭐',
  5: '⭐⭐⭐⭐⭐',
};

export default function DailyChallengeCard({ onStart, navigation }) {
  const { colors, isDark } = useTheme();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    loadChallenge();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 10,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadChallenge = async () => {
    try {
      const data = await api.getDailyChallenge();
      setChallenge(data);
    } catch (e) {
      // Fallback mock data
      setChallenge({
        id: 'daily_1',
        title: 'Ride a Jeepney',
        scenario: 'Commuting via jeepney and tricycle',
        difficulty: 2,
        durationMinutes: 5,
        xpReward: 50,
        phrases: 8,
        icon: 'bus',
        color: '#3B82F6',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePress = () => {
    if (onStart) onStart(challenge);
    else if (navigation && challenge) {
      navigation.navigate('SULTI', {
        situation: challenge.scenario,
        label: challenge.title,
      });
    }
  };

  if (loading) {
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <GlassCard variant="elevated" style={styles.skeletonCard} padding="lg">
          <View style={styles.skeletonRow}>
            <View style={styles.skeletonIcon} />
            <View style={styles.skeletonText} />
          </View>
          <View style={styles.skeletonRow}>
            <View style={styles.skeletonBar} />
            <View style={styles.skeletonBarShort} />
          </View>
          <View style={styles.skeletonBtn} />
        </GlassCard>
      </Animated.View>
    );
  }

  if (!challenge) return null;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <GlassCard variant="elevated" style={styles.challengeCard} padding="lg">
          <View style={styles.challengeHeader}>
            <View style={styles.challengeLeft}>
              <LinearGradient
                colors={[challenge.color, challenge.color + 'CC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.challengeIcon}
              >
                <Ionicons name={challenge.icon} size={24} color="#fff" />
              </LinearGradient>
              <View style={styles.challengeInfo}>
                <View style={styles.badgeRow}>
                  <View style={[styles.challengeBadge, { backgroundColor: challenge.color + '20' }]}>
                    <Text style={[styles.challengeBadgeText, { color: challenge.color }]}>Daily Challenge</Text>
                  </View>
                </View>
                <Text style={styles.challengeTitle}>{challenge.title}</Text>
                <Text style={[styles.challengeScenario, { color: colors.textSecondary }]}>{challenge.scenario}</Text>
              </View>
            </View>
            <View style={styles.challengeRight}>
              <View style={styles.xpReward}>
                <Ionicons name="star" size={16} color={colors.accent} />
                <Text style={[styles.xpText, { color: colors.accent }]}>{'+' + challenge.xpReward} XP</Text>
              </View>
            </View>
          </View>

          <View style={styles.challengeMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="timer-outline" size={14} color={colors.textLight} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>{challenge.durationMinutes} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="layers-outline" size={14} color={colors.textLight} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>{challenge.phrases} phrases</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>{DIFFICULTY_STARS[challenge.difficulty] || DIFFICULTY_STARS[2]}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: challenge.color }]}
            onPress={handlePress}
            activeOpacity={0.8}
          >
            <Text style={styles.startBtnText}>Start Challenge</Text>
            <Ionicons name="play" size={16} color="#fff" />
          </TouchableOpacity>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  touchable: {
    marginBottom: spacing.md,
  },
  challengeCard: {
    overflow: 'hidden',
  },
  skeletonCard: {
    minHeight: 160,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  skeletonIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  skeletonText: {
    flex: 1,
    height: 20,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  skeletonBar: {
    flex: 1,
    height: 14,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: spacing.md,
  },
  skeletonBarShort: {
    width: 80,
    height: 14,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  skeletonBtn: {
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: spacing.md,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  challengeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  challengeIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  challengeInfo: {
    flex: 1,
  },
  badgeRow: {
    marginBottom: spacing.xs,
  },
  challengeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  challengeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.36,
    marginBottom: 2,
  },
  challengeScenario: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.08,
  },
  challengeRight: {
    alignItems: 'flex-end',
  },
  xpReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  xpText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.26,
  },
  challengeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    ...shadows.md,
  },
  startBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.14,
  },
});

export { DailyChallengeCard };