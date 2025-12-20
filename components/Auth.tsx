
import React, { useState, useEffect } from 'react';
import { ArrowRight, Mail, Lock, User, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { translations } from '../data';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

interface AuthProps {
  lang: 'en' | 'ko';
  onLogin: (userData?: any) => void;
  onForgotPassword?: () => void;
}

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

const Auth: React.FC<AuthProps> = ({ lang, onLogin, onForgotPassword }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [validation, setValidation] = useState<PasswordValidation>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
  });

  const t = translations[lang];

  // Validate password strength in real-time (only during signup)
  useEffect(() => {
    if (!isLogin && formData.password) {
      setValidation({
        minLength: formData.password.length >= 8,
        hasUppercase: /[A-Z]/.test(formData.password),
        hasLowercase: /[a-z]/.test(formData.password),
        hasNumber: /[0-9]/.test(formData.password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
      });
    }
  }, [formData.password, isLogin]);

  // Check for account lockout
  useEffect(() => {
    const lockoutKey = `lockout_${formData.email}`;
    const lockoutData = localStorage.getItem(lockoutKey);

    if (lockoutData) {
      const lockoutEnd = parseInt(lockoutData);
      const now = Date.now();

      if (now < lockoutEnd) {
        setLockoutTime(Math.ceil((lockoutEnd - now) / 1000));
      } else {
        localStorage.removeItem(lockoutKey);
        setLoginAttempts(0);
      }
    }
  }, [formData.email]);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutTime && lockoutTime > 0) {
      const timer = setTimeout(() => {
        setLockoutTime(lockoutTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (lockoutTime === 0) {
      setLockoutTime(null);
      setLoginAttempts(0);
      localStorage.removeItem(`lockout_${formData.email}`);
    }
  }, [lockoutTime, formData.email]);


  const isPasswordValid = !isLogin || Object.values(validation).every(v => v);

  // Helper component for password validation indicators
  const ValidationItem = ({ isValid, text }: { isValid: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-sm transition-colors ${isValid ? 'text-green-600' : 'text-slate-400'
      }`}>
      <div className={`w-1 h-1 rounded-full ${isValid ? 'bg-green-600' : 'bg-slate-300'}`} />
      {text}
    </div>
  );


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Check if account is locked out
    if (lockoutTime && lockoutTime > 0) {
      setError(
        lang === 'ko'
          ? `보안을 위해 ${Math.ceil(lockoutTime / 60)}분 ${lockoutTime % 60}초 후에 다시 시도해주세요.`
          : `Too many attempts. Please try again in ${Math.ceil(lockoutTime / 60)}m ${lockoutTime % 60}s.`
      );
      setIsLoading(false);
      return;
    }
    if (!isSupabaseConfigured) {
      setError(
        lang === 'ko'
          ? '서버 설정 오류: 환경 변수가 누락되었습니다. 관리자에게 문의하세요.'
          : 'Server Configuration Error: Missing environment variables. Please check Vercel settings.'
      );
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // --- LOGIN ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          // Track failed login attempts
          const newAttempts = loginAttempts + 1;
          setLoginAttempts(newAttempts);

          if (newAttempts >= 5) {
            // Lock account for 15 minutes
            const lockoutEnd = Date.now() + (15 * 60 * 1000);
            localStorage.setItem(`lockout_${formData.email}`, lockoutEnd.toString());
            const initialLockoutSeconds = 15 * 60;
            setLockoutTime(initialLockoutSeconds);
            setError(
              lang === 'ko'
                ? `보안을 위해 ${Math.ceil(initialLockoutSeconds / 60)}분 ${initialLockoutSeconds % 60}초 후에 다시 시도해주세요.`
                : `Too many attempts. Please try again in ${Math.ceil(initialLockoutSeconds / 60)}m ${initialLockoutSeconds % 60}s.`
            );
            setIsLoading(false);
            return; // Important: return here to show the message immediately
          }

          throw error;
        }

        // Successful login - reset attempts
        setLoginAttempts(0);
        localStorage.removeItem(`lockout_${formData.email}`);
        // App.tsx handles the state update via onAuthStateChange
      } else {
        // --- SIGN UP ---
        // Validate password strength
        if (!isPasswordValid) {
          throw new Error(
            lang === 'ko'
              ? '비밀번호가 모든 보안 요구사항을 충족하지 않습니다.'
              : 'Password does not meet all security requirements.'
          );
        }

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name, // This is passed to the trigger we made in SQL
            },
          },
        });

        if (error) throw error;

        // Check if email confirmation is required
        if (data.user && !data.session) {
          // Email confirmation required - user created but not logged in
          setSuccessMessage(
            lang === 'ko'
              ? "계정이 생성되었습니다! 이메일을 확인하여 주소를 인증하세요. 인증 링크를 클릭한 후 여기로 돌아와 로그인하세요."
              : "Account created! Please check your email to confirm your address. Click the confirmation link, then come back here to sign in."
          );
          setFormData({ name: '', email: '', password: '' });
          setIsLogin(true); // Switch to login view
        } else if (data.session) {
          // Email confirmation disabled - user is automatically logged in
          setSuccessMessage(
            lang === 'ko'
              ? "계정이 생성되었습니다! 자동으로 로그인됩니다."
              : "Account created! You are now logged in."
          );
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-20 right-[20%] w-64 h-64 bg-sky-100/50 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-20 left-[20%] w-48 h-48 bg-slate-100/50 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50">
        <div className="text-center">
          <h2 className="mt-2 text-4xl font-serif font-bold text-slate-900 tracking-tight">
            {isLogin ? t.welcomeBack : t.joinUs}
          </h2>
          <p className="mt-4 text-sm text-slate-500">
            {isLogin ? t.welcomeBackDesc : t.joinUsDesc}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {successMessage}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 sm:text-sm transition-all bg-slate-50/30"
                  placeholder={t.name}
                />
              </div>
            )}

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              </div>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 sm:text-sm transition-all bg-slate-50/30"
                placeholder={t.email}
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="block w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 sm:text-sm transition-all bg-slate-50/30"
                placeholder={t.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                )}
              </button>
            </div>

            {/* Password Strength Indicators (only during signup) */}
            {!isLogin && formData.password && (
              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  {lang === 'ko' ? '비밀번호 보안 요구사항:' : 'Password Requirements:'}
                </p>
                <ValidationItem
                  isValid={validation.minLength}
                  text={lang === 'ko' ? '최소 8자 이상' : 'At least 8 characters'}
                />
                <ValidationItem
                  isValid={validation.hasUppercase}
                  text={lang === 'ko' ? '대문자 포함 (A-Z)' : 'Uppercase letter (A-Z)'}
                />
                <ValidationItem
                  isValid={validation.hasLowercase}
                  text={lang === 'ko' ? '소문자 포함 (a-z)' : 'Lowercase letter (a-z)'}
                />
                <ValidationItem
                  isValid={validation.hasNumber}
                  text={lang === 'ko' ? '숫자 포함 (0-9)' : 'Number (0-9)'}
                />
                <ValidationItem
                  isValid={validation.hasSpecial}
                  text={lang === 'ko' ? '특수문자 포함 (!@#$...)' : 'Special character (!@#$...)'}
                />
              </div>
            )}

            {/* Forgot Password Link (only during login) */}
            {isLogin && onForgotPassword && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm text-sky-600 hover:text-sky-700 font-medium transition-colors"
                >
                  {lang === 'ko' ? '비밀번호를 잊으셨나요?' : 'Forgot Password?'}
                </button>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-slate-900 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-300 shadow-lg shadow-slate-200 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {isLogin ? t.signIn : t.signUp}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-slate-500">
            {isLogin ? t.dontHaveAccount : t.alreadyHaveAccount}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-sky-600 hover:text-sky-500 transition-colors"
            >
              {isLogin ? t.signUp : t.signIn}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
