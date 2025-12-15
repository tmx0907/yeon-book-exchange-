
import React, { useState } from 'react';
import { User, Book, ExchangeTransaction } from '../types';
import { translations, mockDiscussions } from '../data';
import BookGrid from './BookGrid';
import { MapPin, Calendar, Star, Edit2, BookOpen, Repeat, Award, ArrowRight, Clock, CheckCircle2, XCircle, Quote, MessageSquare, Users } from 'lucide-react';

interface UserProfileProps {
   lang: 'en' | 'ko';
   user: User;
   myBooks: Book[];
   history: ExchangeTransaction[];
   onAddBook: () => void;
   onEdit: () => void;
   onDeleteBook: (book: Book) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ lang, user, myBooks, history, onAddBook, onEdit, onDeleteBook }) => {
   const t = translations[lang];
   const [activeTab, setActiveTab] = useState<'library' | 'history' | 'discussions'>('library');

   return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
         {/* Profile Header Card */}
         <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100 mb-12">
            <div className="h-40 bg-gradient-to-r from-sky-400 to-indigo-400 relative">
               {/* Abstract Decoration */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12"></div>
            </div>

            <div className="px-8 pb-8 relative">
               <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-6 gap-6">
                  <div className="relative group cursor-pointer" onClick={onEdit}>
                     <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                     </div>
                     <button className="absolute bottom-1 right-1 p-2 bg-slate-900 text-white rounded-full hover:bg-sky-600 transition-colors shadow-md group-hover:scale-110 duration-200">
                        <Edit2 className="w-3 h-3" />
                     </button>
                  </div>

                  <div className="flex-1 mb-2 md:mb-0">
                     <h1 className="font-serif text-3xl font-bold text-slate-900">{user.name}</h1>
                     <div className="flex items-center gap-4 text-slate-500 mt-2 text-sm">
                        <div className="flex items-center">
                           <MapPin className="w-3 h-3 mr-1" />
                           {user.suburb}, {user.state}
                        </div>
                        <div className="flex items-center">
                           <Calendar className="w-3 h-3 mr-1" />
                           {t.memberSince} {user.joinDate}
                        </div>
                     </div>
                  </div>

                  <div className="flex gap-3">
                     <button
                        onClick={onEdit}
                        className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-200 transition-colors"
                     >
                        {t.editProfile}
                     </button>
                  </div>
               </div>

               {/* Quote Section */}
               {user.favoriteQuote && (
                  <div className="mb-8 max-w-2xl">
                     <div className="relative pl-8 pt-2">
                        <Quote className="absolute top-0 left-0 w-6 h-6 text-sky-200" />
                        <p className="font-serif text-xl italic text-slate-700 leading-relaxed">"{user.favoriteQuote}"</p>
                     </div>
                  </div>
               )}

               {/* Stats Row */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-8">
                  <div className="flex items-center p-4 bg-slate-50/50 rounded-2xl">
                     <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mr-4">
                        <Award className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-2xl font-serif font-bold text-slate-900">{user.points}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-widest">{t.points}</p>
                     </div>
                  </div>

                  <div className="flex items-center p-4 bg-slate-50/50 rounded-2xl">
                     <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-4">
                        <Repeat className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-2xl font-serif font-bold text-slate-900">{user.exchangesCompleted}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-widest">{t.exchangesCompleted}</p>
                     </div>
                  </div>

                  <div className="flex items-center p-4 bg-slate-50/50 rounded-2xl">
                     <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mr-4">
                        <Star className="w-6 h-6" />
                     </div>
                     <div>
                        <div className="flex items-center gap-1">
                           <p className="text-2xl font-serif font-bold text-slate-900">{user.rating}</p>
                           <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        </div>
                        <p className="text-xs text-slate-500 uppercase tracking-widest">{t.communityRating}</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Tabs */}
         <div className="mb-8 border-b border-slate-200 flex gap-8">
            <button
               onClick={() => setActiveTab('library')}
               className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'library'
                  ? 'border-b-2 border-slate-900 text-slate-900'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
            >
               {t.myLibrary}
            </button>
            <button
               onClick={() => setActiveTab('history')}
               className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'history'
                  ? 'border-b-2 border-slate-900 text-slate-900'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
            >
               {t.exchangeHistory}
            </button>
            <button
               onClick={() => setActiveTab('discussions')}
               className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'discussions'
                  ? 'border-b-2 border-slate-900 text-slate-900'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
            >
               {t.discussions}
            </button>
         </div>

         {/* Tab Content */}
         <div className="min-h-[400px]">
            {activeTab === 'library' && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {myBooks.length === 0 ? (
                     <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                           <BookOpen className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-400 mb-6">{t.noBooksInLibrary}</p>
                        <button
                           onClick={onAddBook}
                           className="px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-sky-600 transition-colors shadow-lg shadow-slate-200"
                        >
                           {t.uploadFirst}
                        </button>
                     </div>
                  ) : (
                     <BookGrid
                        lang={lang}
                        books={myBooks}
                        onMessageClick={() => { }}
                        onExchangeClick={() => { }}
                        isMyLibrary={true}
                        onAddBook={onAddBook}
                        onDeleteBook={onDeleteBook}
                     />
                  )}
               </div>
            )}

            {activeTab === 'history' && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                  {history.length === 0 ? (
                     <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
                        <p className="text-slate-400">{t.historyEmpty}</p>
                     </div>
                  ) : (
                     history.map((tx) => (
                        <div key={tx.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6">
                           <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                              <div className="relative group">
                                 <img src={tx.bookGivenImage} alt={tx.bookGivenTitle} className="w-16 h-24 object-cover rounded-md shadow-sm" />
                                 <div className="absolute -top-2 -left-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded-full">{t.gave}</div>
                              </div>
                              <ArrowRight className="w-5 h-5 text-slate-300 mx-2" />
                              <div className="relative group">
                                 <img src={tx.bookReceivedImage} alt={tx.bookReceivedTitle} className="w-16 h-24 object-cover rounded-md shadow-sm" />
                                 <div className="absolute -top-2 -right-2 bg-sky-600 text-white text-[10px] px-2 py-1 rounded-full">{t.received}</div>
                              </div>
                              <div className="ml-4">
                                 <h4 className="font-serif font-medium text-slate-900 mb-1">{tx.bookGivenTitle} <span className="text-slate-400 text-xs mx-1">for</span> {tx.bookReceivedTitle}</h4>
                                 <p className="text-xs text-slate-500">{t.tradedWith} <span className="font-semibold text-slate-700">{tx.partnerName}</span></p>
                              </div>
                           </div>

                           <div className="flex items-center justify-between w-full md:w-auto gap-8 border-t md:border-t-0 md:border-l border-slate-50 pt-4 md:pt-0 md:pl-8">
                              <div className="text-right">
                                 <p className="text-xs text-slate-400 mb-1">{tx.date}</p>

                                 {tx.status === 'Completed' && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                       <CheckCircle2 className="w-3 h-3 mr-1" />
                                       {t.completed}
                                    </span>
                                 )}

                                 {tx.status === 'Pending' && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                       <Clock className="w-3 h-3 mr-1" />
                                       {t.pending}
                                    </span>
                                 )}

                                 {tx.status === 'Cancelled' && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                                       <XCircle className="w-3 h-3 mr-1" />
                                       {t.cancelled}
                                    </span>
                                 )}

                                 {tx.status === 'Rejected' && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                       <XCircle className="w-3 h-3 mr-1" />
                                       Rejected
                                    </span>
                                 )}
                              </div>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            )}

            {activeTab === 'discussions' && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mockDiscussions.length === 0 ? (
                     <div className="col-span-full text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
                        <p className="text-slate-400">{t.noDiscussions}</p>
                     </div>
                  ) : (
                     mockDiscussions.map((discussion) => (
                        <div key={discussion.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-6 hover:shadow-md transition-shadow cursor-pointer">
                           <img src={discussion.imageUrl} alt={discussion.bookTitle} className="w-20 h-28 object-cover rounded-lg shadow-sm shrink-0" />
                           <div className="flex flex-col justify-between py-1">
                              <div>
                                 <h4 className="font-serif font-bold text-lg text-slate-900 leading-tight mb-1">{discussion.bookTitle}</h4>
                                 <p className="text-sm text-sky-600 font-medium mb-2">{discussion.topic}</p>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                 <div className="flex items-center">
                                    <Users className="w-3 h-3 mr-1" />
                                    {discussion.participantsCount} {t.participants}
                                 </div>
                                 <div className="flex items-center">
                                    <MessageSquare className="w-3 h-3 mr-1" />
                                    {discussion.lastActive}
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            )}
         </div>
      </div>
   );
};

export default UserProfile;
