-- ============================================
-- 📚 CREATE BOOKS TABLE
-- Yeon Book Exchange - Books 테이블 생성
-- ============================================
-- Supabase SQL Editor에서 실행하세요!
-- ============================================

-- 1. books 테이블 생성
CREATE TABLE IF NOT EXISTS public.books (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  author text NOT NULL,
  condition text NOT NULL CHECK (condition IN ('New', 'Like New')),
  category text,
  image_url text,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_name text NOT NULL,
  location_state text NOT NULL,
  location_suburb text NOT NULL,
  status text DEFAULT 'Available' CHECK (status IN ('Available', 'Swapped')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================

-- 2. RLS (Row Level Security) 활성화
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- ============================================

-- 3. RLS 정책 생성

-- 모든 사람이 Available 책을 볼 수 있음
CREATE POLICY "Anyone can view available books"
  ON public.books
  FOR SELECT
  USING (status = 'Available' OR auth.uid() = owner_id);

-- 사용자는 자신의 책을 insert할 수 있음
CREATE POLICY "Users can insert their own books"
  ON public.books
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- 사용자는 자신의 책을 update할 수 있음
CREATE POLICY "Users can update their own books"
  ON public.books
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- 사용자는 자신의 책을 delete할 수 있음
CREATE POLICY "Users can delete their own books"
  ON public.books
  FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================

-- 4. 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_books_owner_id ON public.books(owner_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON public.books(status);
CREATE INDEX IF NOT EXISTS idx_books_location ON public.books(location_state, location_suburb);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON public.books(created_at DESC);

-- ============================================

-- 5. updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================

-- 6. Realtime 활성화 (선택사항)
-- Supabase Dashboard에서 설정해야 합니다:
-- Database → Replication → books 테이블 선택 → Enable

-- ============================================

-- 7. 확인: 테이블이 제대로 생성되었는지
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'books'
ORDER BY ordinal_position;

-- ============================================

-- 8. 확인: RLS 정책이 제대로 생성되었는지
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'books';

-- ============================================
-- ✅ 완료!
-- ============================================
-- 이제 앱에서 책을 다시 업로드할 수 있습니다!
-- ============================================
