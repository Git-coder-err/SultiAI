-- New tables for SultiAI v2.0 improvements

-- Vocabulary Reviews (Spaced Repetition)
CREATE TABLE IF NOT EXISTS vocabulary_reviews (
  review_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  phrase_id INTEGER NOT NULL REFERENCES saved_phrases(phrase_id) ON DELETE CASCADE,
  ease_factor REAL DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  next_review_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, phrase_id)
);

-- User Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  achievement_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  achievement_id_ref TEXT NOT NULL,
  earned_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, achievement_id_ref)
);

-- User Badges
CREATE TABLE IF NOT EXISTS user_badges (
  badge_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  badge_id_ref TEXT NOT NULL,
  earned_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, badge_id_ref)
);

-- Completed Challenges
CREATE TABLE IF NOT EXISTS completed_challenges (
  completion_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'daily',
  completed_date TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, challenge_id, completed_date)
);

-- Daily Activity Log (for streak tracking)
CREATE TABLE IF NOT EXISTS daily_activity (
  activity_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  activity_date TEXT NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  sessions_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, activity_date)
);

-- Community Follows
CREATE TABLE IF NOT EXISTS follows (
  follow_id INTEGER PRIMARY KEY AUTOINCREMENT,
  follower_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  following_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(follower_id, following_id)
);

-- Native Speaker Verifications
CREATE TABLE IF NOT EXISTS verifications (
  verification_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  phrase_id INTEGER REFERENCES saved_phrases(phrase_id) ON DELETE SET NULL,
  audio_path TEXT,
  status TEXT DEFAULT 'pending',
  verified_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  created_at TEXT DEFAULT (datetime('now')),
  verified_at TEXT
);

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_logs (
  log_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id INTEGER,
  old_values TEXT,
  new_values TEXT,
  ip_address TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Add columns to existing tables
ALTER TABLE learner_profiles ADD COLUMN coins INTEGER DEFAULT 0;
ALTER TABLE learner_profiles ADD COLUMN hearts INTEGER DEFAULT 5;
ALTER TABLE learner_profiles ADD COLUMN daily_xp INTEGER DEFAULT 0;
ALTER TABLE learner_profiles ADD COLUMN daily_goal INTEGER DEFAULT 50;
ALTER TABLE learner_profiles ADD COLUMN last_daily_reset TEXT;
ALTER TABLE learner_profiles ADD COLUMN preferred_learning_style TEXT;
ALTER TABLE learner_profiles ADD COLUMN xp_to_next_level INTEGER DEFAULT 500;

-- Add xp_earned to tutor_sessions for gamification
ALTER TABLE tutor_sessions ADD COLUMN xp_earned INTEGER DEFAULT 0;

-- Add verified status to users
ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN is_native_speaker INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN bio TEXT;
