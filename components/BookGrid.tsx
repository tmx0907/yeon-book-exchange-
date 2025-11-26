import React, { useState } from 'react';
import { Book, State, Translations } from '../types';
import { translations, mockBooks } from '../data';
import { MapPin, ArrowRight } from 'lucide-react';

interface BookGridProps {
  lang: 'en' | 'ko';
}

const BookGrid: React.FC<BookGridProps> = ({ lang }) => {
  const [selectedState, setSelectedState] = useState<State | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const t = translations[lang];

  const filteredBooks = mockBooks.filter((book) => {
    const matchesState = selectedState === 'All' || book.location.state === selectedState;
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm);
    return matchesState && matchesSearch;
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-end">
        <div className="w-full md:w-auto flex-grow max-w-md">
           <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Search Collection</label>
           <div className="relative">
             <input
                type="text"
                placeholder={t.searchPlaceholder}
                className="w-full bg-transparent border-b border-slate-300 py-3 text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-none transition-colors font-serif text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-slate-400 whitespace-nowrap">{t.filterByState}</span>
          <div className="relative">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value as State | 'All')}
              className="appearance-none bg-slate-50 border-none rounded-full py-2 pl-4 pr-10 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-sky-200 cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option value="All">{t.allStates}</option>
              <option value="NSW">NSW</option>
              <option value="VIC">VIC</option>
              <option value="QLD">QLD</option>
              <option value="WA">WA</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
        {filteredBooks.map((book) => (
          <div key={book.id} className="group cursor-pointer">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-slate-100 mb-6">
               <img 
                 src={book.imageUrl} 
                 alt={book.title} 
                 className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
               />
               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
               
               <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${book.condition === 'New' ? 'bg-white/80 text-emerald-700' : 'bg-white/80 text-amber-700'}`}>
                    {book.condition}
                  </span>
               </div>
            </div>
            
            <div>
              <div className="flex justify-between items-start mb-1">
                 <h3 className="font-serif text-xl text-slate-900 group-hover:text-sky-600 transition-colors">{book.title}</h3>
                 <span className="text-sky-600 font-bold text-sm">{book.points} {t.points}</span>
              </div>
              <p className="text-sm text-slate-500 font-medium mb-3">{book.author}</p>
              
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                 <div className="flex items-center text-xs text-slate-400 uppercase tracking-wide">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="truncate max-w-[100px]">{book.location.suburb}, {book.location.state}</span>
                 </div>
                 <button className="text-slate-900 hover:text-sky-600 transition-colors">
                    <ArrowRight className="w-5 h-5" />
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredBooks.length === 0 && (
          <div className="text-center py-24 bg-slate-50 rounded-3xl">
              <p className="text-slate-400 font-serif text-xl">No stories found in this region.</p>
              <button onClick={() => setSelectedState('All')} className="mt-4 text-sky-600 hover:text-sky-700 font-medium">View all regions</button>
          </div>
      )}
    </div>
  );
};

export default BookGrid;