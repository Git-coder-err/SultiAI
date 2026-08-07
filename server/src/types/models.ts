export interface User {
  userId: number;
  fullname: string;
  username?: string;
  email: string;
  avatarId: number;
  preferredLang: string;
  learningLang: string;
  country?: string;
  role: 'user' | 'admin' | 'moderator';
  createdAt: string;
  updatedAt?: string;
  isVerified: boolean;
  isNativeSpeaker: boolean;
  bio?: string;
}

export interface LearnerProfile {
  profileId: number;
  userId: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  strengths: string[];
  weakAreas: string[];
  commonMistakes: MistakePattern[];
  totalXp: number;
  coins: number;
  hearts: number;
  streak: number;
  dailyXp: number;
  dailyGoal: number;
  totalSessions: number;
  lastActive?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MistakePattern {
  pattern: string;
  correction: string;
  count: number;
  lastOccurrence?: string;
}

export interface TutorSession {
  sessionId: number;
  userId: number;
  messages: TutorMessage[];
  summary?: string;
  startedAt: string;
  endedAt?: string;
  xpEarned: number;
}

export interface TutorMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface VocabularyItem {
  id: string;
  userId: number;
  word: string;
  translation: string;
  pronunciation: string;
  ipa?: string;
  category: string;
  difficulty: number;
  mastery: number;
  reviewCount: number;
  easeFactor: number;
  interval: number;
  nextReview: string;
  lastReview?: string;
  isFavorite: boolean;
  usageFrequency: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PronunciationAttempt {
  id: string;
  userId: number;
  word: string;
  phoneticExpected: string;
  phoneticHeard: string;
  accuracy: number;
  confidence: number;
  mistakes: PhonemeMistake[];
  lessonContext?: string;
  timestamp: string;
}

export interface PhonemeMistake {
  expected: string;
  heard: string;
  position: number;
  tip?: string;
}

export interface LearningAnalytics {
  userId: number;
  weeklyXp: number[];
  monthlyXp: number;
  totalSessions: number;
  avgAccuracy: number;
  vocabularyMastery: number;
  grammarMastery: number;
  speakingConfidence: number;
  streakCurrent: number;
  streakLongest: number;
  lastActive: string;
}

export interface ConversationSummary {
  id: string;
  userId: number;
  summary: string;
  topics: string[];
  vocabularyLearned: string[];
  duration: number;
  timestamp: string;
}

export interface Notification {
  notifyId: number;
  userId: number;
  title: string;
  message: string;
  type: 'reminder' | 'achievement' | 'social' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface DailyActivity {
  activityId: number;
  userId: number;
  activityDate: string;
  xpEarned: number;
  sessionsCompleted: number;
  wordsLearned: number;
}

export interface XpLog {
  id: string;
  userId: number;
  amount: number;
  source: string;
  description?: string;
  timestamp: string;
}
