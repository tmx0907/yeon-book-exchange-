-- ============================================
-- 📚 책 데이터베이스 확인 및 복구
-- Check Books Database and Recovery
-- ============================================

-- 1. 모든 책 확인 (ALL BOOKS)
-- 삭제된 책도 포함해서 모두 보기
SELECT 
  b.id,
  b.title as "책 제목",
  b.author as "저자",
  b.owner_name as "올린 사람",
  b.status as "상태",
  b.created_at as "업로드 시간",
  u.email as "소유자 이메일"
FROM books b
LEFT JOIN auth.users u ON b.owner_id = u.id
ORDER BY b.created_at DESC;

-- ============================================

-- 2. 책 개수 확인 (COUNT BOOKS)
-- 총 몇 권이 있는지 확인
SELECT 
  COUNT(*) as "총 책 개수",
  COUNT(CASE WHEN status = 'Available' THEN 1 END) as "교환 가능",
  COUNT(CASE WHEN status = 'Swapped' THEN 1 END) as "교환됨"
FROM books;

-- ============================================

-- 3. 사용자별 책 개수 (BOOKS PER USER)
-- 각 사용자가 올린 책 개수
SELECT 
  owner_name as "올린 사람",
  COUNT(*) as "책 개수",
  array_agg(title) as "책 제목들"
FROM books
GROUP BY owner_name
ORDER BY COUNT(*) DESC;

-- ============================================

-- 4. 최근 삭제된 책 확인 (RECENTLY DELETED)
-- 만약 soft delete가 있다면 (현재는 없지만)
-- 또는 audit log가 있다면 확인

-- Supabase는 기본적으로 삭제 로그를 남기지 않지만
-- 다음 쿼리로 남아있는 책을 확인할 수 있어요
SELECT 
  COUNT(*) as "현재 남아있는 책"
FROM books;

-- ============================================

-- 5. 특정 사용자의 책 확인 (YOUR BOOKS)
-- 본인의 이메일로 확인
SELECT 
  b.title as "책 제목",
  b.author as "저자",
  b.condition as "상태",
  b.status as "교환 상태",
  b.created_at as "업로드 시간"
FROM books b
JOIN auth.users u ON b.owner_id = u.id
WHERE u.email = 'your-email@example.com'  -- 여기에 본인 이메일 입력!
ORDER BY b.created_at DESC;

-- ============================================

-- 6. RLS 정책 확인 (CHECK RLS POLICIES)
-- Row Level Security가 제대로 설정되어 있는지
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'books';

-- ============================================

-- 7. 책 데이터 복구 방법 (IF NEEDED)
-- 만약 실수로 삭제했다면, 다시 업로드해야 합니다
-- Supabase는 기본적으로 백업이 없어요 (Pro plan에만 있음)

-- 하지만 Vercel 배포나 로컬 데이터가 있다면 다시 올릴 수 있어요

-- ============================================

-- 8. 테스트: 새 책 추가해보기 (TEST INSERT)
-- 책이 정상적으로 추가되는지 테스트
-- 주의: 실제로 실행하면 테스트 데이터가 추가됩니다!

-- INSERT INTO books (
--   title,
--   author,
--   condition,
--   category,
--   image_url,
--   owner_id,
--   owner_name,
--   location_state,
--   location_suburb,
--   status
-- ) VALUES (
--   'Test Book',
--   'Test Author',
--   'New',
--   'Fiction',
--   'https://example.com/image.jpg',
--   'your-user-id-here',  -- 본인의 user ID
--   'Your Name',
--   'QLD',
--   'Brisbane',
--   'Available'
-- );

-- ============================================

-- 9. RLS 정책 비활성화 (임시로 모든 책 보기)
-- 주의: 이건 임시 테스트용입니다!
-- 보안상 프로덕션에서는 사용하면 안됩니다!

-- ALTER TABLE books DISABLE ROW LEVEL SECURITY;

-- 확인 후 다시 활성화:
-- ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- ============================================

-- 10. 책 데이터 전체 덤프 (BACKUP)
-- 현재 남아있는 모든 책 데이터를 백업용으로 보기
SELECT 
  id,
  title,
  author,
  condition,
  category,
  image_url,
  owner_id,
  owner_name,
  location_state,
  location_suburb,
  status,
  created_at
FROM books
ORDER BY created_at DESC;

-- ============================================
-- 💡 문제 해결 가이드
-- ============================================

-- 문제 1: "책이 안 보여요"
-- → 쿼리 1번 실행해서 DB에 책이 있는지 확인
-- → 있으면: RLS 문제, 없으면: 삭제됨

-- 문제 2: "실수로 삭제했어요"
-- → Supabase 무료 플랜은 백업이 없어요 😢
-- → 다시 업로드해야 합니다
-- → 앞으로는 Pro plan 고려하거나 정기적으로 백업

-- 문제 3: "다른 사람 책은 보이는데 내 책은 안 보여요"
-- → RLS 정책 문제일 수 있어요
-- → 쿼리 6번으로 RLS 정책 확인

-- 문제 4: "갑자기 모든 책이 사라졌어요"
-- → 쿼리 2번으로 총 개수 확인
-- → 0이면: 삭제되었거나 테이블이 비었음
-- → 0이 아니면: RLS나 프론트엔드 문제

-- ============================================
-- 🚨 긴급 복구 방법
-- ============================================

-- 방법 1: 로컬호스트에서 realtime으로 다시 불러오기
-- → 앱을 새로고침하면 Supabase에서 다시 가져옴
-- → 브라우저: Cmd/Ctrl + Shift + R (hard refresh)

-- 방법 2: 다른 브라우저나 시크릿 모드로 확인
-- → 캐시 문제인지 확인

-- 방법 3: Vercel 프로덕션 사이트 확인  
-- → https://yeon-book-exchange.vercel.app
-- → 거기도 없으면 진짜 삭제된 것

-- 방법 4: Supabase Dashboard에서 직접 확인
-- → Table Editor → books → 직접 데이터 확인

-- ============================================
