-- ============================================================================
-- YEON BOOK EXCHANGE - SECURITY FIX SCRIPT
-- ============================================================================
-- This script fixes all security issues flagged by Supabase:
-- 1. Enables RLS on all tables
-- 2. Fixes the search_path issue in handle_new_user function
-- 3. Sets up proper RLS policies
-- ============================================================================

-- ============================================================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================================================

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on books table
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Enable RLS on chats table
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Enable RLS on messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. DROP EXISTING POLICIES (IF ANY)
-- ============================================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

DROP POLICY IF EXISTS "Books are viewable by everyone" ON public.books;
DROP POLICY IF EXISTS "Users can insert their own books" ON public.books;
DROP POLICY IF EXISTS "Users can update their own books" ON public.books;

DROP POLICY IF EXISTS "Users can view their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can insert chats" ON public.chats;
DROP POLICY IF EXISTS "Users can update their own chats" ON public.chats;

DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages in their chats" ON public.messages;

-- ============================================================================
-- 3. CREATE RLS POLICIES FOR PROFILES
-- ============================================================================

-- Everyone can view all profiles (public data)
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

-- Users can only insert their own profile
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- ============================================================================
-- 4. CREATE RLS POLICIES FOR BOOKS
-- ============================================================================

-- Everyone can view all books (marketplace is public)
CREATE POLICY "Books are viewable by everyone" 
  ON public.books FOR SELECT 
  USING (true);

-- Users can only add books they own
CREATE POLICY "Users can insert their own books" 
  ON public.books FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

-- Users can only update their own books
CREATE POLICY "Users can update their own books" 
  ON public.books FOR UPDATE 
  USING (auth.uid() = owner_id);

-- Users can only delete their own books
CREATE POLICY "Users can delete their own books" 
  ON public.books FOR DELETE 
  USING (auth.uid() = owner_id);

-- ============================================================================
-- 5. CREATE RLS POLICIES FOR CHATS
-- ============================================================================

-- Users can only view chats they're part of
CREATE POLICY "Users can view their own chats" 
  ON public.chats FOR SELECT 
  USING (auth.uid() = partner_a OR auth.uid() = partner_b);

-- Users can only create chats where they're one of the partners
CREATE POLICY "Users can insert chats" 
  ON public.chats FOR INSERT 
  WITH CHECK (auth.uid() = partner_a OR auth.uid() = partner_b);

-- Users can only update chats they're part of
CREATE POLICY "Users can update their own chats" 
  ON public.chats FOR UPDATE 
  USING (auth.uid() = partner_a OR auth.uid() = partner_b);

-- ============================================================================
-- 6. CREATE RLS POLICIES FOR MESSAGES
-- ============================================================================

-- Users can only view messages in chats they're part of
CREATE POLICY "Users can view messages in their chats" 
  ON public.messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE id = messages.chat_id
      AND (partner_a = auth.uid() OR partner_b = auth.uid())
    )
  );

-- Users can only send messages in chats they're part of
CREATE POLICY "Users can insert messages in their chats" 
  ON public.messages FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE id = messages.chat_id
      AND (partner_a = auth.uid() OR partner_b = auth.uid())
    )
    AND sender_id = auth.uid()
  );

-- ============================================================================
-- 7. FIX HANDLE_NEW_USER FUNCTION (search_path issue)
-- ============================================================================

-- Recreate the function with a fixed search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'name', 
    'https://i.pravatar.cc/150?u=' || new.email
  );
  RETURN new;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- 8. VERIFY RLS IS ENABLED
-- ============================================================================

-- You can verify RLS is enabled by running this query in Supabase SQL Editor:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- All tables should show rowsecurity = true

-- ============================================================================
-- END OF SECURITY FIX SCRIPT
-- ============================================================================
