import React from 'react';
import { translations } from '../data';
import { Translations } from '../types';

interface FooterProps {
  lang: 'en' | 'ko';
  onLinkClick: (view: string) => void;
}

const Footer: React.FC<FooterProps> = ({ lang, onLinkClick }) => {
  const t = translations[lang];

  return (
    <footer className="bg-slate-900 text-slate-300 mt-20">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-slate-800 pb-8">
          <div>
             <h3 className="text-white text-lg font-bold mb-4">HanBook Australia</h3>
             <p className="text-sm text-slate-400">
               Connecting the Korean community in Australia through the joy of reading.
             </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-slate-400">
               <li><button onClick={() => onLinkClick('safety')} className="hover:text-white text-left">Safety Guidelines</button></li>
               <li><a href="#" className="hover:text-white">Safer Exchange Sites (VIC Police)</a></li>
               <li><a href="#" className="hover:text-white">User Reviews</a></li>
            </ul>
          </div>
          <div>
             <h4 className="text-white font-medium mb-4">Legal</h4>
             <ul className="space-y-2 text-sm text-slate-400">
               <li><button onClick={() => onLinkClick('legal')} className="hover:text-white text-left">{t.legal}</button></li>
               <li><button onClick={() => onLinkClick('legal')} className="hover:text-white text-left">Privacy Policy</button></li>
               <li><button onClick={() => onLinkClick('safety')} className="hover:text-white text-left">Damage & Returns</button></li>
             </ul>
          </div>
        </div>
        <div className="pt-8 text-xs text-slate-500 text-center">
           <p className="mb-2">{t.footerDisclaimer}</p>
           <p>&copy; 2024 HanBook Australia. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;