import React from 'react';
import { Shield, Sun, Users, Heart } from 'lucide-react';
import { translations } from '../data';

interface SafetyBannerProps {
  lang: 'en' | 'ko';
}

const SafetyBanner: React.FC<SafetyBannerProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <div className="py-12">
      <div className="text-center mb-16">
        <h2 className="font-serif text-4xl md:text-5xl text-slate-900 mb-6">{t.howItWorks}</h2>
        <div className="w-16 h-1 bg-sky-500 mx-auto rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-4">
        {/* Feature 1 */}
        <div className="flex flex-col items-center text-center group">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-sky-50 transition-colors duration-300">
             <Shield className="w-8 h-8 text-slate-700 group-hover:text-sky-600 transition-colors" />
          </div>
          <h3 className="font-serif text-xl font-bold text-slate-900 mb-3">{t.safetyTitle}</h3>
          <p className="text-slate-500 leading-relaxed max-w-xs">{t.safetyPoint1}</p>
        </div>

        {/* Feature 2 */}
        <div className="flex flex-col items-center text-center group">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-sky-50 transition-colors duration-300">
             <Sun className="w-8 h-8 text-slate-700 group-hover:text-sky-600 transition-colors" />
           </div>
          <h3 className="font-serif text-xl font-bold text-slate-900 mb-3">{t.step2Title}</h3>
          <p className="text-slate-500 leading-relaxed max-w-xs">{t.safetyPoint2}</p>
        </div>

        {/* Feature 3 */}
        <div className="flex flex-col items-center text-center group">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-sky-50 transition-colors duration-300">
             <Heart className="w-8 h-8 text-slate-700 group-hover:text-sky-600 transition-colors" />
           </div>
          <h3 className="font-serif text-xl font-bold text-slate-900 mb-3">{t.step3Title}</h3>
          <p className="text-slate-500 leading-relaxed max-w-xs">{t.safetyPoint3}</p>
        </div>
      </div>

      <div className="mt-16 text-center">
         <p className="text-sm text-slate-400 uppercase tracking-widest mb-2">{t.damagePolicy}</p>
         <p className="text-slate-500">{t.damageDesc}</p>
      </div>
    </div>
  );
};

export default SafetyBanner;