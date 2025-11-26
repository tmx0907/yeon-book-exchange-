import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BookGrid from './components/BookGrid';
import SafetyBanner from './components/SafetyBanner';
import StatsChart from './components/StatsChart';
import Footer from './components/Footer';
import { Language } from './types';
import { translations } from './data';
import { ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [view, setView] = useState('home'); 

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar lang={lang} setLang={setLang} setView={setView} />
      
      {view === 'home' && (
        <>
          <Hero lang={lang} onFindBooks={() => setView('search')} />
          
          <main className="flex-grow w-full">
            
            {/* Features / Safety / Philosophy Section */}
            <section className="bg-white py-20 lg:py-32 border-b border-slate-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SafetyBanner lang={lang} />
              </div>
            </section>

            {/* Featured Collection Section */}
            <section className="py-24 bg-slate-50/50">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col md:flex-row justify-between items-end mb-16">
                    <div className="mb-6 md:mb-0">
                      <p className="text-sky-600 font-bold uppercase tracking-widest text-xs mb-3">Curated Exchange</p>
                      <h2 className="font-serif text-4xl md:text-5xl text-slate-900">{t.newArrivals}</h2>
                    </div>
                    <button onClick={() => setView('search')} className="group flex items-center text-slate-800 font-medium hover:text-sky-600 transition-colors">
                       View Collection <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  <BookGrid lang={lang} />
               </div>
            </section>

            {/* Stats & Community Section */}
            <section className="py-24 bg-white">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                     <div>
                        <h2 className="font-serif text-4xl text-slate-900 mb-6">{t.statsTitle}</h2>
                        <p className="text-slate-500 text-lg leading-relaxed mb-8">
                           Yeon is growing across the continent. Join thousands of readers in NSW, Victoria, and Queensland who are discovering the joy of shared stories.
                        </p>
                        <div className="flex gap-4">
                           <div className="bg-slate-50 p-6 rounded-2xl w-full">
                              <p className="text-3xl font-serif text-slate-900 mb-1">2.4k+</p>
                              <p className="text-xs text-slate-400 uppercase tracking-widest">Books Shared</p>
                           </div>
                           <div className="bg-slate-50 p-6 rounded-2xl w-full">
                              <p className="text-3xl font-serif text-slate-900 mb-1">98%</p>
                              <p className="text-xs text-slate-400 uppercase tracking-widest">Happy Readers</p>
                           </div>
                        </div>
                     </div>
                     <div className="h-[400px]">
                        <StatsChart lang={lang} />
                     </div>
                  </div>
               </div>
            </section>
          </main>
        </>
      )}

      {view === 'search' && (
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
           <div className="mb-16 text-center">
             <h2 className="font-serif text-5xl text-slate-900 mb-4">{t.findBooks}</h2>
             <p className="text-slate-500 max-w-2xl mx-auto">Explore the library of shared wisdom from the community.</p>
           </div>
           <BookGrid lang={lang} />
        </main>
      )}

      {view === 'safety' && (
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
           <SafetyBanner lang={lang} />
           
           <div className="mt-16 bg-slate-50 p-10 rounded-3xl max-w-3xl mx-auto prose prose-slate">
              <h3 className="font-serif text-2xl text-slate-900">Community Guidelines</h3>
              <p className="text-slate-600">
                To ensure a harmonious experience for all members, we have established guidelines grounded in respect and transparency.
              </p>
              
              <h4 className="font-serif text-xl text-slate-900 mt-8">For our Victorian Members</h4>
              <p className="text-slate-600">
                We strongly recommend utilizing the designated <strong>Safer Exchange Sites</strong> located at major police stations across Victoria. These provide a neutral, monitored environment for your peace of mind.
              </p>
           </div>
        </main>
      )}

      <Footer lang={lang} />
    </div>
  );
};

export default App;