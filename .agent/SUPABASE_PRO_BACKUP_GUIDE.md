# 🔄 Supabase Pro - 자동 백업 설정 가이드
# Automatic Backup Configuration Guide

## ✨ Supabase Pro 백업 기능

Supabase Pro는 두 가지 백업 방식을 제공합니다:
1. **Daily Backups** (일일 백업) - 매일 자동 백업
2. **Point-in-Time Recovery (PITR)** - 시간 되돌리기

---

## 📋 1. Daily Backups 확인 및 설정

### ✅ Step 1: Supabase Dashboard 열기
1. https://supabase.com/dashboard
2. 프로젝트 선택: `yeon-book-exchange`

### ✅ Step 2: Database Settings로 이동
1. 왼쪽 사이드바에서 **Settings** (⚙️) 클릭
2. **Database** 클릭

### ✅ Step 3: Backups 섹션 확인
**"Backups" 섹션을 찾으세요:**

**확인 사항:**
- ✅ **Daily backups:** Enabled (Pro 플랜은 자동 활성화)
- ✅ **Retention:** 7 days (Pro 플랜 기본값)
- ✅ **Last backup:** 최근 백업 시간 확인

**위치:**
```
Dashboard → Settings → Database → Backups
```

---

## ⏰ 2. Point-in-Time Recovery (PITR) 활성화

### 🎯 PITR이란?
- 원하는 특정 시점으로 데이터베이스를 복원
- 예: "어제 오후 3시 30분 상태로 돌아가기"
- **최대 7일 전까지** 복원 가능 (Pro 플랜)

### ✅ PITR 활성화 방법:

#### Step 1: Database Settings 이동
```
Dashboard → Settings → Database
```

#### Step 2: PITR 섹션 찾기
**"Point in Time Recovery" 또는 "PITR" 섹션 확인**

#### Step 3: Enable PITR
- **Toggle 버튼**을 켜기 (Enable)
- 확인 메시지 나오면 **Confirm** 클릭

**주의:** 
- PITR을 활성화하면 약간의 성능 영향이 있을 수 있어요
- 하지만 데이터 보호를 위해 **강력히 추천**합니다!

---

## 💾 3. 수동 백업 생성 (추가 보호)

### 방법 1: Supabase Dashboard에서

#### ✅ 즉시 백업 생성:
```
Dashboard → Settings → Database → Backups
→ "Create backup now" 버튼 클릭
```

### 방법 2: SQL로 데이터 내보내기

#### ✅ SQL Editor에서 실행:

```sql
-- 모든 books 데이터를 CSV로 내보내기
COPY (
  SELECT * FROM books
) TO '/tmp/books_backup.csv' WITH CSV HEADER;
```

또는 직접 쿼리 결과를 저장:

```sql
-- 모든 데이터 조회 후 수동으로 저장
SELECT * FROM books;
-- 결과를 CSV로 내보내기 (Dashboard에서 Download 버튼)
```

---

## 🔙 4. 백업에서 복원하는 방법

### 📅 Daily Backup에서 복원:

#### Step 1: Backups 페이지 이동
```
Dashboard → Settings → Database → Backups
```

#### Step 2: 복원할 백업 선택
- 백업 목록에서 원하는 날짜 선택
- **"Restore"** 버튼 클릭

#### Step 3: 확인
- ⚠️ **경고:** 기존 데이터가 백업 시점으로 대체됩니다!
- **"I understand, restore backup"** 클릭

### ⏰ PITR로 복원 (시간 되돌리기):

#### Step 1: PITR 페이지 이동
```
Dashboard → Settings → Database → Point in Time Recovery
```

#### Step 2: 시간 선택
- 날짜와 시간을 선택 (최대 7일 전)
- 예: "2024-12-14 15:30:00"

#### Step 3: 복원 실행
- **"Restore to this point"** 클릭
- 확인 메시지에서 **Confirm**

---

## 🗓️ 5. 백업 스케줄 및 보관 기간

### Pro 플랜 기본 설정:
```
Daily Backups:
├─ Frequency: 매일 1회 (자동)
├─ Time: UTC 기준 자동 시간
├─ Retention: 7일 보관
└─ Storage: 무제한

PITR:
├─ Window: 7일
├─ Granularity: 1초 단위
└─ Restore Time: ~10-30분
```

### 백업 보관 기간 연장 (Enterprise만 가능):
- Pro 플랜: 7일 고정
- Enterprise: 30일+ 가능

---

## 📊 6. 백업 모니터링

### ✅ 정기적으로 확인하세요:

#### 매주 확인할 것:
```
1. Dashboard → Settings → Database → Backups
2. "Last backup" 시간 확인
3. 최근 7일 백업이 모두 있는지 확인
```

#### 백업 알림 설정:
```
Dashboard → Settings → Notifications
→ "Database backups" 알림 켜기
```

---

## 💡 7. 추가 백업 전략 (권장)

### 🔸 로컬 백업도 만들기:

#### 방법 1: PostgreSQL pg_dump 사용

```bash
# 터미널에서 실행
pg_dump \
  --host=db.YOUR_PROJECT_REF.supabase.co \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --no-owner \
  --no-acl \
  --file=backup_$(date +%Y%m%d).sql

# 비밀번호 입력: Supabase Database Password
```

#### 방법 2: 정기적으로 SQL 쿼리 결과 저장

```sql
-- 중요한 테이블들을 정기적으로 백업
SELECT * FROM books;      -- 결과를 CSV로 저장
SELECT * FROM profiles;   -- 결과를 CSV로 저장
SELECT * FROM chats;      -- 결과를 CSV로 저장
```

### 🔸 Git으로 스키마 관리:

```sql
-- 스키마를 SQL 파일로 저장하고 Git에 커밋
-- create-books-table.sql (이미 있음!)
-- create-profiles-table.sql
-- 등등...
```

---

## 🚨 8. 긴급 복구 시나리오

### 시나리오 1: "방금 실수로 데이터 삭제했어요!" (30분 이내)

**해결:**
```
1. Dashboard → Settings → Database → PITR
2. 삭제 직전 시간 선택 (예: 5분 전)
3. Restore 클릭
4. 10-30분 대기
5. 복구 완료!
```

### 시나리오 2: "어제 삭제한 데이터를 복구하고 싶어요"

**해결:**
```
Option 1 - PITR 사용 (7일 이내):
1. 정확한 시간을 알면 → PITR로 복원
2. 시간 모르면 → Daily backup으로 복원

Option 2 - Daily Backup 사용:
1. Dashboard → Backups
2. 어제 날짜의 백업 선택
3. Restore 클릭
```

### 시나리오 3: "테이블 전체가 없어졌어요!" (지금!)

**해결:**
```
즉시 조치:
1. create-books-table.sql 실행 (테이블 재생성)
2. 가장 최근 backup에서 복원
3. 또는 PITR로 문제 발생 직전으로 복원
```

---

## ✅ 9. 백업 체크리스트

### 일일 체크:
- [ ] 앱이 정상 작동하는지 확인
- [ ] 중요 데이터 변경 시 수동 백업 고려

### 주간 체크:
- [ ] Supabase Dashboard에서 최근 백업 확인
- [ ] 백업이 정상적으로 생성되고 있는지 확인
- [ ] PITR이 활성화되어 있는지 확인

### 월간 체크:
- [ ] 백업 복원 테스트 (중요!)
- [ ] 로컬 백업 파일 정리
- [ ] 스키마 변경사항 Git 커밋

---

## 🎯 10. 즉시 실행할 것 (지금!)

### ✅ Step 1: PITR 활성화
```
1. Dashboard → Settings → Database
2. "Point in Time Recovery" 섹션 찾기
3. Toggle ON
4. Confirm
```

### ✅ Step 2: 백업 알림 켜기
```
1. Dashboard → Settings → Notifications  
2. "Database backups" 체크
3. Save
```

### ✅ Step 3: 즉시 백업 생성
```
1. Dashboard → Settings → Database → Backups
2. "Create backup now" 클릭
3. 백업이 생성될 때까지 대기 (1-5분)
```

### ✅ Step 4: Books 테이블 복구
```
1. SQL Editor 열기
2. create-books-table.sql 내용 실행
3. Table Editor에서 테이블 생성 확인
```

---

## 📞 Support

문제가 있으면:
- Supabase Support: support@supabase.io
- Supabase Discord: https://discord.supabase.com
- Documentation: https://supabase.com/docs/guides/platform/backups

---

## 🎉 요약

**Supabase Pro 백업 = 자동으로 됩니다!**
- ✅ Daily backups: 자동 (7일 보관)
- ✅ PITR: 활성화만 하면 됨 (7일 window)
- ✅ 복원: 클릭 몇 번으로 가능

**지금 바로 하세요:**
1. PITR 활성화
2. 백업 알림 켜기
3. Books 테이블 재생성

---

**데이터 손실 걱정 끝!** 🎊
