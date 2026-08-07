export * from './xp';
export * from './achievements';

export const SM2_DEFAULTS = {
  MIN_EASE_FACTOR: 1.3,
  INITIAL_EASE_FACTOR: 2.5,
  INITIAL_INTERVAL: 1,
  MAX_INTERVAL: 365,
  GRADING_THRESHOLD_PASS: 3,
} as const;

export const VOCABULARY_CATEGORIES = [
  'greetings',
  'food',
  'family',
  'travel',
  'numbers',
  'time',
  'emotions',
  'body',
  'nature',
  'work',
  'culture',
  'custom',
] as const;

export const NOTIFICATION_TYPES = {
  DAILY_REMINDER: 'daily_reminder',
  STREAK_REMINDER: 'streak_reminder',
  REVIEW_VOCABULARY: 'review_vocabulary',
  WEEKLY_REPORT: 'weekly_report',
  NEW_CHALLENGE: 'new_challenge',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  COMMUNITY_REPLY: 'community_reply',
  GOAL_ACHIEVED: 'goal_achieved',
} as const;

export const ADAPTIVE_PARAMS = {
  SESSIONS_TO_LEVEL_UP: 3,
  SESSIONS_TO_LEVEL_DOWN: 5,
  MASTERY_THRESHOLD_UP: 0.75,
  MASTERY_THRESHOLD_DOWN: 0.40,
  MIN_SESSIONS_FOR_ASSESSMENT: 3,
} as const;
