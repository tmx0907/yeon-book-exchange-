-- ============================================
-- 📊 ACTION LOGS TABLE
-- Yeon Book Exchange - 사용자 행동 로그
-- ============================================
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 1. activity_logs 테이블 생성
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  action_type text NOT NULL, -- 'book_create', 'book_update', 'book_delete', 'login', 'logout', 'account_delete'
  target_type text, -- 'book', 'profile', 'chat'
  target_id uuid,
  target_title text, -- 책 제목 등 (삭제 후에도 기록 유지)
  details jsonb, -- 추가 정보 (변경 전/후 값 등)
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON public.activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- 3. RLS 활성화
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 - 사용자는 자기 로그만 볼 수 있음 (관리자는 모두)
CREATE POLICY "Users can view own logs"
  ON public.activity_logs FOR SELECT
  USING (auth.uid() = user_id);

-- 5. 로그 삽입은 인증된 사용자만
CREATE POLICY "Authenticated users can insert logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ✅ 완료!
-- ============================================
