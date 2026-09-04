import React, { useRef, useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Animated, RefreshControl, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { spacing } from '../theme';
import { SmartWelcomeHeader } from './dashboard/components/SmartWelcomeHeader';
import { AILearningSummary } from './dashboard/components/AILearningSummary';
import { AILearningCoach } from './dashboard/components/AILearningCoach';
import { PhraseOfTheDay } from './dashboard/components/PhraseOfTheDay';
import { AIChatTutor } from './dashboard/components/AIChatTutor';
import { TodayMission } from './dashboard/components/TodayMission';
import { AchievementsPreview } from './dashboard/components/AchievementsPreview';
import { DailyDiscovery } from './dashboard/components/DailyDiscovery';
import { DailyRewardCard } from './dashboard/components/DailyRewardCard';
import { WeeklyActivity } from './dashboard/components/WeeklyActivity';
import OnboardingForm from '../components/OnboardingForm';
import FeatureGrid from '../components/FeatureGrid';
import DailyChallengeCard from '../components/learning/DailyChallengeCard';

interface DashboardScreenProps {
  navigation: any;
}

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const { colors, getAnimationDuration } = useTheme();
  const { addXp } = useGame() as any;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = React.useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const flag = await AsyncStorage.getItem('onboarding_completed');
        setOnboardingComplete(flag === 'true');
      } catch {
        setOnboardingComplete(true);
      }
    })();
  }, []);

  const finishOnboarding = async () => {
    setOnboardingComplete(true);
    try {
      await AsyncStorage.setItem('onboarding_completed', 'true');
    } catch (e) {
      console.warn('[Dashboard] Failed to save onboarding state:', e);
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleContinueLearning = () => {
    navigation.navigate('Learn');
  };

  const handleStartCoaching = () => {
    addXp(10, 'ai_coaching');
    navigation.navigate('SULTI', { situation: 'AI Coaching Session', label: 'AI Coach' });
  };

  const handleOpenTutor = () => {
    navigation.navigate('SULTI');
  };

  const handleViewAchievements = () => {
    navigation.navigate('Achievements');
  };

  const handleStartChallenge = (challenge: any) => {
    if (challenge) {
      navigation.navigate('SULTI', { situation: challenge.scenario, label: challenge.title });
    }
  };

  const handleCultureNotes = () => {
    navigation.navigate('CultureNotes');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        <View style={styles.contentWidth}>
          <Animated.View style={{ opacity: headerOpacity }}>
            <SmartWelcomeHeader
              onNotificationPress={() => navigation.navigate('Notifications')}
              onSettingsPress={() => navigation.navigate('Profile')}
              onProfilePress={() => navigation.navigate('Profile')}
            />
          </Animated.View>

          {onboardingComplete === false && (
            <View style={styles.onboardingWrap}>
              <OnboardingForm
                initialName=""
                onComplete={finishOnboarding}
                onSkip={finishOnboarding}
              />
            </View>
          )}

          <TodayMission onStart={handleContinueLearning} />
          <AILearningSummary onContinueLearning={handleContinueLearning} />
          <AILearningCoach onStartCoaching={handleStartCoaching} />
          <AIChatTutor navigation={navigation} onOpenTutor={handleOpenTutor} />
          <PhraseOfTheDay />
          <FeatureGrid navigation={navigation} />
          <DailyChallengeCard onStart={handleStartChallenge} navigation={navigation} />
          <WeeklyActivity />
          <DailyDiscovery onLearnMore={handleCultureNotes} />
          <DailyRewardCard />
          <AchievementsPreview onViewAll={handleViewAchievements} />

          <View style={styles.bottomSpacer} />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  bottomSpacer: { height: 40 },
  onboardingWrap: { marginBottom: spacing.lg },
  contentWidth: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 720 : undefined,
    alignSelf: 'center',
  },
});