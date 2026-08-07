/**
 * SultiAI AI Learning Dashboard Type Definitions
 * Following the premium AI-powered educational app design specification
 */

// Core User & Progress Types
export interface UserProfile {
  id: string;
  name: string;
  displayName?: string;
  email: string;
  avatar?: string;
  nativeLanguage: string;
  learningLanguage: string;
  level: number;
  xp: number;
  totalXp: number;
  streak: number;
  longestStreak: number;
  dailyGoal: number;
  wordsLearned: number;
  lessonsCompleted: number;
  pronunciationAccuracy: number;
  joinDate: string;
}

// Smart Welcome Header Types
export interface SmartWelcomeData {
  greeting: string;
  motivationalMessage: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  user: Pick<UserProfile, 'name' | 'displayName' | 'avatar'>;
}

// AI Learning Summary Types
export interface LearningProgress {
  currentLevel: number;
  currentXp: number;
  xpToNextLevel: number;
  weeklyProgress: number; // percentage
  streak: number;
  longestStreak: number;
  pronunciationAccuracy: number;
  lessonsCompleted: number;
  totalLessons: number;
  wordsLearned: number;
}

export interface AILearningSummaryData {
  progress: LearningProgress;
  primaryCTA: {
    label: string;
    action: 'continue_learning' | 'voice_practice' | 'ai_tutor' | 'daily_challenge';
    screen: string;
    params?: Record<string, unknown>;
  };
}

// AI Learning Coach Types
export interface CoachRecommendation {
  id: string;
  type: 'pronunciation' | 'vocabulary' | 'grammar' | 'conversation' | 'review';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedMinutes: number;
  relatedModule?: string;
  xpReward: number;
  icon: string;
  color: string;
}

export interface CoachAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: CoachRecommendation[];
  totalEstimatedTime: number;
  confidenceScore: number;
}

export interface AILearningCoachData {
  analysis: CoachAnalysis;
  primaryCTA: {
    label: string;
    action: 'start_coaching';
    screen: string;
  };
}

// Phrase of the Day Types
export interface PhraseOfTheDayData {
  id: string;
  cebuano: string;
  english: string;
  pronunciation: string; // IPA or phonetic
  audioUrl?: string;
  category: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  exampleSentence?: {
    cebuano: string;
    english: string;
  };
  culturalNote?: string;
  practiceState: 'idle' | 'recording' | 'processing' | 'complete';
  pronunciationScore?: number;
  lastPracticed?: string;
}

// Voice Challenge Types
export interface VoiceChallengeData {
  id: string;
  title: string;
  scenario: string;
  targetPhrase: string;
  targetTranslation: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  durationMinutes: number;
  xpReward: number;
  phrases: Array<{
    id: string;
    cebuano: string;
    english: string;
    pronunciation: string;
  }>;
  recordingState: 'idle' | 'recording' | 'processing' | 'complete';
  waveformData?: number[];
  confidenceScore?: number;
  pronunciationAccuracy?: number;
  feedback?: string;
  attempts: number;
  bestScore: number;
  completed: boolean;
}

// AI Chat Tutor Types
export interface ChatTutorQuickAction {
  id: string;
  label: string;
  icon: string;
  category: 'translate' | 'grammar' | 'conversation' | 'travel' | 'business';
  prompt: string;
  color: string;
}

export interface AIChatTutorData {
  welcomeMessage: string;
  quickActions: ChatTutorQuickAction[];
  recentTopics?: string[];
  primaryCTA: {
    label: string;
    action: 'open_tutor';
    screen: string;
  };
}

// Today's Mission Types
export interface MissionTask {
  id: string;
  title: string;
  description: string;
  type: 'lesson' | 'practice' | 'review' | 'voice' | 'vocab' | 'streak';
  xpReward: number;
  estimatedMinutes: number;
  completed: boolean;
  progress?: number; // 0-1 for partial completion
  targetScreen?: string;
  targetParams?: Record<string, unknown>;
}

export interface TodaysMissionData {
  date: string;
  tasks: MissionTask[];
  totalXp: number;
  totalEstimatedTime: number;
  completedCount: number;
  totalCount: number;
  streakBonus?: number;
}

// Learning Analytics Types
export interface WeeklyActivityData {
  day: string; // Mon, Tue, etc.
  date: string;
  minutes: number;
  lessons: number;
  xp: number;
  voicePracticeMinutes: number;
}

export interface CategoryStats {
  category: string;
  count: number;
  color: string;
  percentage: number;
}

export interface LearningAnalyticsData {
  weeklyActivity: WeeklyActivityData[];
  consistencyScore: number; // 0-100
  favoriteCategory: CategoryStats;
  averagePronunciationScore: number;
  totalTimeSpent: number; // minutes
  currentStreak: number;
  longestStreak: number;
  levelProgress: number; // 0-1
  wordsPerWeek: number;
  lessonsPerWeek: number;
}

// Achievements Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: [string, string];
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number; // 0-1
  requirement?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementData {
  unlockedBadges: Badge[];
  recentAchievements: Badge[];
  nextBadge: Badge | null;
  completionPercentage: number;
  totalBadges: number;
  unlockedCount: number;
  newAchievement?: Badge; // for celebration animation
}

// Daily Discovery Types
export type DiscoveryType =
  | 'cultural_fact'
  | 'useful_expression'
  | 'common_mistake'
  | 'idiom'
  | 'local_etiquette'
  | 'travel_tip';

export interface DailyDiscoveryData {
  id: string;
  type: DiscoveryType;
  title: string;
  content: string;
  cebuano?: string;
  english?: string;
  icon: string;
  color: string;
  backgroundGradient: [string, string];
  date: string;
  isNew: boolean;
}

// Combined Dashboard Data
export interface AILearningDashboardData {
  welcome: SmartWelcomeData;
  summary: AILearningSummaryData;
  coach: AILearningCoachData;
  phraseOfTheDay: PhraseOfTheDayData;
  voiceChallenge: VoiceChallengeData;
  chatTutor: AIChatTutorData;
  mission: TodaysMissionData;
  analytics: LearningAnalyticsData;
  achievements: AchievementData;
  dailyDiscovery: DailyDiscoveryData;
  lastUpdated: string;
}

// API Response Types
export interface DashboardAPIResponse {
  success: boolean;
  data: AILearningDashboardData;
  error?: string;
}

// Component Prop Types
export interface DashboardSectionProps {
  testID?: string;
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;
}

export interface AnimatedCardProps {
  index: number;
  delay?: number;
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

import { ViewStyle } from 'react-native';