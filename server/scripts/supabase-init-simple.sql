-- Simple Supabase schema - run this in the SQL Editor
-- https://supabase.com/dashboard/project/pptanwtuybivlqeyntwh/sql/new

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT DEFAULT '',
  native_language TEXT DEFAULT 'English',
  target_language TEXT DEFAULT 'Bisaya',
  country TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Backfill profiles for existing users
INSERT INTO public.profiles (id, email, full_name)
SELECT au.id, au.email, COALESCE(au.raw_user_meta_data->>'full_name', '')
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 6. Saved phrases table
CREATE TABLE IF NOT EXISTS public.saved_phrases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  phrase TEXT NOT NULL,
  translation TEXT DEFAULT '',
  language TEXT DEFAULT 'Bisaya',
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.saved_phrases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own phrases" ON public.saved_phrases FOR ALL USING (auth.uid() = user_id);

-- 7. Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Untitled',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own conversations" ON public.conversations FOR ALL USING (auth.uid() = user_id);

-- 8. Conversation messages
CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL DEFAULT 'user',
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own messages" ON public.conversation_messages FOR ALL USING (
  conversation_id IN (SELECT id FROM public.conversations WHERE user_id = auth.uid())
);
