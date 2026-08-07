import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, useAnimatedProps,
  withTiming, withDelay, withRepeat,
  FadeInRight, Easing, interpolate,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { XP_VALUES } from '../constants';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { SafeUserStats } from '../utils/formatters';
import { api } from '../services/api';
import { offline } from '../services/offline';
import { hapticTap } from '../utils/haptics';
import ModuleCard from '../components/learning/ModuleCard';
// eslint-disable-next-line import/no-named-as-default
import DailyChallengeCard from '../components/learning/DailyChallengeCard';
import AIRecommendationCard from '../components/learning/AIRecommendationCard';
import AuroraBackground from '../components/AuroraBackground';
import { spacing, borderRadius, shadows } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const QUOTES = [
  { text: 'Angay kaayo mag-sugod ug karon!', english: 'Start today!' },
  { text: 'Matag adlaw usa ka lakang.', english: 'Every day is one step.' },
  { text: 'Ang kalamboan magsugod sa gamay.', english: 'Progress starts small.' },
  { text: 'Padayon lang, dili lang ni hilabihan.', english: 'Keep going, this too shall pass.' },
  { text: 'Ang langgam dili mokusog pinaagi sa pagsalig.', english: 'The bird flies by trusting its wings.' },
  { text: 'Kusog ang Bisaya kung mag-istorya.', english: 'Bisaya shines when spoken.' },
];

const MODULES = [
  {
    id: 'voice_practice',
    title: 'Voice Practice',
    description: 'Speak with SULTI voice',
    iconName: 'mic',
    gradient: ['#14B8A6', '#0D9488'],
    route: 'VoiceMode',
    progress: 65,
    count: 'Speak',
  },
  {
    id: 'scenario_practice',
    title: 'Scenario Practice',
    description: 'Roleplay real situations',
    iconName: 'chatbubbles',
    gradient: ['#3B82F6', '#2563EB'],
    route: 'ScenarioPractice',
    progress: 40,
    count: 'Scenarios',
  },
  {
    id: 'phrasebook',
    title: 'Phrasebook',
    description: 'Essential Bisaya phrases',
    iconName: 'book',
    gradient: ['#8B5CF6', '#7C3AED'],
    route: 'Phrasebook',
    progress: 55,
    count: 'Phrases',
  },
  {
    id: 'flashcards',
    title: 'Flashcards',
    description: 'Review saved phrases',
    iconName: 'layers',
    gradient: ['#F59E0B', '#F97316'],
    route: 'Flashcards',
    progress: 48,
    count: 'Cards',
  },
  {
    id: 'pronunciation_lab',
    title: 'Pronunciation Lab',
    description: 'Check speech accuracy',
    iconName: 'mic-circle',
    gradient: ['#EC4899', '#DB2777'],
    route: 'Pronunciation',
    progress: 92,
    count: '92% avg',
  },
  {
    id: 'grammar',
    title: 'Grammar',
    description: 'Cebuano sentence structure',
    iconName: 'school',
    gradient: ['#6366F1', '#4F46E5'],
    route: 'Grammar',
    progress: 35,
    count: 'Rules',
  },
  {
    id: 'vocabulary_notebook',
    title: 'Vocabulary Notebook',
    description: 'Master your word bank',
    iconName: 'bookmark',
    gradient: ['#10B981', '#059669'],
    route: 'VocabularyReview',
    progress: 60,
    count: 'Words',
  },
  {
    id: 'listening',
    title: 'Listening',
    description: 'Train your ear for Bisaya',
    iconName: 'ear',
    gradient: ['#F97316', '#EA580C'],
    route: 'Listening',
    progress: 42,
    count: 'Listen',
  },
  {
    id: 'writing',
    title: 'Writing',
    description: 'Compose with confidence',
    iconName: 'create',
    gradient: ['#EC4899', '#DB2777'],
    route: 'Writing',
    progress: 28,
    count: 'Prompts',
  },
  {
    id: 'reading',
    title: 'Reading',
    description: 'Read & understand Bisaya',
    iconName: 'book-outline',
    gradient: ['#06B6D4', '#0891B2'],
    route: 'Reading',
    progress: 33,
    count: 'Stories',
  },
  {
    id: 'sulti_switch',
    title: 'Sulti Switch',
    description: 'Bilingual thinking mode',
    iconName: 'swap-horizontal',
    gradient: ['#0EA5E9', '#0284C7'],
    route: 'SultiSwitch',
    progress: 25,
    count: 'Switch',
  },
  {
    id: 'culture_notes',
    title: 'Culture Notes',
    description: 'Understand Cebuano life',
    iconName: 'compass',
    gradient: ['#10B981', '#059669'],
    route: 'CultureNotes',
    progress: 20,
    count: 'Facts',
  },
  {
    id: 'review_center',
    title: 'Review Center',
    description: 'Reinforce what you learned',
    iconName: 'refresh',
    gradient: ['#F43F5E', '#E11D48'],
    route: 'ReviewCenter',
    progress: 50,
    count: 'Quiz',
    badge: 'NEW',
    badgeColor: '#F43F5E',
  },
];

