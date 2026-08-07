-- SultiAI Architecture V2 - Database Migration
-- New tables for pronunciation analytics, vocabulary intelligence, conversation memory, XP logs

-- Pronunciation attempts table
CREATE TABLE IF NOT EXISTS pronunciation_attempts (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  word TEXT NOT NULL,
  phonetic_expected TEXT DEFAULT '',
  phonetic_heard TEXT DEFAULT '',
  accuracy REAL DEFAULT 0,
  confidence REAL DEFAULT 0,
  mistakes TEXT DEFAULT '[]',
  lesson_context TEXT,
  timestamp TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pronunciation_user ON pronunciation_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_pronunciation_word ON pronunciation_attempts(word);
CREATE INDEX IF NOT EXISTS idx_pronunciation_timestamp ON pronunciation_attempts(timestamp);

-- Vocabulary reviews table (spaced repetition)
CREATE TABLE IF NOT EXISTS vocabulary_reviews (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  word TEXT NOT NULL,
  translation TEXT DEFAULT '',
  pronunciation TEXT DEFAULT '',
  ipa TEXT,
  category TEXT DEFAULT 'custom',
  difficulty INTEGER DEFAULT 1,
  mastery REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  ease_factor REAL DEFAULT 2.5,
  interval INTEGER DEFAULT 1,
  next_review TEXT NOT NULL,
  last_review TEXT,
  is_favorite INTEGER DEFAULT 0,
  usage_frequency INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_vocabulary_user ON vocabulary_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_next_review ON vocabulary_reviews(next_review);
CREATE INDEX IF NOT EXISTS idx_vocabulary_category ON vocabulary_reviews(category);

-- Conversation summaries for long-term memory
CREATE TABLE IF NOT EXISTS conversation_summaries (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  summary TEXT NOT NULL,
  topics TEXT DEFAULT '[]',
  vocabulary_learned TEXT DEFAULT '[]',
  duration INTEGER DEFAULT 0,
  timestamp TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_conversation_summaries_user ON conversation_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_summaries_timestamp ON conversation_summaries(timestamp);

-- XP logs for detailed tracking
CREATE TABLE IF NOT EXISTS xp_logs (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  description TEXT,
  timestamp TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_xp_logs_user ON xp_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_logs_source ON xp_logs(source);
CREATE INDEX IF NOT EXISTS idx_xp_logs_timestamp ON xp_logs(timestamp);

-- AI recommendations cache
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  recommendation_type TEXT NOT NULL,
  content TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  is_applied INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  applied_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user ON ai_recommendations(user_id);

-- User sessions for refresh tokens
CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  refresh_token TEXT NOT NULL,
  device_info TEXT,
  ip_address TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  daily_reminder INTEGER DEFAULT 1,
  daily_reminder_hour INTEGER DEFAULT 9,
  daily_reminder_minute INTEGER DEFAULT 0,
  streak_reminder INTEGER DEFAULT 1,
  review_reminder INTEGER DEFAULT 1,
  weekly_report INTEGER DEFAULT 1,
  achievement_alerts INTEGER DEFAULT 1,
  community_alerts INTEGER DEFAULT 1,
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Learning analytics aggregated data
CREATE TABLE IF NOT EXISTS learning_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  total_speaking_seconds INTEGER DEFAULT 0,
  total_words_learned INTEGER DEFAULT 0,
  total_pronunciation_attempts INTEGER DEFAULT 0,
  avg_pronunciation_accuracy REAL DEFAULT 0,
  avg_session_duration REAL DEFAULT 0,
  favorite_category TEXT,
  weakest_category TEXT,
  weekly_xp TEXT DEFAULT '[]',
  last_calculated TEXT,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Add missing columns to learner_profiles if not exists
ALTER TABLE learner_profiles ADD COLUMN hearts INTEGER DEFAULT 5;
ALTER TABLE learner_profiles ADD COLUMN xp_to_next_level INTEGER DEFAULT 100;

-- Add xp_earned to tutor_sessions if not exists
ALTER TABLE tutor_sessions ADD COLUMN xp_earned INTEGER DEFAULT 0;

-- Add verified fields to users if not exists
ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN is_native_speaker INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN bio TEXT;

-- Add likes and bookmarks to community
ALTER TABLE community_posts ADD COLUMN likes_count INTEGER DEFAULT 0;
ALTER TABLE community_posts ADD COLUMN bookmarks_count INTEGER DEFAULT 0;
ALTER TABLE community_posts ADD COLUMN is_featured INTEGER DEFAULT 0;

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES community_posts(post_id) ON DELETE CASCADE,
  UNIQUE(user_id, post_id)
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES community_posts(post_id) ON DELETE CASCADE,
  UNIQUE(user_id, post_id)
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details TEXT,
  ip_address TEXT,
  timestamp TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
