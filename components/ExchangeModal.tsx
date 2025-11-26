import React, { useState } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import { translations } from '../data';
import { Book } from '../types';

interface ExchangeModalProps {
  lang: 'en' | 'ko';
  targetBook: Book;
  myBooks: Book[];
  onClose: () => void;
  onConfirm: (offeredBook: Book) => void;
  onUploadRedirect: () => void;
}

const ExchangeModal: React.FC<ExchangeModalProps> = ({ 
  lang, 
  targetBook, 
  myBooks, 
  onClose, 
  onConfirm,
  onUploadRedirect
}) => {
  const t = translations[lang];
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white z-10">
          <h3 className="font-serif text-2xl text-slate-900">{t.selectBookToOffer}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <div className="flex items-center gap-2 mb-6 text-sm text-slate-500">
             <span>{t.selectBookDesc}</span>
             <span className="font-bold text-slate-900">"{targetBook.title}"</span>
          </div>

          {myBooks.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center">
               <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                  <ArrowRightLeft className="w-8 h-8 text-slate-400" />
               </div>
               <p className="text-slate-600 mb-6 max-w-xs">{t.noBooksInLibrary}</p>
               <button 
                 onClick={onUploadRedirect}
                 className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-sky-600 transition-colors shadow-lg shadow-slate-200"
               >
                 {t.uploadFirst}
               </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {myBooks.map((book) => (
                <div 
                  key={book.id}
                  onClick={() => setSelectedBookId(book.id)}
                  className={`relative cursor-pointer group rounded-xl overflow-hidden transition-all duration-200 border-2 ${
                    selectedBookId === book.id 
                      ? 'border-sky-500 ring-4 ring-sky-100 transform scale-[1.02]' 
                      : 'border-transparent hover:border-slate-200'
                  }`}
                >
                  <div className="aspect-[2/3] bg-slate-200 relative">
                     <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                     {selectedBookId === book.id && (
                       <div className="absolute inset-0 bg-sky-900/20 flex items-center justify-center">
                          <div className="bg-sky-500 text-white p-2 rounded-full">
                            <ArrowRightLeft className="w-6 h-6" />
                          </div>
                       </div>
                     )}
                  </div>
                  <div className="p-3 bg-white">
                    <p className="font-serif font-medium text-slate-900 truncate">{book.title}</p>
                    <p className="text-xs text-slate-500 truncate">{book.author}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {myBooks.length > 0 && (
          <div className="p-6 border-t border-slate-50 bg-white">
            <button
              disabled={!selectedBookId}
              onClick={() => {
                const book = myBooks.find(b => b.id === selectedBookId);
                if (book) onConfirm(book);
              }}
              className="w-full py-4 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-sky-200"
            >
              {t.confirmProposal}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExchangeModal;