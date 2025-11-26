
import React, { useState } from 'react';
import { translations } from '../data';
import { Shield, Lock, BookOpen } from 'lucide-react';

interface LegalDocsProps {
  lang: 'en' | 'ko';
}

const LegalDocs: React.FC<LegalDocsProps> = ({ lang }) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'damage'>('terms');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl text-slate-900 mb-4">{t.legal}</h1>
        <div className="w-16 h-1 bg-sky-500 mx-auto rounded-full"></div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-12">
        <button
          onClick={() => setActiveTab('terms')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
            activeTab === 'terms'
              ? 'bg-slate-900 text-white shadow-lg'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          {t.termsTitle || 'Terms'}
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
            activeTab === 'privacy'
              ? 'bg-slate-900 text-white shadow-lg'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          {t.privacyTitle || 'Privacy'}
        </button>
        <button
          onClick={() => setActiveTab('damage')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
            activeTab === 'damage'
              ? 'bg-slate-900 text-white shadow-lg'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          {t.damageTitle || 'Policies'}
        </button>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'terms' && (
          <div>
            <h2 className="font-serif text-2xl text-slate-900 mb-6">{t.termsTitle}</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{t.termsContent}</p>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div>
            <h2 className="font-serif text-2xl text-slate-900 mb-6">{t.privacyTitle}</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{t.privacyContent}</p>
            </div>
          </div>
        )}

        {activeTab === 'damage' && (
          <div>
            <h2 className="font-serif text-2xl text-slate-900 mb-6">{t.damageTitle}</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{t.damageContent}</p>
            </div>
          </div>
        )}
      </div>

      <div className="text-center mt-12 text-sm text-slate-400">
        <p>Information provided in accordance with Australian Consumer Law & Privacy Act 1988.</p>
      </div>
    </div>
  );
};

export default LegalDocs;
