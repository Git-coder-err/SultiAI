import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useGame } from '../../context/GameContext';
import GlassCard from '../GlassCard';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import { api } from '../../services/api';

export default function AIRecommendationCard({ onStart, navigation }) {
  const { colors, isDark } = useTheme();
  const { xp, dailyXp } = useGame();
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadRecommendation();
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

    // Pulse animation for the AI sparkle
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ]),
      { iterations: -1 }
    ).start();
  }, []);

  const loadRecommendation = async () => {
    try {
      const data = await api.getLearningAnalytics();
      setRecommendation(data.recommendation);
    } catch (e) {
      // Generate smart recommendation based on user state
      const rec = generateSmartRecommendation();
      setRecommendation(rec);
    } finally {
      setLoading(false);
    }
  };

  const generateSmartRecommendation = () => {
    // Smart logic based on user progress
    if (xp < 100) {
      return {
        type: 'beginner',
        title: 'Start with Greetings',
        description: 'Learn essential Bisaya greetings to build confidence',
        module: 'phrasebook',
        icon: 'hand-left',
        color: '#14B8A6',
        xpReward: 30,
        reason: 'Perfect for beginners - master the basics first!',
      };
    }
    if (dailyXp < 50) {
      return {
        type: 'daily',
        title: 'Complete Daily Goal',
        description: `Only ${50 - dailyXp} XP away from your daily goal`,
        module: 'daily_challenge',
        icon: 'target',
        color: '#F59E0B',
        xpReward: 50,
        reason: 'Keep your streak alive!',
      };
    }
    if (xp < 500) {
      return {
        type: 'practice',
        title: 'Practice Pronunciation',
        description: 'Improve your speaking with AI feedback',
        module: 'pronunciation',
        icon: 'mic',
        color: '#A855F7',
        xpReward: 40,
        reason: 'Pronunciation is key to being understood',
      };
    }
    return {
      type: 'advanced',
      title: 'AI Conversation Practice',
      description: 'Roleplay real scenarios with Sulti',
      module: 'ai_conversation',
      icon: 'chatbubbles',
      color: '#8B5CF6',
      xpReward: 50,
      reason: 'Take your Bisaya to the next level!',
    };
  };

  const handlePress = () => {
    if (onStart) onStart(recommendation);
    else if (navigation && recommendation) {
      const moduleRoutes = {
        phrasebook: 'Learn',
        daily_challenge: 'Tutor',
        pronunciation: 'Pronunciation',
        ai_conversation: 'Tutor',
        flashcards: 'Flashcards',
        vocabulary: 'VocabularyReview',
        voice: 'VoiceMode',
      };
      const route = moduleRoutes[recommendation.module] || 'Tutor';
      const params = recommendation.module === 'daily_challenge' ? {
        situation: 'Daily challenge practice',
        label: 'Daily Challenge',
      } : recommendation.module === 'ai_conversation' ? {
        situation: 'Roleplay conversation',
        label: 'AI Conversation',
      } : {};
      navigation.navigate(route, params);
    }
  };

  if (loading || !recommendation) {
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
          <View style={styles.skeletonBtn} />
        </GlassCard>
      </Animated.View>
    );
  }

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
        <GlassCard variant="elevated" style={styles.recCard} padding="lg">
          <View style={styles.recHeader}>
            <View style={styles.recLeft}>
              <Animated.View
                style={[
                  styles.sparkleIcon,
                  {
                    justifyContent: 'center',
                    alignItems: 'center',
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <Ionicons name="sparkles" size={20} color={recommendation.color} />
              </Animated.View>
              <Text style={[styles.recType, { color: recommendation.color }]}>AI Recommended</Text>
              <Text style={styles.recTitle}>{recommendation.title}</Text>
              <Text style={[styles.recDescription, { color: colors.textSecondary }]}>{recommendation.description}</Text>
            </View>
            <View style={styles.recRight}>
              <View style={[styles.xpReward, { backgroundColor: recommendation.color + '20', borderColor: recommendation.color + '40' }]}>
                <Ionicons name="star" size={16} color={recommendation.color} />
                <Text style={[styles.xpText, { color: recommendation.color }]}>{'+' + recommendation.xpReward} XP</Text>
              </View>
            </View>
          </View>

          <View style={[styles.recReason, { backgroundColor: recommendation.color + '10', borderColor: recommendation.color + '20' }]}>
            <Ionicons name="lightbulb" size={14} color={recommendation.color} />
            <Text style={[styles.recReasonText, { color: colors.text }]}>{recommendation.reason}</Text>
          </View>

          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: recommendation.color }]}
            onPress={handlePress}
            activeOpacity={0.8}
          >
            <Text style={styles.startBtnText}>Start Now</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
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
  recCard: {
    overflow: 'hidden',
  },
  skeletonCard: {
    minHeight: 140,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  skeletonIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  skeletonText: {
    flex: 1,
    height: 18,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  skeletonBtn: {
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: spacing.md,
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  recLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sparkleIcon: {
    width: 24,
    height: 24,
  },
  recType: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  recTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.36,
    marginBottom: spacing.xs,
  },
  recDescription: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.08,
  },
  recRight: {
    alignItems: 'flex-end',
  },
  xpReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  xpText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.26,
  },
  recReason: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  recReasonText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
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