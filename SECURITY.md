# 🔐 Security & Privacy - Yeon Book Exchange

## How We Protect Your Data / 데이터 보호 방법

---

## Password Security / 비밀번호 보안

### How Passwords Are Stored / 비밀번호 저장 방식

**English:**
- Your password is **never** stored in plain text
- We use **bcrypt** hashing with salt - a military-grade encryption method
- Even administrators cannot see your password
- Each user's password is encrypted with a unique "salt" value
- This means even if two users have the same password, they appear completely different in our database

**한국어:**
- 비밀번호는 **절대** 원본 그대로 저장되지 않습니다
- **bcrypt** 해싱과 솔트를 사용하는 군사급 암호화 방식을 사용합니다
- 관리자조차도 귀하의 비밀번호를 볼 수 없습니다
- 각 사용자의 비밀번호는 고유한 "솔트" 값으로 암호화됩니다
- 즉, 두 명의 사용자가 같은 비밀번호를 사용하더라도 데이터베이스에는 완전히 다르게 보입니다

### Password Requirements / 비밀번호 요구사항

**English:**
To ensure your account is secure, your password must contain:
- ✅ At least 8 characters
- ✅ One uppercase letter (A-Z)
- ✅ One lowercase letter (a-z)
- ✅ One number (0-9)
- ✅ One special character (!@#$%^&*...)

**한국어:**
계정을 안전하게 보호하기 위해 비밀번호는 다음을 포함해야 합니다:
- ✅ 최소 8자 이상
- ✅ 대문자 (A-Z)
- ✅ 소문자 (a-z)
- ✅ 숫자 (0-9)
- ✅ 특수문자 (!@#$%^&*...)

---

## Password Reset / 비밀번호 재설정

### Secure Reset Process / 안전한 재설정 절차

**English:**
1. Click "Forgot Password?" on the login page
2. Enter your email address
3. We send you a **secure, time-limited link** (expires in 15 minutes)
4. Click the link to set a new password
5. Your old password is **never sent via email**

**🔒 Security Note:**
- The reset link can only be used once
- The link expires after 15 minutes for your security
- If you didn't request this, you can safely ignore it
- After clicking the link, your old password immediately stops working

**한국어:**
1. 로그인 페이지에서 "비밀번호를 잊으셨나요?" 클릭
2. 이메일 주소 입력
3. **안전한 시간 제한 링크** 를 보내드립니다 (15분 후 만료)
4. 링크를 클릭하여 새 비밀번호 설정
5. 기존 비밀번호는 **절대 이메일로 전송되지 않습니다**

**🔒 보안 안내:**
- 재설정 링크는 한 번만 사용할 수 있습니다
- 링크는 보안을 위해 15분 후 만료됩니다
- 본인이 요청하지 않은 경우, 무시하셔도 안전합니다
- 링크를 클릭하면 기존 비밀번호는 즉시 사용 불가능해집니다

---

## Login Security / 로그인 보안

### Login Attempt Limiting / 로그인 시도 제한

**English:**
- Maximum **5 failed login attempts** allowed
- After 5 failed attempts, account is locked for **15 minutes**
- This protects against automated hacking attempts
- Countdown timer shows when you can try again

**한국어:**
- 최대 **5번의 실패한 로그인 시도**가 허용됩니다
- 5번 실패 후 계정이 **15분 동안** 잠깁니다
- 자동화된 해킹 시도로부터 보호합니다
- 카운트다운 타이머가 재시도 가능 시간을 표시합니다

### Session Management / 세션 관리

**English:**
- You are automatically logged in after successful authentication
- Your session is stored securely in your browser
- When you log out, your session token is immediately invalidated
- Sessions are managed by Supabase with JWT (JSON Web Tokens)

**한국어:**
- 인증 성공 후 자동으로 로그인됩니다
- 세션은 브라우저에 안전하게 저장됩니다
- 로그아웃하면 세션 토큰이 즉시 무효화됩니다
- 세션은 Supabase가 JWT (JSON Web Token)로 관리합니다

---

## Personal Data Protection / 개인정보 보호

### What We Collect (Minimal Data) / 수집하는 정보 (최소한)

**English:**
We only collect what's absolutely necessary:
- ✅ **Name** - to identify you in exchanges
- ✅ **Email** - for account verification and communication
- ✅ **Location** (Suburb & State) - to facilitate local book exchanges
- ❌ **Not collected**: Phone number, address, ID documents

**한국어:**
절대적으로 필요한 정보만 수집합니다:
- ✅ **이름** - 교환 시 귀하를 식별하기 위해
- ✅ **이메일** - 계정 인증 및 커뮤니케이션을 위해
- ✅ **위치** (시·도) - 지역 도서 교환을 용이하게 하기 위해
- ❌ **수집하지 않음**: 전화번호, 주소, 신분증

### Data Encryption / 데이터 암호화

**English:**
- **At Rest**: All data in our database is encrypted (AES-256)
- **In Transit**: All communication uses HTTPS/TLS encryption
- **Access Control**: Row Level Security (RLS) ensures you can only access your own data

**한국어:**
- **저장 시**: 데이터베이스의 모든 데이터가 암호화됩니다 (AES-256)
- **전송 시**: 모든 통신은 HTTPS/TLS 암호화를 사용합니다
- **접근 제어**: 행 수준 보안(RLS)으로 본인 데이터만 접근 가능합니다

### Row Level Security (RLS) / 행 수준 보안

**English:**
Every database query is automatically filtered to ensure:
- You can only view your own profile data
- You can only edit books you uploaded
- You can only read messages in your conversations
- You cannot access other users' private information

**한국어:**
모든 데이터베이스 쿼리는 자동으로 필터링되어 다음을 보장합니다:
- 본인의 프로필 데이터만 볼 수 있습니다
- 본인이 업로드한 책만 편집할 수 있습니다
- 본인의 대화 메시지만 읽을 수 있습니다
- 다른 사용자의 개인 정보에는 접근할 수 없습니다

---

## What We Will NEVER Do / 절대 하지 않는 것

**English:**
- ❌ **Never** share your password with you (because we don't know it)
- ❌ **Never** send passwords via email
- ❌ **Never** sell your data to third parties
- ❌ **Never** ask for your password in messages or emails
- ❌ **Never** store credit card information (if payment is added)

**한국어:**
- ❌ 비밀번호를 귀하에게 알려주지 **절대** 않습니다 (우리도 모르기 때문에)
- ❌ 비밀번호를 이메일로 **절대** 보내지 않습니다
- ❌ 귀하의 데이터를 제3자에게 **절대** 판매하지 않습니다
- ❌ 메시지나 이메일로 비밀번호를 **절대** 요청하지 않습니다
- ❌ 신용카드 정보를 **절대** 저장하지 않습니다 (결제 기능 추가 시)

---

## In Case of Security Concerns / 보안 문제 발생 시

### What to Do / 할 일

**English:**
If you suspect your account has been compromised:
1. **Immediately change your password** using the "Forgot Password?" flow
2. Log out of all devices
3. Check your account activity
4. Contact support if you notice unauthorized actions

**한국어:**
계정이 손상되었다고 의심되는 경우:
1. "비밀번호를 잊으셨나요?" 기능을 사용하여 **즉시 비밀번호 변경**
2. 모든 기기에서 로그아웃
3. 계정 활동 확인
4. 무단 행위가 발견되면 지원팀에 문의

---

## Technical Security Stack / 기술 보안 스택

**English:**
We use industry-standard security:
- **Supabase** - Enterprise-grade backend with built-in security
- **bcrypt** - Password hashing (used by major companies)
- **HTTPS/TLS** - Encrypted data transmission
- **JWT** - Secure session management
- **PostgreSQL RLS** - Database-level access control
- **Regular Updates** - Security patches applied promptly

**한국어:**
업계 표준 보안을 사용합니다:
- **Supabase** - 내장 보안 기능이 있는 엔터프라이즈급 백엔드
- **bcrypt** - 비밀번호 해싱 (주요 기업이 사용)
- **HTTPS/TLS** - 암호화된 데이터 전송
- **JWT** - 안전한 세션 관리
- **PostgreSQL RLS** - 데이터베이스 수준 접근 제어
- **정기 업데이트** - 보안 패치 즉시 적용

---

## Compliance / 규정 준수

**English:**
We follow security best practices including:
- ✅ Password must never be visible to administrators
- ✅ Encrypted storage and transmission
- ✅ Minimal data collection principle
- ✅ User consent for data usage
- ✅ Right to delete account and data
- ✅ Transparent privacy policy

**한국어:**
다음을 포함한 보안 모범 사례를 따릅니다:
- ✅ 비밀번호는 관리자에게 절대 표시되지 않음
- ✅ 암호화된 저장 및 전송
- ✅ 최소 데이터 수집 원칙
- ✅ 데이터 사용에 대한 사용자 동의
- ✅ 계정 및 데이터 삭제 권리
- ✅ 투명한 개인정보 보호정책

---

## Questions? / 질문이 있으신가요?

**English:**
If you have any security or privacy questions, please don't hesitate to contact us.

Your trust and data security are our top priorities.

**한국어:**
보안이나 개인정보 보호에 대해 궁금한 점이 있으시면 언제든지 문의하세요.

귀하의 신뢰와 데이터 보안은 우리의 최우선 과제입니다.

---

**Last Updated:** December 2024  
**마지막 업데이트:** 2024년 12월
