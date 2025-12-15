import React, { useState, useEffect } from 'react';
import { ArrowRight, Lock, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { translations } from '../data';
import { supabase } from '../lib/supabaseClient';

interface PasswordResetProps {
    lang: 'en' | 'ko';
    onBack: () => void;
    onSuccess: () => void;
}

interface PasswordValidation {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
}

const PasswordReset: React.FC<PasswordResetProps> = ({ lang, onBack, onSuccess }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [validation, setValidation] = useState<PasswordValidation>({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false,
    });

    const t = translations[lang];

    // Validate password strength in real-time
    useEffect(() => {
        setValidation({
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        });
    }, [password]);

    const isPasswordValid = Object.values(validation).every(v => v);
    const passwordsMatch = password === confirmPassword && password.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!isPasswordValid) {
            setError(lang === 'ko'
                ? '비밀번호가 모든 보안 요구사항을 충족하지 않습니다.'
                : 'Password does not meet all security requirements.');
            setIsLoading(false);
            return;
        }

        if (!passwordsMatch) {
            setError(lang === 'ko'
                ? '비밀번호가 일치하지 않습니다.'
                : 'Passwords do not match.');
            setIsLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            // Success - redirect to login
            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const ValidationItem = ({ isValid, text }: { isValid: boolean; text: string }) => (
        <div className={`flex items-center gap-2 text-sm transition-colors ${isValid ? 'text-green-600' : 'text-slate-400'
            }`}>
            <div className={`w-1 h-1 rounded-full ${isValid ? 'bg-green-600' : 'bg-slate-300'}`} />
            {text}
        </div>
    );

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
            <div className="absolute top-20 right-[20%] w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-20 left-[20%] w-48 h-48 bg-sky-100/50 rounded-full blur-3xl -z-10"></div>

            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50">
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                        <Lock className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h2 className="mt-2 text-4xl font-serif font-bold text-slate-900 tracking-tight">
                        {lang === 'ko' ? '새 비밀번호 설정' : 'Set New Password'}
                    </h2>
                    <p className="mt-4 text-sm text-slate-500">
                        {lang === 'ko'
                            ? '계정을 보호하기 위해 강력한 비밀번호를 설정하세요.'
                            : 'Create a strong password to protect your account.'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Password Input */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 sm:text-sm transition-all bg-slate-50/30"
                                placeholder={lang === 'ko' ? '새 비밀번호' : 'New Password'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                                ) : (
                                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                                )}
                            </button>
                        </div>

                        {/* Password Strength Indicators */}
                        {password && (
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

                        {/* Confirm Password Input */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 sm:text-sm transition-all bg-slate-50/30"
                                placeholder={lang === 'ko' ? '비밀번호 확인' : 'Confirm Password'}
                            />
                            {confirmPassword && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    {passwordsMatch ? (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-red-400" />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            type="submit"
                            disabled={isLoading || !isPasswordValid || !passwordsMatch}
                            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {lang === 'ko' ? '비밀번호 변경' : 'Reset Password'}
                                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={onBack}
                            className="w-full py-3 px-4 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            {lang === 'ko' ? '로그인으로 돌아가기' : 'Back to Login'}
                        </button>
                    </div>
                </form>

                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
                    <p className="font-semibold mb-1">
                        {lang === 'ko' ? '🔒 보안 안내' : '🔒 Security Notice'}
                    </p>
                    <p>
                        {lang === 'ko'
                            ? '비밀번호는 안전하게 암호화되어 저장되며, 관리자를 포함한 누구도 확인할 수 없습니다.'
                            : 'Your password is securely encrypted and cannot be viewed by anyone, including administrators.'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PasswordReset;
