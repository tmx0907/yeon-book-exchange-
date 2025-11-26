
import React from 'react';
import { Menu, X, Search, ShoppingBag, MessageCircle, User, Library } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data';

interface NavbarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  setView: (view: string) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ lang, setLang, setView, isLoggedIn, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const t = translations[lang];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
        <div className="flex justify-between items-center h-24">
          
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer" onClick={() => setView('home')}>
            <span className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
              {t.appTitle}<span className="text-sky-500"></span>
            </span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-12">
             <button onClick={() => setView('home')} className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">
              Home
            </button>
             <button onClick={() => setView('search')} className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">
              {t.findBooks}
            </button>
            {isLoggedIn && (
              <button onClick={() => setView('profile')} className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">
                {t.profile}
              </button>
            )}
            <button onClick={() => setView('safety')} className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">
              {t.safetyTitle}
            </button>
          </div>

          {/* Right Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <button onClick={() => setView('search')} className="text-slate-400 hover:text-sky-600 transition-colors">
              <Search className="h-5 w-5" />
            </button>
            
            <button onClick={() => setView('messages')} className="text-slate-400 hover:text-sky-600 transition-colors relative">
               <MessageCircle className="h-5 w-5" />
               {isLoggedIn && <span className="absolute -top-1 -right-1 h-2 w-2 bg-sky-500 rounded-full border border-white"></span>}
            </button>

            <button
              onClick={() => setLang(lang === 'en' ? 'ko' : 'en')}
              className="text-xs font-semibold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
            >
              {lang === 'en' ? 'KR' : 'EN'}
            </button>

            {isLoggedIn ? (
              <div className="relative group">
                <button className="flex items-center gap-2 text-slate-900 hover:text-sky-600 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                </button>
                {/* Dropdown for profile/logout */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-slate-100 hidden group-hover:block">
                  <button onClick={() => setView('profile')} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    {t.profile}
                  </button>
                  <button onClick={() => setView('my-library')} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    {t.myLibrary}
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    {t.logout}
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setView('login')}
                className="text-sm font-medium text-slate-900 hover:text-sky-600 transition-colors"
              >
                {t.login}
              </button>
            )}
            
             <button className="text-slate-900 md:hidden">
               <Menu className="h-6 w-6" onClick={() => setIsMenuOpen(true)}/>
             </button>
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center md:hidden space-x-4">
             <button
              onClick={() => setView('messages')}
              className="text-slate-400 relative"
            >
              <MessageCircle className="h-6 w-6" />
              {isLoggedIn && <span className="absolute -top-1 -right-1 h-2 w-2 bg-sky-500 rounded-full border border-white"></span>}
            </button>
             <button
              onClick={() => setLang(lang === 'en' ? 'ko' : 'en')}
              className="text-xs font-semibold text-slate-500 uppercase"
            >
              {lang === 'en' ? 'KR' : 'EN'}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-900 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white absolute top-24 left-0 w-full shadow-xl py-6 px-6 flex flex-col space-y-4">
            <button 
              onClick={() => { setView('search'); setIsMenuOpen(false); }}
              className="text-left text-lg font-serif text-slate-800"
            >
              {t.findBooks}
            </button>
             {isLoggedIn && (
               <button 
                onClick={() => { setView('profile'); setIsMenuOpen(false); }}
                className="text-left text-lg font-serif text-slate-800"
              >
                {t.profile}
              </button>
             )}
            <button 
              onClick={() => { setView('safety'); setIsMenuOpen(false); }}
              className="text-left text-lg font-serif text-slate-800"
            >
              {t.safetyTitle}
            </button>
            <button 
              onClick={() => { setView('messages'); setIsMenuOpen(false); }}
              className="text-left text-lg font-serif text-slate-800"
            >
              {t.messages}
            </button>
            {isLoggedIn ? (
               <button 
                onClick={() => { onLogout(); setIsMenuOpen(false); }}
                className="text-left text-lg font-serif text-slate-500 mt-4"
              >
                {t.logout}
              </button>
            ) : (
               <button 
                onClick={() => { setView('login'); setIsMenuOpen(false); }}
                className="text-left text-lg font-serif text-sky-600 font-bold mt-4"
              >
                {t.login}
              </button>
            )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
