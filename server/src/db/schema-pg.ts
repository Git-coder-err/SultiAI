import { pgTable, text, integer, serial, real, timestamp } from 'drizzle-orm/pg-core';

export const avatars = pgTable('avatars', {
  avatarId: serial('avatar_id').primaryKey(),
  avatarName: text('avatar_name').notNull(),
  avatarImage: text('avatar_image').notNull(),
});

export const users = pgTable('users', {
  userId: serial('user_id').primaryKey(),
  fullname: text('fullname').notNull(),
  username: text('username'),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  avatarId: integer('avatar_id').default(1),
  preferredLang: text('preferred_lang').default('English'),
  learningLang: text('learning_lang').default('Bisaya'),
  country: text('country'),
  role: text('role').notNull().default('user'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userSettings = pgTable('user_settings', {
  settingId: serial('setting_id').primaryKey(),
  userId: integer('user_id').notNull().unique().references(() => users.userId, { onDelete: 'cascade' }),
  darkMode: integer('dark_mode').default(0),
  speechSpeed: real('speech_speed').default(1.0),
  voiceGender: text('voice_gender').default('neutral'),
});

export const savedPhrases = pgTable('saved_phrases', {
  phraseId: serial('phrase_id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  phrase: text('phrase').notNull(),
  language: text('language'),
  category: text('category'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const notifications = pgTable('notifications', {
  notifyId: serial('notify_id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  title: text('title'),
  message: text('message'),
  isRead: integer('is_read').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const feedback = pgTable('feedback', {
  feedbackId: serial('feedback_id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  functionality: integer('functionality').default(0),
  usability: integer('usability').default(0),
  reliability: integer('reliability').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const conversations = pgTable('conversations', {
  conversationId: serial('conversation_id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  title: text('title'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const conversationMessages = pgTable('conversation_messages', {
  messageId: serial('message_id').primaryKey(),
  conversationId: integer('conversation_id').notNull().references(() => conversations.conversationId, { onDelete: 'cascade' }),
  sender: text('sender').notNull().default('user'),
  message: text('message'),
  translatedMessage: text('translated_message'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const speechRecords = pgTable('speech_records', {
  speechId: serial('speech_id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  audioPath: text('audio_path'),
  recognizedText: text('recognized_text'),
  languageDetected: text('language_detected'),
  confidence: real('confidence').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const translations = pgTable('translations', {
  translationId: serial('translation_id').primaryKey(),
  speechId: integer('speech_id').notNull().references(() => speechRecords.speechId, { onDelete: 'cascade' }),
  sourceLanguage: text('source_language'),
  targetLanguage: text('target_language'),
  translatedText: text('translated_text'),
});

export const phraseRecommendations = pgTable('phrase_recommendations', {
  recommendationId: serial('recommendation_id').primaryKey(),
  speechId: integer('speech_id').notNull().references(() => speechRecords.speechId, { onDelete: 'cascade' }),
  recommendedPhrase: text('recommended_phrase'),
  intent: text('intent'),
  confidence: real('confidence').default(0),
});

export const learningModules = pgTable('learning_modules', {
  moduleId: serial('module_id').primaryKey(),
  moduleTitle: text('module_title').notNull(),
  difficulty: text('difficulty').default('beginner'),
  language: text('language'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const learningProgress = pgTable('learning_progress', {
  progressId: serial('progress_id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  moduleId: integer('module_id').notNull().references(() => learningModules.moduleId, { onDelete: 'cascade' }),
  completionPercent: real('completion_percent').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const communityPosts = pgTable('community_posts', {
  postId: serial('post_id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  title: text('title'),
  content: text('content'),
  phrase: text('phrase'),
  translation: text('translation'),
  category: text('category'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const comments = pgTable('comments', {
  commentId: serial('comment_id').primaryKey(),
  postId: integer('post_id').notNull().references(() => communityPosts.postId, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const learnerProfiles = pgTable('learner_profiles', {
  profileId: serial('profile_id').primaryKey(),
  userId: integer('user_id').notNull().unique().references(() => users.userId, { onDelete: 'cascade' }),
  level: text('level').default('beginner'),
  strengths: text('strengths'),
  weakAreas: text('weak_areas'),
  commonMistakes: text('common_mistakes'),
  totalXp: integer('total_xp').default(0),
  coins: integer('coins').default(0),
  streak: integer('streak').default(0),
  dailyXp: integer('daily_xp').default(0),
  dailyGoal: integer('daily_goal').default(50),
  totalSessions: integer('total_sessions').default(0),
  lastActive: timestamp('last_active'),
});

export const preservedWords = pgTable('preserved_words', {
  wordId: serial('word_id').primaryKey(),
  word: text('word').notNull(),
  definition: text('definition'),
  partOfSpeech: text('part_of_speech'),
  dialectalRegion: text('dialectal_region'),
  bisayaExample: text('bisaya_example'),
  englishExample: text('english_example'),
  pronunciationGuide: text('pronunciation_guide'),
  submittedBy: integer('submitted_by').references(() => users.userId, { onDelete: 'set null' }),
  source: text('source').default('learner'),
  status: text('status').default('pending'),
  verificationCount: integer('verification_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const verificationRequests = pgTable('verification_requests', {
  requestId: serial('request_id').primaryKey(),
  wordId: integer('word_id').references(() => preservedWords.wordId, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  audioPath: text('audio_path'),
  recordedText: text('recorded_text'),
  verifierId: integer('verifier_id').references(() => users.userId, { onDelete: 'set null' }),
  score: real('score'),
  feedback: text('feedback'),
  status: text('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  verifiedAt: timestamp('verified_at'),
});

export const tutorSessions = pgTable('tutor_sessions', {
  sessionId: serial('session_id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  messages: text('messages'),
  summary: text('summary'),
  startedAt: timestamp('started_at').defaultNow(),
  endedAt: timestamp('ended_at'),
});