const CATEGORIES = [
  { name: 'Market', icon: 'storefront', count: 12, color: '#14B8A6' },
  { name: 'Transportation', icon: 'bus', count: 8, color: '#3B82F6' },
  { name: 'Restaurant', icon: 'restaurant', count: 10, color: '#F59E0B' },
  { name: 'Hospital', icon: 'medkit', count: 5, color: '#EF4444' },
  { name: 'School', icon: 'school', count: 7, color: '#8B5CF6' },
  { name: 'Workplace', icon: 'briefcase', count: 6, color: '#6366F1' },
  { name: 'Hotel', icon: 'bed', count: 4, color: '#06B6D4' },
  { name: 'Emergency', icon: 'warning', count: 3, color: '#FF6B6B' },
  { name: 'Community', icon: 'home', count: 9, color: '#10B981' },
  { name: 'Small Talk', icon: 'chatbubble-ellipses', count: 11, color: '#EC4899' },
  { name: 'Dating', icon: 'heart', count: 3, color: '#F43F5E' },
  { name: 'Festivals', icon: 'gift', count: 6, color: '#8B5CF6' },
];

function getDailyQuote() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}

function CircularProgress({ progress, size = 64, strokeWidth = 5, color, label, value, delay = 0 }) {
  const { colors } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressValue = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withDelay(delay, withTiming(Math.max(0.05, progress / 100), { duration: 1000 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDasharray: `${circumference * progressValue.value} ${circumference}`,
  }));

  return (
    <View style={styles.progressRing}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.border} strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" animatedProps={animatedProps} />
      </Svg>
      <Text style={[styles.progressRingValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.progressRingLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function ShimmerBar({ progress, color }) {
  const shimmer = useSharedValue(0);
  const barWidth = (SCREEN_WIDTH - 80) / 3;

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      -1, false,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-barWidth, barWidth]) }],
    opacity: 0.4,
  }));

  return (
    <View style={[styles.shimmerTrack, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
      <View style={[styles.shimmerFill, { width: `${progress}%`, backgroundColor: 'rgba(255,255,255,0.9)' }]} />
      {progress > 0 && progress < 100 && (
        <Animated.View style={[styles.shimmerOverlay, { width: '30%', backgroundColor: color || '#fff' }, shimmerStyle]} />
      )}
    </View>
  );
}

export default function LearnScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { xp, dailyXp, streak, dailyGoal, addXp, user } = useGame();
  const { enqueueAction } = useOfflineSync();
  const [wordsLearned, setWordsLearned] = useState(0);
  const [voiceSessionActive, setVoiceSessionActive] = useState(false);
  const [notifCount] = useState(3);

  const quote = useMemo(() => getDailyQuote(), []);

  const stats = useMemo(() => SafeUserStats({
    xp,
    dailyTargetXp: dailyGoal,
    dailyXp,
    wordsLearned,
    streakDays: streak,
  }), [xp, dailyXp, dailyGoal, wordsLearned, streak]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cached = await offline.getCachedVocabulary();
        if (!cancelled && Array.isArray(cached) && cached.length) setWordsLearned(cached.length);
      } catch {}
      try {
        const data = await api.getSavedPhrases();
        if (!cancelled && Array.isArray(data) && data.length) setWordsLearned(data.length);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  const handleVoiceSession = () => {
    hapticTap();
    setVoiceSessionActive(true);
    addXp(XP_VALUES.VOICE_PRACTICE_LEARN, 'voice_practice');
    enqueueAction({
      endpoint: '/api/game/stats',
      method: 'PUT',
      payload: { xp: (xp || 0) + XP_VALUES.VOICE_PRACTICE_LEARN },
    });
    navigation.navigate('VoiceMode');
    setTimeout(() => setVoiceSessionActive(false), 3000);
  };

  const handleModulePress = (module) => {
    hapticTap();
    navigation.navigate(module.route, module.params);
  };

  const handleCategoryPress = (category) => {
    hapticTap();
    navigation.navigate('Phrasebook', { category: category.name });
  };

  const handleDailyChallengeStart = (challenge) => {
    if (challenge) {
      navigation.navigate('SULTI', { situation: challenge.scenario, label: challenge.title });
    }
  };

  const handleAIRecommendation = (recommendation) => {
    const moduleRoutes = {
      phrasebook: 'Learn', daily_challenge: 'Tutor', pronunciation: 'Pronunciation',
      ai_conversation: 'Tutor', flashcards: 'Flashcards', vocabulary: 'VocabularyReview', voice: 'VoiceMode',
    };
    const route = moduleRoutes[recommendation.module] || 'Tutor';
    const params = recommendation.module === 'daily_challenge'
      ? { situation: 'Daily challenge practice', label: 'Daily Challenge' }
      : recommendation.module === 'ai_conversation'
        ? { situation: 'Roleplay conversation', label: 'AI Conversation' }
        : {};
    navigation.navigate(route, params);
  };

  const userName = user?.name || user?.displayName || 'Learner';

  return (
    <AuroraBackground style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View entering={FadeInRight.duration(500)} style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>Kumusta,</Text>
            <Text style={[styles.userName, { color: colors.text }]}>{userName}!</Text>
            <View style={[styles.aiBadge, { backgroundColor: colors.accent + '20' }]}>
              <Ionicons name="sparkles" size={12} color={colors.accent} />
              <Text style={[styles.aiBadgeText, { color: colors.accent }]}>AI-Powered</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.notifBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : colors.surfaceSecondary }]}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={notifCount > 0 ? `${notifCount} unread notifications` : 'Notifications'}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            {notifCount > 0 && (
              <View style={[styles.notifBadge, { backgroundColor: colors.error }]}>
                <Text style={[styles.notifBadgeText, { color: '#fff' }]}>{notifCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Motif Quote */}
        <Animated.View entering={FadeInRight.delay(100).duration(500)}>
          <View style={[styles.quoteCard, { backgroundColor: colors.accent + '10', borderColor: colors.accent + '20' }]}>
            <Ionicons name="bulb-outline" size={18} color={colors.accent} />
            <View style={styles.quoteTextWrap}>
              <Text style={[styles.quoteText, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>{quote.text}</Text>
              <Text style={[styles.quoteEnglish, { color: isDark ? '#94A3B8' : '#64748B' }]}>{quote.english}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Progress Rings */}
        <Animated.View entering={FadeInRight.delay(200).duration(500)} style={styles.progressRow}>
          <CircularProgress progress={stats.dailyProgress} color={colors.accent} label="TODAY" value={stats.targetDisplay} delay={300} />
          <CircularProgress progress={stats.weeklyProgress} color={colors.warning} label="WEEKLY" value={`${stats.weeklyProgress}%`} delay={450} />
          <CircularProgress progress={stats.pronunciationScore} color={colors.secondary} label="PRONUNCIATION" value={`${stats.pronunciationScore}%`} delay={600} />
        </Animated.View>

        {/* XP Shimmer Bar */}
        <Animated.View entering={FadeInRight.delay(300).duration(500)} style={styles.shimmerSection}>
          <View style={styles.shimmerHeader}>
            <Text style={[styles.shimmerLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Daily XP Progress</Text>
            <Text style={[styles.shimmerValue, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>{stats.dailyProgress}%</Text>
          </View>
          <ShimmerBar progress={stats.dailyProgress} color={isDark ? '#2DD4BF' : '#14B8A6'} />
        </Animated.View>

        {/* Voice Practice + Daily Challenge - Stacked vertically to prevent overlap */}
        <Animated.View entering={FadeInRight.delay(400).duration(500)} style={styles.cardsFeed}>
          {/* Talk with SULTI Banner Card */}
          <TouchableOpacity style={[styles.bannerCard, { backgroundColor: colors.primary }]} onPress={handleVoiceSession} activeOpacity={0.9}>
            <View style={styles.bannerCardBadge}>
              <Text style={styles.bannerCardBadgeText}>NEW</Text>
            </View>
            <View style={styles.bannerCardContent}>
              <Text style={styles.bannerCardTitle}>Talk with SULTI</Text>
              <Text style={styles.bannerCardDesc}>Practice speaking Bisaya naturally with AI-powered voice recognition</Text>
            </View>
            <TouchableOpacity style={[styles.bannerBtn, voiceSessionActive && styles.bannerBtnActive]} onPress={handleVoiceSession} activeOpacity={0.85}>
              <View style={styles.bannerBtnContent}>
                {voiceSessionActive ? (
                  <>
                    <View style={styles.listeningDot} />
                    <Text style={styles.bannerBtnTextActive}>Listening...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="mic" size={18} color={isDark ? '#0F172A' : '#FFFFFF'} />
                    <Text style={[styles.bannerBtnText, { color: isDark ? '#0F172A' : '#FFFFFF' }]}>Start Voice Session</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Daily Challenge Card */}
          <DailyChallengeCard onStart={handleDailyChallengeStart} navigation={navigation} />
        </Animated.View>

        {/* AI Recommendation */}
        <Animated.View entering={FadeInRight.delay(500).duration(500)}>
          <AIRecommendationCard onStart={handleAIRecommendation} navigation={navigation} />
        </Animated.View>

        {/* Learning Modules */}
        <Animated.View entering={FadeInRight.delay(600).duration(500)}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>Learning Modules</Text>
          <View style={styles.modulesGrid}>
            {MODULES.map((module, index) => (
              <ModuleCard
                key={module.id}
                title={module.title}
                description={module.description}
                iconName={module.iconName}
                gradient={module.gradient}
                index={index}
                badge={module.badge}
                badgeColor={module.badgeColor}
                onPress={() => handleModulePress(module)}
              />
            ))}
          </View>
        </Animated.View>

        {/* Categories */}
        <Animated.View entering={FadeInRight.delay(700).duration(500)} style={styles.categoriesSection}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.name}
                style={[styles.categoryChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.7}
              >
                <Ionicons name={category.icon} size={20} color={category.color} />
                <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
                <View style={[styles.categoryCount, { backgroundColor: colors.surfaceSecondary }]}>
                  <Text style={[styles.categoryCountText, { color: colors.textSecondary }]}>{category.count}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100, flexGrow: 1, padding: spacing.xl, paddingTop: spacing.sm },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 14, fontWeight: '500', marginBottom: 2 },
  userName: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginBottom: spacing.xs },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  aiBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  notifBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  notifBadge: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center' },
  notifBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },

  quoteCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1, marginBottom: spacing.lg, gap: spacing.md },
  quoteTextWrap: { flex: 1 },
  quoteText: { fontSize: 14, fontWeight: '700', lineHeight: 20 },
  quoteEnglish: { fontSize: 12, marginTop: 2 },

  progressRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.lg },
  progressRing: { alignItems: 'center', gap: 4 },
  progressRingValue: { fontSize: 11, fontWeight: '800', textAlign: 'center', maxWidth: 70 },
  progressRingLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },

  shimmerSection: { marginBottom: spacing.lg },
  shimmerHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  shimmerLabel: { fontSize: 12, fontWeight: '600' },
  shimmerValue: { fontSize: 12, fontWeight: '800' },
  shimmerTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  shimmerFill: { height: '100%', borderRadius: 3, position: 'absolute', top: 0, left: 0 },
  shimmerOverlay: { height: '100%', borderRadius: 3, position: 'absolute', top: 0 },

  mainGrid: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  voiceCard: { flex: 2, borderRadius: borderRadius.xl, padding: spacing.lg, minHeight: 200 },
  voiceCardBadge: { alignSelf: 'flex-start', backgroundColor: '#10B981', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, marginBottom: spacing.sm },
  voiceCardBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  voiceCardTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: spacing.xs },
  voiceCardDesc: { fontSize: 13, lineHeight: 18, color: 'rgba(255,255,255,0.7)', marginBottom: spacing.md },
  voiceBtn: { backgroundColor: '#FFFFFF', paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.lg, borderRadius: 999, ...shadows.md },
  voiceBtnActive: { backgroundColor: '#EF4444' },
  voiceBtnContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  voiceBtnText: { fontSize: 13, fontWeight: '700' },
  voiceBtnTextActive: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  listeningDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' },

  /* New vertical stack styles for cards feed */
  cardsFeed: { flexDirection: 'column', gap: spacing.md, marginBottom: spacing.lg, width: '100%' },
  bannerCard: { flexDirection: 'column', alignItems: 'stretch', justifyContent: 'space-between', width: '100%', minHeight: 180, borderRadius: borderRadius.xl, padding: spacing.lg, boxSizing: 'border-box' },
  bannerCardBadge: { alignSelf: 'flex-start', backgroundColor: '#10B981', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, marginBottom: spacing.sm },
  bannerCardBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  bannerCardContent: { flex: 1, marginBottom: spacing.md },
  bannerCardTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: spacing.xs, whiteSpace: 'nowrap' },
  bannerCardDesc: { fontSize: 13, lineHeight: 18, color: 'rgba(255,255,255,0.7)' },
  bannerBtn: { backgroundColor: '#FFFFFF', paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.lg, borderRadius: 999, alignSelf: 'flex-start', ...shadows.md },
  bannerBtnActive: { backgroundColor: '#EF4444' },
  bannerBtnContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  bannerBtnText: { fontSize: 13, fontWeight: '700' },
  bannerBtnTextActive: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },

  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: spacing.md },

  modulesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl },

  categoriesSection: { marginTop: spacing.sm },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  categoryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderRadius: borderRadius.lg, borderWidth: 1, gap: spacing.sm, minWidth: 120 },

  categoryName: { fontSize: 13, fontWeight: '600', flex: 1 },
  categoryCount: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 999 },
  categoryCountText: { fontSize: 11, fontWeight: '600' },

  bottomSpacer: { height: 80 },
});
