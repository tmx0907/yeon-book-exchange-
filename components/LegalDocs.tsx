
import React, { useState, useEffect } from 'react';
import { translations } from '../data';
import { Shield, Lock, BookOpen } from 'lucide-react';

interface LegalDocsProps {
  lang: 'en' | 'ko';
  initialTab?: 'terms' | 'privacy' | 'damage';
}

const LegalDocs: React.FC<LegalDocsProps> = ({ lang, initialTab = 'terms' }) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'damage'>(initialTab);

  // Sync state if initialTab changes (e.g., via footer navigation while on the page)
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Simple parser to render **Bold Headers**
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
        return <h3 key={index} className="font-serif text-lg font-bold text-slate-900 mt-6 mb-2">{line.replace(/\*\*/g, '')}</h3>;
      } else if (line.trim() === '') {
        return <div key={index} className="h-2"></div>;
      }
      return <p key={index} className="text-slate-600 leading-relaxed mb-2">{line}</p>;
    });
  };

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
              {renderFormattedText(t.termsContent)}
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div>
            <h2 className="font-serif text-2xl text-slate-900 mb-6">{t.privacyTitle}</h2>
            <div className="prose prose-slate max-w-none">
               {renderFormattedText(t.privacyContent)}
            </div>
          </div>
        )}

        {activeTab === 'damage' && (
          <div>
            <h2 className="font-serif text-2xl text-slate-900 mb-6">{t.damageTitle}</h2>
            <div className="prose prose-slate max-w-none">
               {renderFormattedText(t.damageContent)}
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
