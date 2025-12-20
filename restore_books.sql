-- ============================================
-- 🛠️ REASSIGN BOOKS TO CURRENT USER
-- 책 주인 재설정 (복구 스크립트)
-- ============================================

-- 1. FIRST, FIND YOUR NEW USER ID
-- 먼저, 현재 로그인된 사용자의 ID를 찾으세요.
-- 가장 최근에 생성된(또는 로그인한) 사용자가 본인일 확률이 높습니다.
SELECT 
  id, 
  email, 
  created_at, 
  last_sign_in_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 💡 Copy the 'id' (UUID) from the result above.
-- 위의 결과에서 본인의 'id'를 복사하세요. (예: 'a0eebc99-9c0b-...')

-- ============================================

-- 2. CHECK ORPHANED BOOKS
-- 주인을 잃어버린 책들이 있는지 확인합니다.
-- Owner ID, Owner Name, Title을 확인하여 내 책인지 보세요.
SELECT 
  id, 
  title, 
  owner_name, 
  owner_id, 
  created_at 
FROM public.books 
ORDER BY created_at DESC;

-- ============================================

-- 3. REASSIGN BOOKS (UPDATE)
-- ⚠️ CAUTION: Replace 'YOUR_NEW_UUID_HERE' with the ID you copied in Step 1.
-- ⚠️ 주의: 아래 'YOUR_NEW_UUID_HERE' 부분을 1번 단계에서 복사한 ID로 바꾸세요.

-- Example:
-- UPDATE public.books SET owner_id = 'a0eebc99-9c0b-...' WHERE owner_name = 'MyName';

-- Option A: Reassign ALL books (if you are the only user)
-- 개발용: 모든 책을 내 것으로 변경
/* 
UPDATE public.books 
SET owner_id = 'YOUR_NEW_UUID_HERE'; 
*/

-- Option B: Reassign by Name (Safest)
-- 이름으로 매칭하여 변경 (추천)
/* 
UPDATE public.books 
SET owner_id = 'YOUR_NEW_UUID_HERE' 
WHERE owner_name = 'Jungeun'; -- Change this to your name
*/

-- Option C: Reassign specific book IDs
-- 특정 책만 변경
/* 
UPDATE public.books 
SET owner_id = 'YOUR_NEW_UUID_HERE' 
WHERE id IN ('book-uuid-1', 'book-uuid-2'); 
*/

-- ============================================
