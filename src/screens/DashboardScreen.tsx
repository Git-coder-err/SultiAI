import React, { useRef, useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Animated, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { spacing } from '../theme';
import { SmartWelcomeHeader } from './dashboard/components/SmartWelcomeHeader';
import { AILearningSummary } from './dashboard/components/AILearningSummary';
import { AILearningCoach } from './dashboard/components/AILearningCoach';
import { PhraseOfTheDay } from './dashboard/components/PhraseOfTheDay';
import { VoiceChallenge } from './dashboard/components/VoiceChallenge';
import { AIChatTutor } from './dashboard/components/AIChatTutor';
import { TodayMission } from './dashboard/components/TodayMission';
import { LearningAnalytics } from './dashboard/components/LearningAnalytics';
import { AchievementsPreview } from './dashboard/components/AchievementsPreview';
import { DailyDiscovery } from './dashboard/components/DailyDiscovery';
import { CommunityHighlights } from './dashboard/components/CommunityHighlights';
import { RecentActivity } from './dashboard/components/RecentActivity';
import { TravelSuggestion } from './dashboard/components/TravelSuggestion';
import { DailyRewardCard } from './dashboard/components/DailyRewardCard';
import OnboardingForm from '../components/OnboardingForm';
import FeatureGrid from '../components/FeatureGrid';
import DailyChallengeCard from '../components/learning/DailyChallengeCard';

interface DashboardScreenProps {
  navigation: any;
}

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const { colors, getAnimationDuration } = useTheme();
  const { addXp } = useGame();
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
    } catch {}
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

  const handlePracticePhrase = () => {
    navigation.navigate('Pronunciation');
  };

  const handleOpenTutor = () => {
    navigation.navigate('SULTI');
  };

  const handleViewAchievements = () => {
    navigation.navigate('Achievements');
  };

  const handleOpenCommunity = () => {
    navigation.navigate('Community');
  };

  const handleStartChallenge = (challenge: any) => {
    if (challenge) {
      navigation.navigate('SULTI', { situation: challenge.scenario, label: challenge.title });
    }
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
        <Animated.View style={{ opacity: headerOpacity }}>
          <SmartWelcomeHeader
            onNotificationPress={() => navigation.navigate('Profile')}
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

        <FeatureGrid navigation={navigation} />
        <DailyRewardCard />
        <AILearningSummary onContinueLearning={handleContinueLearning} />
        <AILearningCoach onStartCoaching={handleStartCoaching} />
        <PhraseOfTheDay onPractice={handlePracticePhrase} />
        <VoiceChallenge />
        <AIChatTutor onOpenTutor={handleOpenTutor} />
        <TodayMission onStart={handleContinueLearning} />
        <DailyChallengeCard onStart={handleStartChallenge} navigation={navigation} />
        <LearningAnalytics />
        <TravelSuggestion onPractice={handlePracticePhrase} />
        <CommunityHighlights onOpenCommunity={handleOpenCommunity} />
        <RecentActivity onOpenTutor={handleOpenTutor} />
        <AchievementsPreview onViewAll={handleViewAchievements} />
        <DailyDiscovery />

        <View style={styles.bottomSpacer} />
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
});
