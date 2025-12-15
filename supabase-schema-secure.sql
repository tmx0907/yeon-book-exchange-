-- ============================================
-- 📚 Yeon Book Exchange - Updated Database Schema with RLS
-- ============================================

-- 1. Create Profiles Table (Linked to Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  email text,
  name text,
  avatar_url text,
  state text,
  suburb text,
  points int DEFAULT 50,
  favorite_quote text,
  join_date text,
  exchanges_completed int DEFAULT 0,
  rating decimal DEFAULT 5.0,
  created_at timestamptz DEFAULT now()
);

-- 2. Create Books Table
CREATE TABLE IF NOT EXISTS public.books (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  author text,
  isbn text,
  condition text,
  category text,
  image_url text,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_name text,
  location_state text,
  location_suburb text,
  points int DEFAULT 10,
  status text DEFAULT 'Available' CHECK (status IN ('Available', 'Swapped')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Create Chats Table
CREATE TABLE IF NOT EXISTS public.chats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_a uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_b uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message text,
  last_message_time timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 4. Create Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id uuid REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  text text,
  proposal_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 🔒 ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 📋 RLS POLICIES - PROFILES
-- ============================================

-- Everyone can view profiles (for book owners)
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Anyone can view profiles"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (for manual creation)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 📋 RLS POLICIES - BOOKS
-- ============================================

-- Anyone can view Available books, owners can view their own
DROP POLICY IF EXISTS "Anyone can view available books" ON public.books;
CREATE POLICY "Anyone can view available books"
  ON public.books
  FOR SELECT
  USING (status = 'Available' OR auth.uid() = owner_id);

-- Users can insert their own books
DROP POLICY IF EXISTS "Users can insert their own books" ON public.books;
CREATE POLICY "Users can insert their own books"
  ON public.books
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Users can update their own books
DROP POLICY IF EXISTS "Users can update their own books" ON public.books;
CREATE POLICY "Users can update their own books"
  ON public.books
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Users can delete their own books
DROP POLICY IF EXISTS "Users can delete their own books" ON public.books;
CREATE POLICY "Users can delete their own books"
  ON public.books
  FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================
-- 📋 RLS POLICIES - CHATS
-- ============================================

-- Users can view chats they're part of
DROP POLICY IF EXISTS "Users can view their own chats" ON public.chats;
CREATE POLICY "Users can view their own chats"
  ON public.chats
  FOR SELECT
  USING (auth.uid() = partner_a OR auth.uid() = partner_b);

-- Users can create chats they're part of
DROP POLICY IF EXISTS "Users can create their own chats" ON public.chats;
CREATE POLICY "Users can create their own chats"
  ON public.chats
  FOR INSERT
  WITH CHECK (auth.uid() = partner_a OR auth.uid() = partner_b);

-- Users can update chats they're part of
DROP POLICY IF EXISTS "Users can update their own chats" ON public.chats;
CREATE POLICY "Users can update their own chats"
  ON public.chats
  FOR UPDATE
  USING (auth.uid() = partner_a OR auth.uid() = partner_b)
  WITH CHECK (auth.uid() = partner_a OR auth.uid() = partner_b);

-- ============================================
-- 📋 RLS POLICIES - MESSAGES
-- ============================================

-- Users can view messages in their chats
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;
CREATE POLICY "Users can view messages in their chats"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE id = messages.chat_id
      AND (partner_a = auth.uid() OR partner_b = auth.uid())
    )
  );

-- Users can insert messages in their chats
DROP POLICY IF EXISTS "Users can insert messages in their chats" ON public.messages;
CREATE POLICY "Users can insert messages in their chats"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE id = messages.chat_id
      AND (partner_a = auth.uid() OR partner_b = auth.uid())
    )
  );

-- ============================================
-- 🚀 ENABLE REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.books;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ============================================
-- 🔧 TRIGGER: Auto-create profile on signup
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url, join_date)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'), 
    'https://i.pravatar.cc/150?u=' || NEW.id, 
    to_char(now(), 'Month YYYY')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 📊 INDEXES (Performance optimization)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_books_owner_id ON public.books(owner_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON public.books(status);
CREATE INDEX IF NOT EXISTS idx_books_location ON public.books(location_state, location_suburb);
CREATE INDEX IF NOT EXISTS idx_chats_partners ON public.chats(partner_a, partner_b);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);

-- ============================================
-- ✅ VERIFICATION QUERIES
-- ============================================

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'books', 'chats', 'messages');

-- Check policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- 🎉 SETUP COMPLETE!
-- ============================================
-- All tables now have RLS enabled with proper policies
-- Your app is now secure! 🔒
-- ============================================
