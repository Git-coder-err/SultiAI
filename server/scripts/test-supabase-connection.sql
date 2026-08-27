-- Test script to verify Supabase PostgreSQL connection
-- Run this in Supabase SQL Editor to verify tables exist

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check users table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Check if we can insert a test user (then delete it)
INSERT INTO public.users (fullname, email, password_hash, role)
VALUES ('Test User', 'test@example.com', 'hashed_password', 'user')
ON CONFLICT (email) DO NOTHING
RETURNING user_id, fullname, email;

-- Delete test user
DELETE FROM public.users WHERE email = 'test@example.com';

-- Check audit_logs table
SELECT COUNT(*) as audit_log_count FROM public.audit_logs;

-- Check learner_profiles table
SELECT COUNT(*) as profile_count FROM public.learner_profiles;

-- Verify foreign keys exist
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;
