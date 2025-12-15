import React, { useState } from 'react';
import { ArrowRight, Mail, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { translations } from '../data';
import { supabase } from '../lib/supabaseClient';

interface PasswordResetRequestProps {
    lang: 'en' | 'ko';
    onBack: () => void;
}

const PasswordResetRequest: React.FC<PasswordResetRequestProps> = ({ lang, onBack }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const t = translations[lang];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
                <div className="absolute top-20 right-[20%] w-64 h-64 bg-green-100/50 rounded-full blur-3xl -z-10"></div>
                <div className="absolute bottom-20 left-[20%] w-48 h-48 bg-emerald-100/50 rounded-full blur-3xl -z-10"></div>

                <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50 text-center">
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>

                    <div>
                        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">
                            {lang === 'ko' ? '이메일을 확인하세요' : 'Check Your Email'}
                        </h2>
                        <p className="text-slate-600 mb-2">
                            {lang === 'ko'
                                ? '비밀번호 재설정 링크를 보내드렸습니다:'
                                : 'We sent a password reset link to:'}
                        </p>
                        <p className="font-semibold text-slate-900 mb-6">{email}</p>

                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 text-left space-y-2">
                            <p className="font-semibold">
                                {lang === 'ko' ? '다음 단계:' : 'Next Steps:'}
                            </p>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>{lang === 'ko' ? '이메일을 확인하세요' : 'Check your email inbox'}</li>
                                <li>{lang === 'ko' ? '링크를 클릭하세요 (15분 내 유효)' : 'Click the link (valid for 15 minutes)'}</li>
                                <li>{lang === 'ko' ? '새 비밀번호를 설정하세요' : 'Set your new password'}</li>
                            </ol>
                        </div>

                        <div className="mt-6 text-sm text-slate-500">
                            {lang === 'ko'
                                ? '이메일을 받지 못하셨나요? 스팸 폴더를 확인하세요.'
                                : "Didn't receive the email? Check your spam folder."}
                        </div>
                    </div>

                    <button
                        onClick={onBack}
                        className="w-full py-4 px-4 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                    >
                        {lang === 'ko' ? '로그인으로 돌아가기' : 'Back to Login'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
            <div className="absolute top-20 right-[20%] w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-20 left-[20%] w-48 h-48 bg-sky-100/50 rounded-full blur-3xl -z-10"></div>

            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50">
                <div className="text-center">
                    <h2 className="mt-2 text-4xl font-serif font-bold text-slate-900 tracking-tight">
                        {lang === 'ko' ? '비밀번호 찾기' : 'Forgot Password'}
                    </h2>
                    <p className="mt-4 text-sm text-slate-500">
                        {lang === 'ko'
                            ? '가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.'
                            : 'Enter your email address and we\'ll send you a link to reset your password.'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                        </div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 sm:text-sm transition-all bg-slate-50/30"
                            placeholder={lang === 'ko' ? '이메일 주소' : 'Email Address'}
                        />
                    </div>

                    <div className="space-y-3">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-300 shadow-lg shadow-sky-200 disabled:opacity-70"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {lang === 'ko' ? '재설정 링크 보내기' : 'Send Reset Link'}
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

                {/* Security Information */}
                <div className="border-t border-slate-100 pt-6 space-y-3 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-slate-400 mt-1.5"></div>
                        <p>
                            {lang === 'ko'
                                ? '보안을 위해 재설정 링크는 15분 후 자동으로 만료됩니다.'
                                : 'For security, the reset link will expire in 15 minutes.'}
                        </p>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-slate-400 mt-1.5"></div>
                        <p>
                            {lang === 'ko'
                                ? '본인이 요청하지 않은 경우, 이 이메일을 무시하셔도 됩니다.'
                                : 'If you didn\'t request this, you can safely ignore this message.'}
                        </p>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-slate-400 mt-1.5"></div>
                        <p>
                            {lang === 'ko'
                                ? '기존 비밀번호는 절대 이메일로 전송되지 않습니다.'
                                : 'We will never send your existing password via email.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PasswordResetRequest;
