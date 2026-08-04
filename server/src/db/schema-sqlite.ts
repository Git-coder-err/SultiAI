import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const avatars = sqliteTable('avatars', {
  avatarId: integer('avatar_id').primaryKey({ autoIncrement: true }),
  avatarName: text('avatar_name').notNull(),
  avatarImage: text('avatar_image').notNull(),
});

export const users = sqliteTable('users', {
  userId: integer('user_id').primaryKey({ autoIncrement: true }),
  fullname: text('fullname').notNull(),
  username: text('username'),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  avatarId: integer('avatar_id').default(1),
  preferredLang: text('preferred_lang').default('English'),
  learningLang: text('learning_lang').default('Bisaya'),
  country: text('country'),
  role: text('role').notNull().default('user'),
  createdAt: text('created_at').default(`datetime('now')`),
});

export const userSettings = sqliteTable('user_settings', {
  settingId: integer('setting_id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().unique().references(() => users.userId, { onDelete: 'cascade' }),
  darkMode: integer('dark_mode').default(0),
  speechSpeed: real('speech_speed').default(1.0),
  voiceGender: text('voice_gender').default('neutral'),
});

export const savedPhrases = sqliteTable('saved_phrases', {
  phraseId: integer('phrase_id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  phrase: text('phrase').notNull(),
  language: text('language'),
  category: text('category'),
  createdAt: text('created_at').default(`datetime('now')`),
});

export const notifications = sqliteTable('notifications', {
  notifyId: integer('notify_id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  title: text('title'),
  message: text('message'),
  isRead: integer('is_read').default(0),
  createdAt: text('created_at').default(`datetime('now')`),
});

export const feedback = sqliteTable('feedback', {
  feedbackId: integer('feedback_id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  functionality: integer('functionality').default(0),
  usability: integer('usability').default(0),
  reliability: integer('reliability').default(0),
  createdAt: text('created_at').default(`datetime('now')`),
});

export const conversations = sqliteTable('conversations', {
  conversationId: integer('conversation_id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  title: text('title'),
  createdAt: text('created_at').default(`datetime('now')`),
});

export const conversationMessages = sqliteTable('conversation_messages', {
  messageId: integer('message_id').primaryKey({ autoIncrement: true }),
  conversationId: integer('conversation_id').notNull().references(() => conversations.conversationId, { onDelete: 'cascade' }),
  sender: text('sender').notNull().default('user'),
  message: text('message'),
  translatedMessage: text('translated_message'),
  createdAt: text('created_at').default(`datetime('now')`),
});

export const speechRecords = sqliteTable('speech_records', {
  speechId: integer('speech_id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  audioPath: text('audio_path'),
  recognizedText: text('recognized_text'),
  languageDetected: text('language_detected'),
  confidence: real('confidence').default(0),
  createdAt: text('created_at').default(`datetime('now')`),
});

export const translations = sqliteTable('translations', {
  translationId: integer('translation_id').primaryKey({ autoIncrement: true }),
  speechId: integer('speech_id').notNull().references(() => speechRecords.speechId, { onDelete: 'cascade' }),
  sourceLanguage: text('source_language'),
  targetLanguage: text('target_language'),
  translatedText: text('translated_text'),
});

export const phraseRecommendations = sqliteTable('phrase_recommendations', {
  recommendationId: integer('recommendation_id').primaryKey({ autoIncrement: true }),
  speechId: integer('speech_id').notNull().references(() => speechRecords.speechId, { onDelete: 'cascade' }),
  recommendedPhrase: text('recommended_phrase'),
  intent: text('intent'),
  confidence: real('confidence').default(0),
});

export const learningModules = sqliteTable('learning_modules', {
  moduleId: integer('module_id').primaryKey({ autoIncrement: true }),
  moduleTitle: text('module_title').notNull(),
  difficulty: text('difficulty').default('beginner'),
  language: text('language'),
  createdAt: text('created_at').default(`datetime('now')`),
});

export const learningProgress = sqliteTable('learning_progress', {
  progressId: integer('progress_id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  moduleId: integer('module_id').notNull().references(() => learningModules.moduleId, { onDelete: 'cascade' }),
  completionPercent: real('completion_percent').default(0),
  createdAt: text('created_at').default(`datetime('now')`),
});

export const communityPosts = sqliteTable('community_posts', {
  postId: integer('post_id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  title: text('title'),
  content: text('content'),
  phrase: text('phrase'),
  translation: text('translation'),
  category: text('category'),
  createdAt: text('created_at').default(`datetime('now')`),
});

export const comments = sqliteTable('comments', {
  commentId: integer('comment_id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id').notNull().references(() => communityPosts.postId, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  comment: text('comment'),
  createdAt: text('created_at').default(`datetime('now')`),
});

export const learnerProfiles = sqliteTable('learner_profiles', {
  profileId: integer('profile_id').primaryKey({ autoIncrement: true }),
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
  lastActive: text('last_active'),
});

export const preservedWords = sqliteTable('preserved_words', {
  wordId: integer('word_id').primaryKey({ autoIncrement: true }),
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
  createdAt: text('created_at').default(`datetime('now')`),
});

export const verificationRequests = sqliteTable('verification_requests', {
  requestId: integer('request_id').primaryKey({ autoIncrement: true }),
  wordId: integer('word_id').references(() => preservedWords.wordId, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  audioPath: text('audio_path'),
  recordedText: text('recorded_text'),
  verifierId: integer('verifier_id').references(() => users.userId, { onDelete: 'set null' }),
  score: real('score'),
  feedback: text('feedback'),
  status: text('status').default('pending'),
  createdAt: text('created_at').default(`datetime('now')`),
  verifiedAt: text('verified_at'),
});

export const tutorSessions = sqliteTable('tutor_sessions', {
  sessionId: integer('session_id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  messages: text('messages'),
  summary: text('summary'),
  startedAt: text('started_at').default(`datetime('now')`),
  endedAt: text('ended_at'),
});
