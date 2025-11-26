
import React, { useState } from 'react';
import { ArrowRight, Mail, Lock, User } from 'lucide-react';
import { translations } from '../data';

interface AuthProps {
  lang: 'en' | 'ko';
  onLogin: (userData?: { name: string; email: string }) => void;
}

const Auth: React.FC<AuthProps> = ({ lang, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  const t = translations[lang];

  const deriveNameFromEmail = (email: string) => {
    // Splits "john.doe@email.com" into "John Doe"
    if (!email) return 'User';
    const localPart = email.split('@')[0];
    return localPart
      .split(/[._]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If logging in, we simulate finding the user by deriving a name from the email
    // If signing up, we use the provided name
    const nameToUse = isLogin ? deriveNameFromEmail(formData.email) : formData.name;
    
    onLogin({ 
      name: nameToUse, 
      email: formData.email 
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background decoration */}
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
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-slate-900 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-300 shadow-lg shadow-slate-200"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                 {/* Icon if needed */}
              </span>
              {isLogin ? t.signIn : t.signUp}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
