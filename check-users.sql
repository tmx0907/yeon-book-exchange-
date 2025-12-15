-- ============================================
-- 🔍 Supabase Users Database Check
-- ============================================
-- Run these queries in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query
-- ============================================

-- 1. VIEW ALL USERS
-- Shows all users in your auth.users table
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  confirmed_at,
  last_sign_in_at,
  raw_user_meta_data->>'name' as name
FROM auth.users
ORDER BY created_at DESC;

-- ============================================

-- 2. COUNT TOTAL USERS
-- Quick overview of how many users you have
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users,
  COUNT(CASE WHEN email_confirmed_at IS NULL THEN 1 END) as unconfirmed_users
FROM auth.users;

-- ============================================

-- 3. FIND SPECIFIC USER BY EMAIL
-- Replace 'your-email@example.com' with the email you're looking for
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at,
  raw_user_meta_data
FROM auth.users
WHERE email = 'your-email@example.com';  -- CHANGE THIS!

-- ============================================

-- 4. VIEW RECENT SIGNUPS (Last 7 days)
-- See who signed up recently
SELECT 
  email,
  raw_user_meta_data->>'name' as name,
  created_at,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed'
    ELSE 'Pending'
  END as status
FROM auth.users
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- ============================================

-- 5. FIND UNCONFIRMED USERS
-- Users who haven't confirmed their email
SELECT 
  email,
  raw_user_meta_data->>'name' as name,
  created_at,
  confirmation_sent_at
FROM auth.users
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;

-- ============================================

-- 6. CHECK FOR TEST/DUPLICATE EMAILS
-- Find emails with 'test', 'example', etc.
SELECT 
  email,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE 
  email LIKE '%test%' OR 
  email LIKE '%example%' OR
  email LIKE '%demo%'
ORDER BY created_at DESC;

-- ============================================

-- 7. VIEW USER PROFILES
-- Check your custom profiles table
SELECT 
  p.id,
  p.name,
  p.email,
  p.suburb,
  p.state,
  p.points,
  p.created_at,
  u.email_confirmed_at
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- ============================================

-- 8. DELETE A SPECIFIC USER (CAREFUL!)
-- Only use this if you need to remove a test account
-- Replace 'user-email@example.com' with the actual email

-- STEP 1: Find the user ID first
SELECT id, email FROM auth.users WHERE email = 'user-email@example.com';

-- STEP 2: Delete from profiles (if exists)
-- DELETE FROM profiles WHERE id = 'paste-user-id-here';

-- STEP 3: Delete from auth.users (will cascade)
-- DELETE FROM auth.users WHERE id = 'paste-user-id-here';

-- ⚠️ WARNING: This is permanent! Make sure you have the right ID!

-- ============================================

-- 9. DELETE ALL TEST USERS (VERY CAREFUL!)
-- Only use this if you want to clean up all test accounts
-- Uncomment to use:

-- DELETE FROM profiles 
-- WHERE email LIKE '%test%' 
-- OR email LIKE '%example%' 
-- OR email LIKE '%demo%';

-- DELETE FROM auth.users 
-- WHERE email LIKE '%test%' 
-- OR email LIKE '%example%' 
-- OR email LIKE '%demo%';

-- ============================================

-- 10. CHECK USER'S BOOKS
-- See what books a user has uploaded
SELECT 
  u.email,
  u.raw_user_meta_data->>'name' as user_name,
  b.title as book_title,
  b.author,
  b.status,
  b.created_at
FROM auth.users u
LEFT JOIN books b ON u.id = b.owner_id
WHERE u.email = 'user-email@example.com'  -- CHANGE THIS!
ORDER BY b.created_at DESC;

-- ============================================

-- 💡 QUICK TIPS:
-- ============================================
-- 1. Always run SELECT queries first before DELETE
-- 2. Copy the user ID before deleting
-- 3. Check both auth.users AND profiles tables
-- 4. Unconfirmed users won't show in your app
-- 5. To re-enable a user, manually set email_confirmed_at

-- ============================================
-- 🔧 TO USE THESE QUERIES:
-- ============================================
-- 1. Go to: https://supabase.com/dashboard
-- 2. Select your project: yeon-book-exchange
-- 3. Click: SQL Editor (in left sidebar)
-- 4. Click: New Query
-- 5. Copy/paste any query above
-- 6. Click: Run (or press Cmd/Ctrl + Enter)
-- 7. View results below!

-- ============================================
