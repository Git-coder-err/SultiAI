-- SultiAI Admin Schema for Supabase PostgreSQL
-- Run this in the Supabase SQL Editor to create all admin-related tables

-- ============================================
-- 1. Users Table (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  user_id SERIAL PRIMARY KEY,
  fullname TEXT NOT NULL,
  username TEXT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  clerk_id TEXT,
  google_id TEXT,
  supabase_id TEXT UNIQUE,
  avatar_id INTEGER DEFAULT 1,
  preferred_lang TEXT DEFAULT 'English',
  learning_lang TEXT DEFAULT 'Bisaya',
  country TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  status TEXT NOT NULL DEFAULT 'approved',
  is_verified INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON public.users(supabase_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- ============================================
-- 2. User Settings
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_settings (
  setting_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES public.users(user_id) ON DELETE CASCADE,
  dark_mode INTEGER DEFAULT 0,
  speech_speed REAL DEFAULT 1.0,
  voice_gender TEXT DEFAULT 'neutral'
);

-- ============================================
-- 3. Saved Phrases
-- ============================================
CREATE TABLE IF NOT EXISTS public.saved_phrases (
  phrase_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  phrase TEXT NOT NULL,
  language TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. Notifications
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  notify_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  title TEXT,
  message TEXT,
  is_read INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. Feedback
-- ============================================
CREATE TABLE IF NOT EXISTS public.feedback (
  feedback_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  functionality INTEGER DEFAULT 0,
  usability INTEGER DEFAULT 0,
  reliability INTEGER DEFAULT 0,
  resolved INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. Conversations
-- ============================================
CREATE TABLE IF NOT EXISTS public.conversations (
  conversation_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_messages (
  message_id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES public.conversations(conversation_id) ON DELETE CASCADE,
  sender TEXT NOT NULL DEFAULT 'user',
  message TEXT,
  translated_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. Speech Records
-- ============================================
CREATE TABLE IF NOT EXISTS public.speech_records (
  speech_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  audio_path TEXT,
  recognized_text TEXT,
  language_detected TEXT,
  confidence REAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.translations (
  translation_id SERIAL PRIMARY KEY,
  speech_id INTEGER NOT NULL REFERENCES public.speech_records(speech_id) ON DELETE CASCADE,
  source_language TEXT,
  target_language TEXT,
  translated_text TEXT
);

CREATE TABLE IF NOT EXISTS public.phrase_recommendations (
  recommendation_id SERIAL PRIMARY KEY,
  speech_id INTEGER NOT NULL REFERENCES public.speech_records(speech_id) ON DELETE CASCADE,
  recommended_phrase TEXT,
  intent TEXT,
  confidence REAL DEFAULT 0
);

-- ============================================
-- 8. Learning Modules
-- ============================================
CREATE TABLE IF NOT EXISTS public.learning_modules (
  module_id SERIAL PRIMARY KEY,
  module_title TEXT NOT NULL,
  difficulty TEXT DEFAULT 'beginner',
  language TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.learning_progress (
  progress_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  module_id INTEGER NOT NULL REFERENCES public.learning_modules(module_id) ON DELETE CASCADE,
  completion_percent REAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. Community Posts
-- ============================================
CREATE TABLE IF NOT EXISTS public.community_posts (
  post_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  phrase TEXT,
  translation TEXT,
  category TEXT,
  likes_count INTEGER DEFAULT 0,
  bookmarks_count INTEGER DEFAULT 0,
  is_featured INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.comments (
  comment_id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES public.community_posts(post_id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.community_reports (
  report_id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES public.community_posts(post_id) ON DELETE CASCADE,
  reporter_id INTEGER REFERENCES public.users(user_id) ON DELETE SET NULL,
  reason TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. Learner Profiles
-- ============================================
CREATE TABLE IF NOT EXISTS public.learner_profiles (
  profile_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES public.users(user_id) ON DELETE CASCADE,
  level TEXT DEFAULT 'beginner',
  strengths TEXT,
  weak_areas TEXT,
  common_mistakes TEXT,
  total_xp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  daily_xp INTEGER DEFAULT 0,
  daily_goal INTEGER DEFAULT 50,
  total_sessions INTEGER DEFAULT 0,
  last_active TEXT
);

-- ============================================
-- 11. Preserved Words
-- ============================================
CREATE TABLE IF NOT EXISTS public.preserved_words (
  word_id SERIAL PRIMARY KEY,
  word TEXT NOT NULL,
  definition TEXT,
  part_of_speech TEXT,
  dialectal_region TEXT,
  bisaya_example TEXT,
  english_example TEXT,
  pronunciation_guide TEXT,
  submitted_by INTEGER REFERENCES public.users(user_id) ON DELETE SET NULL,
  source TEXT DEFAULT 'learner',
  status TEXT DEFAULT 'pending',
  verification_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 12. Tutor Sessions
-- ============================================
CREATE TABLE IF NOT EXISTS public.tutor_sessions (
  session_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  messages TEXT,
  summary TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  xp_earned INTEGER DEFAULT 0
);

-- ============================================
-- 13. Pronunciation Attempts
-- ============================================
CREATE TABLE IF NOT EXISTS public.pronunciation_attempts (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  phonetic_expected TEXT DEFAULT '',
  phonetic_heard TEXT DEFAULT '',
  accuracy REAL DEFAULT 0,
  confidence REAL DEFAULT 0,
  mistakes TEXT DEFAULT '[]',
  lesson_context TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 14. Vocabulary Reviews
-- ============================================
CREATE TABLE IF NOT EXISTS public.vocabulary_reviews (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 15. Conversation Summaries
-- ============================================
CREATE TABLE IF NOT EXISTS public.conversation_summaries (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  topics TEXT DEFAULT '[]',
  vocabulary_learned TEXT DEFAULT '[]',
  duration INTEGER DEFAULT 0,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 16. XP Logs
-- ============================================
CREATE TABLE IF NOT EXISTS public.xp_logs (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  description TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 17. AI Recommendations
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL,
  content TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  is_applied INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  applied_at TIMESTAMPTZ
);

-- ============================================
-- 18. User Sessions (refresh tokens)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL,
  device_info TEXT,
  ip_address TEXT,
  expires_at TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 19. Notification Preferences
-- ============================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES public.users(user_id) ON DELETE CASCADE,
  daily_reminder INTEGER DEFAULT 1,
  daily_reminder_hour INTEGER DEFAULT 9,
  daily_reminder_minute INTEGER DEFAULT 0,
  streak_reminder INTEGER DEFAULT 1,
  review_reminder INTEGER DEFAULT 1,
  weekly_report INTEGER DEFAULT 1,
  achievement_alerts INTEGER DEFAULT 1,
  community_alerts INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 20. Learning Analytics
-- ============================================
CREATE TABLE IF NOT EXISTS public.learning_analytics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES public.users(user_id) ON DELETE CASCADE,
  total_speaking_seconds INTEGER DEFAULT 0,
  total_words_learned INTEGER DEFAULT 0,
  total_pronunciation_attempts INTEGER DEFAULT 0,
  avg_pronunciation_accuracy REAL DEFAULT 0,
  avg_session_duration REAL DEFAULT 0,
  favorite_category TEXT,
  weakest_category TEXT,
  weekly_xp TEXT DEFAULT '[]',
  last_calculated TIMESTAMPTZ
);

-- ============================================
-- 21. Bookmarks
-- ============================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  post_id INTEGER NOT NULL REFERENCES public.community_posts(post_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- ============================================
-- 22. Likes
-- ============================================
CREATE TABLE IF NOT EXISTS public.likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  post_id INTEGER NOT NULL REFERENCES public.community_posts(post_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- ============================================
-- 23. Audit Logs
-- ============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details TEXT,
  ip_address TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 24. Daily Activity
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_activity (
  activity_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  activity_date TEXT NOT NULL,
  xp_earned INTEGER DEFAULT 0
);

-- ============================================
-- 25. User Achievements
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
  user_achievement_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ,
  UNIQUE(user_id, achievement_id)
);

-- ============================================
-- 26. User Badges
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_badges (
  user_badge_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ,
  UNIQUE(user_id, badge_id)
);

-- ============================================
-- 27. Completed Challenges
-- ============================================
CREATE TABLE IF NOT EXISTS public.completed_challenges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 28. Follows
-- ============================================
CREATE TABLE IF NOT EXISTS public.follows (
  id SERIAL PRIMARY KEY,
  follower_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  following_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- ============================================
-- 29. Verifications
-- ============================================
CREATE TABLE IF NOT EXISTS public.verifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  verified_by INTEGER REFERENCES public.users(user_id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 30. Verification Requests
-- ============================================
CREATE TABLE IF NOT EXISTS public.verification_requests (
  request_id SERIAL PRIMARY KEY,
  word_id INTEGER REFERENCES public.preserved_words(word_id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  audio_path TEXT,
  recorded_text TEXT,
  verifier_id INTEGER REFERENCES public.users(user_id) ON DELETE SET NULL,
  score REAL,
  feedback TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

-- ============================================
-- 31. Avatars
-- ============================================
CREATE TABLE IF NOT EXISTS public.avatars (
  avatar_id SERIAL PRIMARY KEY,
  avatar_name TEXT NOT NULL,
  avatar_image TEXT NOT NULL
);

-- Insert default avatar
INSERT INTO public.avatars (avatar_id, avatar_name, avatar_image)
VALUES (1, 'Default', 'https://api.dicebear.com/7.x/avataaars/svg?seed=default')
ON CONFLICT (avatar_id) DO NOTHING;

-- ============================================
-- 32. Platform Settings (key-value store)
-- ============================================
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS Policies (Row Level Security)
-- ============================================
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speech_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phrase_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preserved_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pronunciation_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Admin policies (service role bypasses RLS, but these allow admin access)
CREATE POLICY "Admins can manage all users" ON public.users FOR ALL USING (true);
CREATE POLICY "Admins can manage all settings" ON public.user_settings FOR ALL USING (true);
CREATE POLICY "Admins can manage all phrases" ON public.saved_phrases FOR ALL USING (true);
CREATE POLICY "Admins can manage all notifications" ON public.notifications FOR ALL USING (true);
CREATE POLICY "Admins can manage all feedback" ON public.feedback FOR ALL USING (true);
CREATE POLICY "Admins can manage all conversations" ON public.conversations FOR ALL USING (true);
CREATE POLICY "Admins can manage all messages" ON public.conversation_messages FOR ALL USING (true);
CREATE POLICY "Admins can manage all speech" ON public.speech_records FOR ALL USING (true);
CREATE POLICY "Admins can manage all translations" ON public.translations FOR ALL USING (true);
CREATE POLICY "Admins can manage all recommendations" ON public.phrase_recommendations FOR ALL USING (true);
CREATE POLICY "Admins can manage all modules" ON public.learning_modules FOR ALL USING (true);
CREATE POLICY "Admins can manage all progress" ON public.learning_progress FOR ALL USING (true);
CREATE POLICY "Admins can manage all posts" ON public.community_posts FOR ALL USING (true);
CREATE POLICY "Admins can manage all comments" ON public.comments FOR ALL USING (true);
CREATE POLICY "Admins can manage all reports" ON public.community_reports FOR ALL USING (true);
CREATE POLICY "Admins can manage all profiles" ON public.learner_profiles FOR ALL USING (true);
CREATE POLICY "Admins can manage all words" ON public.preserved_words FOR ALL USING (true);
CREATE POLICY "Admins can manage all tutor sessions" ON public.tutor_sessions FOR ALL USING (true);
CREATE POLICY "Admins can manage all pronunciation" ON public.pronunciation_attempts FOR ALL USING (true);
CREATE POLICY "Admins can manage all vocabulary" ON public.vocabulary_reviews FOR ALL USING (true);
CREATE POLICY "Admins can manage all summaries" ON public.conversation_summaries FOR ALL USING (true);
CREATE POLICY "Admins can manage all xp" ON public.xp_logs FOR ALL USING (true);
CREATE POLICY "Admins can manage all ai recs" ON public.ai_recommendations FOR ALL USING (true);
CREATE POLICY "Admins can manage all sessions" ON public.user_sessions FOR ALL USING (true);
CREATE POLICY "Admins can manage all prefs" ON public.notification_preferences FOR ALL USING (true);
CREATE POLICY "Admins can manage all analytics" ON public.learning_analytics FOR ALL USING (true);
CREATE POLICY "Admins can manage all bookmarks" ON public.bookmarks FOR ALL USING (true);
CREATE POLICY "Admins can manage all likes" ON public.likes FOR ALL USING (true);
CREATE POLICY "Admins can manage all logs" ON public.audit_logs FOR ALL USING (true);
CREATE POLICY "Admins can manage all activity" ON public.daily_activity FOR ALL USING (true);
CREATE POLICY "Admins can manage all achievements" ON public.user_achievements FOR ALL USING (true);
CREATE POLICY "Admins can manage all badges" ON public.user_badges FOR ALL USING (true);
CREATE POLICY "Admins can manage all challenges" ON public.completed_challenges FOR ALL USING (true);
CREATE POLICY "Admins can manage all follows" ON public.follows FOR ALL USING (true);
CREATE POLICY "Admins can manage all verifications" ON public.verifications FOR ALL USING (true);
CREATE POLICY "Admins can manage all requests" ON public.verification_requests FOR ALL USING (true);
CREATE POLICY "Admins can manage all avatars" ON public.avatars FOR ALL USING (true);
CREATE POLICY "Admins can manage all platform settings" ON public.platform_settings FOR ALL USING (true);

-- ============================================
-- Functions for auto-updating timestamps
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_vocabulary_reviews_updated_at
  BEFORE UPDATE ON public.vocabulary_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Done! All tables created in Supabase PostgreSQL
