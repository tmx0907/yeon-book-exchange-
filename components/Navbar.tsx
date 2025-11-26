import React from 'react';
import { Menu, X, Search, ShoppingBag } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data';

interface NavbarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  setView: (view: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ lang, setLang, setView }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const t = translations[lang];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md">
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
            <button onClick={() => setView('safety')} className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">
              {t.safetyTitle}
            </button>
            <button onClick={() => setView('safety')} className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">
              {t.howItWorks}
            </button>
          </div>

          {/* Right Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <button onClick={() => setView('search')} className="text-slate-400 hover:text-sky-600 transition-colors">
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={() => setLang(lang === 'en' ? 'ko' : 'en')}
              className="text-xs font-semibold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
            >
              {lang === 'en' ? 'KR' : 'EN'}
            </button>
             <button className="text-slate-400 hover:text-sky-600 transition-colors relative">
               <ShoppingBag className="h-5 w-5" />
               <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
             <button className="text-slate-900">
               <Menu className="h-6 w-6" onClick={() => setIsMenuOpen(true)}/>
             </button>
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center md:hidden space-x-4">
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
            <button 
              onClick={() => { setView('safety'); setIsMenuOpen(false); }}
              className="text-left text-lg font-serif text-slate-800"
            >
              {t.safetyTitle}
            </button>
             <button className="text-left text-lg font-serif text-sky-600 font-bold mt-4">
              {t.login}
            </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;