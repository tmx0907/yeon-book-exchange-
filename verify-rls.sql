-- ============================================================================
-- RLS VERIFICATION QUERIES
-- ============================================================================
-- Run these queries in Supabase SQL Editor to verify RLS is working
-- ============================================================================

-- ============================================================================
-- 1. CHECK IF RLS IS ENABLED ON ALL TABLES
-- ============================================================================

SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected Result: All tables should have rls_enabled = true
-- ✅ profiles   | true
-- ✅ books      | true
-- ✅ chats      | true
-- ✅ messages   | true

-- ============================================================================
-- 2. LIST ALL RLS POLICIES
-- ============================================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Expected Result: You should see policies for each table
-- Minimum expected policies:
-- - profiles: 3 policies (SELECT, INSERT, UPDATE)
-- - books: 4 policies (SELECT, INSERT, UPDATE, DELETE)
-- - chats: 3 policies (SELECT, INSERT, UPDATE)
-- - messages: 2 policies (SELECT, INSERT)

-- ============================================================================
-- 3. COUNT POLICIES PER TABLE
-- ============================================================================

SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Expected Result:
-- books     | 4
-- chats     | 3
-- messages  | 2
-- profiles  | 3

-- ============================================================================
-- 4. CHECK HANDLE_NEW_USER FUNCTION (search_path fix)
-- ============================================================================

SELECT 
  proname as function_name,
  prosecdef as is_security_definer,
  proconfig as configuration
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Expected Result:
-- function_name     | is_security_definer | configuration
-- handle_new_user   | true                | {search_path=public}
--
-- The configuration should show {search_path=public} which means it's immutable

-- ============================================================================
-- 5. TEST PUBLIC ACCESS (as anonymous user)
-- ============================================================================
-- This simulates what an unauthenticated user can see

-- Try to view profiles (should work - public data)
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- Try to view books (should work - marketplace is public)
SELECT COUNT(*) as total_books FROM public.books;

-- ============================================================================
-- 6. VIEW EXISTING DATA
-- ============================================================================

-- View all profiles
SELECT 
  id,
  email,
  name,
  state,
  suburb,
  points,
  join_date
FROM public.profiles
ORDER BY join_date DESC;

-- View all books
SELECT 
  id,
  title,
  author,
  owner_id,
  status,
  points,
  created_at
FROM public.books
ORDER BY created_at DESC;

-- ============================================================================
-- 7. CHECK FOR USERS
-- ============================================================================

-- View users from auth schema (requires admin access)
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- ============================================================================
-- INTERPRETATION GUIDE
-- ============================================================================

/*
✅ GOOD SIGNS:
- All tables show rowsecurity = true
- You see policies listed for each table
- handle_new_user has configuration = {search_path=public}
- You can view profiles and books
- No error messages

❌ BAD SIGNS:
- Any table shows rowsecurity = false
- Missing policies for any table
- handle_new_user configuration is NULL or empty
- Errors when trying to view data

NOTES:
- If you're logged in as the Supabase admin/owner, you can see all data
- To properly test RLS, use the testing tool at test-rls-security.html
- That tool simulates actual user access with proper authentication
*/
