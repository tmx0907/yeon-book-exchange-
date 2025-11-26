import React from 'react';
import { Translations } from '../types';
import { translations } from '../data';
import { Search, ArrowRight } from 'lucide-react';

interface HeroProps {
  lang: 'en' | 'ko';
  onFindBooks: () => void;
}

const Hero: React.FC<HeroProps> = ({ lang, onFindBooks }) => {
  const t = translations[lang];

  return (
    <div className="relative overflow-hidden pt-12 pb-24 lg:pt-20">
      {/* Decorative abstract element */}
      <div className="absolute top-10 right-[10%] w-24 h-24 text-sky-400 opacity-20 transform rotate-12 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="currentColor">
          <path d="M20,50 Q50,0 80,50 T140,50" stroke="currentColor" strokeWidth="12" fill="none" />
        </svg>
      </div>
      
       <div className="absolute top-40 left-[5%] w-12 h-12 rounded-full bg-yellow-200 opacity-30 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6 whitespace-pre-line">
          {t.heroTitle}
        </h1>
        
        <div className="flex justify-center mb-10">
           <div className="h-1 w-24 bg-sky-500 rounded-full"></div>
        </div>

        <p className="mx-auto mt-4 max-w-xl text-lg md:text-xl text-slate-500 leading-relaxed font-light">
          {t.heroSubtitle}
        </p>
        
        <div className="mt-12 flex justify-center gap-4">
          <button 
            onClick={onFindBooks}
            className="group px-8 py-4 bg-sky-600 text-white text-sm font-semibold tracking-widest uppercase hover:bg-sky-700 transition-all duration-300 shadow-xl shadow-sky-200/50 rounded-sm flex items-center"
          >
            {t.findBooks}
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Hero Image / Composition */}
        <div className="mt-20 relative max-w-5xl mx-auto">
           <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-200">
             <div className="aspect-[16/9] md:aspect-[21/9] bg-slate-100 relative">
               <img 
                 src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=2000" 
                 alt="Open book connection" 
                 className="w-full h-full object-cover opacity-90"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent mix-blend-overlay"></div>
             </div>
           </div>
           
           {/* Floating Detail Card */}
           <div className="absolute -bottom-10 -right-4 md:right-10 bg-white p-6 rounded-xl shadow-xl border border-slate-50 max-w-xs text-left hidden md:block">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center text-sky-600">
                    <Search className="w-5 h-5" />
                 </div>
                 <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Find Peace</p>
                    <p className="font-serif text-lg text-slate-800">New arrivals in NSW</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;