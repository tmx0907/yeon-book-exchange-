
import React, { useState } from 'react';
import { State, Book } from '../types';
import { translations } from '../data';
import { MapPin, MessageCircle, ArrowRightLeft, Plus, User } from 'lucide-react';

interface BookGridProps {
  lang: 'en' | 'ko';
  books: Book[];
  onMessageClick: (book: Book) => void;
  onExchangeClick: (book: Book) => void;
  isMyLibrary?: boolean;
  onAddBook?: () => void;
  currentUserId?: string; // New prop to identify owner
}

const BookGrid: React.FC<BookGridProps> = ({ 
  lang, 
  books, 
  onMessageClick, 
  onExchangeClick, 
  isMyLibrary = false, 
  onAddBook,
  currentUserId
}) => {
  const [selectedState, setSelectedState] = useState<State | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const t = translations[lang];

  const filteredBooks = books.filter((book) => {
    // Show only Available books in public marketplace. In My Library, show everything.
    const isAvailable = isMyLibrary ? true : book.status === 'Available';
    const matchesState = isMyLibrary ? true : (selectedState === 'All' || book.location.state === selectedState);
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm);
    
    return isAvailable && matchesState && matchesSearch;
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
          {!isMyLibrary && (
            <>
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
            </>
          )}
          {isMyLibrary && onAddBook && (
            <button 
              onClick={onAddBook}
              className="flex items-center px-5 py-2 bg-slate-900 text-white rounded-full hover:bg-sky-600 transition-colors text-sm font-semibold shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t.uploadBook}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
        {filteredBooks.map((book) => {
          // Check if this book belongs to the logged-in user
          const isOwner = currentUserId && book.ownerId === currentUserId;

          return (
            <div key={book.id} className={`group cursor-pointer ${book.status === 'Swapped' ? 'opacity-60' : ''}`}>
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-slate-100 mb-6 shadow-sm border border-slate-100">
                 <img 
                   src={book.imageUrl} 
                   alt={book.title} 
                   className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
                 />
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                 
                 <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md self-start ${book.condition === 'New' ? 'bg-white/90 text-emerald-700' : 'bg-white/90 text-amber-700'}`}>
                      {book.condition}
                    </span>
                    {book.status === 'Swapped' && (
                       <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md bg-slate-900/90 text-white self-start">
                          Swapped
                       </span>
                    )}
                 </div>
                 
                 {/* Badge for Owner */}
                 {isOwner && !isMyLibrary && (
                    <div className="absolute bottom-4 right-4">
                       <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-sky-600/90 text-white shadow-lg">
                          <User className="w-3 h-3" />
                          {t.yourBook}
                       </span>
                    </div>
                 )}
                 
                 {/* Hover Overlay Action - Only show if NOT owner and NOT swapped */}
                 {!isMyLibrary && !isOwner && book.status === 'Available' && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                       <button 
                         onClick={(e) => { e.stopPropagation(); onExchangeClick(book); }}
                         className="bg-white/95 text-slate-900 px-6 py-3 rounded-full font-semibold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all flex items-center gap-2"
                       >
                         <ArrowRightLeft className="w-4 h-4" />
                         {t.requestExchange}
                       </button>
                    </div>
                 )}
              </div>
              
              <div>
                <div className="flex justify-between items-start mb-1">
                   <h3 className="font-serif text-xl text-slate-900 group-hover:text-sky-600 transition-colors truncate pr-2">{book.title}</h3>
                   {!isMyLibrary && <span className="text-sky-600 font-bold text-sm shrink-0">{book.points} {t.points}</span>}
                </div>
                <p className="text-sm text-slate-500 font-medium mb-3">{book.author}</p>
                
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                   <div className="flex items-center text-xs text-slate-400 uppercase tracking-wide">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="truncate max-w-[100px]">{book.location.suburb}, {book.location.state}</span>
                   </div>
                   {!isMyLibrary && !isOwner && (
                     <button 
                      onClick={(e) => { e.stopPropagation(); onMessageClick(book); }}
                      className="flex items-center text-slate-400 hover:text-sky-600 transition-colors text-xs font-semibold uppercase tracking-wide"
                     >
                        <span className="mr-1">{t.contactOwner}</span>
                        <MessageCircle className="w-4 h-4" />
                     </button>
                   )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredBooks.length === 0 && (
          <div className="text-center py-24 bg-slate-50 rounded-3xl">
              <p className="text-slate-400 font-serif text-xl">
                 {isMyLibrary ? "Your library is empty. Start adding books to exchange!" : "No stories found in this region."}
              </p>
              {!isMyLibrary && <button onClick={() => setSelectedState('All')} className="mt-4 text-sky-600 hover:text-sky-700 font-medium">View all regions</button>}
          </div>
      )}
    </div>
  );
};

export default BookGrid;
