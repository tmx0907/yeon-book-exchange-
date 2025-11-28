
import React, { useState } from 'react';
import { ArrowRight, Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';
import { translations } from '../data';
import { supabase } from '../lib/supabaseClient';

interface AuthProps {
  lang: 'en' | 'ko';
  onLogin: (userData?: any) => void;
}

const Auth: React.FC<AuthProps> = ({ lang, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  const t = translations[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // --- LOGIN ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        // App.tsx handles the state update via onAuthStateChange
      } else {
        // --- SIGN UP ---
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
        alert("Account created! You are now logged in.");
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
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 sm:text-sm transition-all bg-slate-50/30"
                placeholder={t.password}
              />
            </div>
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
