
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BookGrid from './components/BookGrid';
import SafetyBanner from './components/SafetyBanner';
import StatsChart from './components/StatsChart';
import ChatInterface from './components/ChatInterface';
import Auth from './components/Auth';
import Footer from './components/Footer';
import UploadBook from './components/UploadBook';
import ExchangeModal from './components/ExchangeModal';
import UserProfile from './components/UserProfile';
import EditProfileModal from './components/EditProfileModal';
import LegalDocs from './components/LegalDocs';
import { Language, Book, Chat, Message, User, ExchangeTransaction, ExchangeProposal } from './types';
import { translations, mockBooks, mockChats, currentUser as initialUser, mockExchanges } from './data';
import { ArrowRight } from 'lucide-react';

const CURRENT_USER_ID = 'me';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [view, setView] = useState('home'); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Data State
  const [user, setUser] = useState<User>(initialUser);
  const [allBooks, setAllBooks] = useState<Book[]>(mockBooks);
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [activeChatId, setActiveChatId] = useState<string | undefined>(undefined);
  const [exchangeHistory, setExchangeHistory] = useState<ExchangeTransaction[]>(mockExchanges);
  
  // Exchange Flow State
  const [exchangeTarget, setExchangeTarget] = useState<Book | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const t = translations[lang];

  // Derived state for My Books
  const myBooks = allBooks.filter(b => b.ownerId === user.id);
  const marketBooks = allBooks.filter(b => b.ownerId !== user.id);

  const handleLogin = (userData?: { name: string; email: string }) => {
    if (userData) {
      // Simulate a unique ID for the logged in user based on email
      // This ensures we treat different logins as different users for the session
      const newUserId = userData.email === initialUser.email ? initialUser.id : userData.email;
      const isInitialUser = newUserId === initialUser.id;

      setUser(prev => ({
        ...prev,
        id: newUserId,
        name: userData.name,
        email: userData.email,
        // If it's the demo user, keep the demo avatar. If it's a new email, generate a new pravatar.
        avatarUrl: isInitialUser ? prev.avatarUrl : `https://i.pravatar.cc/150?u=${userData.email}`,
        // Reset stats for new users
        points: isInitialUser ? prev.points : 50,
        booksRead: isInitialUser ? prev.booksRead : 0,
        exchangesCompleted: isInitialUser ? prev.exchangesCompleted : 0,
        favoriteQuote: isInitialUser ? prev.favoriteQuote : ''
      }));
    }
    setIsLoggedIn(true);
    setView('home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setView('home');
    setUser(initialUser);
  };

  const handleUploadBook = (bookData: Partial<Book>) => {
    const newBook: Book = {
      id: Date.now().toString(),
      title: bookData.title || 'Untitled',
      author: bookData.author || 'Unknown',
      isbn: '0000',
      condition: bookData.condition || 'New',
      ownerId: user.id,
      ownerName: user.name,
      location: { suburb: user.suburb, state: user.state },
      points: 10,
      imageUrl: bookData.imageUrl || '',
      category: bookData.category || 'Fiction',
      status: 'Available'
    };
    setAllBooks([newBook, ...allBooks]);
    setView('profile'); // Redirect to profile/library after upload
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setUser(updatedUser);
    setIsEditingProfile(false);
  };

  const handleInitiateExchange = (targetBook: Book) => {
    if (!isLoggedIn) {
      setView('login');
      return;
    }
    setExchangeTarget(targetBook);
  };

  const handleConfirmExchange = (offeredBook: Book) => {
    if (!exchangeTarget) return;

    // Create a new chat or find existing one
    let chat = chats.find(c => c.partnerId === exchangeTarget.ownerId);
    const proposalId = Date.now().toString();
    
    if (!chat) {
      chat = {
        id: Date.now().toString(),
        partnerId: exchangeTarget.ownerId,
        partnerName: exchangeTarget.ownerName,
        partnerAvatar: `https://i.pravatar.cc/150?u=${exchangeTarget.ownerId}`,
        lastMessage: t.proposalSent,
        lastMessageTime: 'Just now',
        unread: 0,
        messages: []
      };
      setChats([chat, ...chats]);
    }

    // Add the proposal message
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      text: `${t.proposalTitle}: ${offeredBook.title} for ${exchangeTarget.title}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      proposal: {
        id: proposalId,
        targetBookId: exchangeTarget.id,
        targetBookTitle: exchangeTarget.title,
        targetBookImage: exchangeTarget.imageUrl,
        offeredBookId: offeredBook.id,
        offeredBookTitle: offeredBook.title,
        offeredBookImage: offeredBook.imageUrl,
        status: 'pending'
      }
    };

    const updatedChats = chats.map(c => 
      c.id === chat!.id 
        ? { ...c, messages: [...c.messages, newMessage], lastMessage: t.proposalSent, lastMessageTime: 'Just now' }
        : c
    );
    
    // If it was a new chat, we need to add it to the list properly
    if (!chats.find(c => c.partnerId === exchangeTarget.ownerId)) {
       updatedChats.unshift({...chat, messages: [newMessage]});
    }

    setChats(updatedChats);

    // Add to Exchange History as Pending
    const newTransaction: ExchangeTransaction = {
      id: proposalId,
      bookGivenTitle: offeredBook.title,
      bookGivenImage: offeredBook.imageUrl,
      bookReceivedTitle: exchangeTarget.title,
      bookReceivedImage: exchangeTarget.imageUrl,
      partnerName: exchangeTarget.ownerName,
      date: new Date().toLocaleDateString(),
      status: 'Pending'
    };
    setExchangeHistory([newTransaction, ...exchangeHistory]);

    setActiveChatId(chat.id);
    setExchangeTarget(null);
    setView('messages');
  };

  const handleSendMessage = (chatId: string, text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    const updatedChats = chats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: text,
          lastMessageTime: 'Just now'
        };
      }
      return chat;
    });

    setChats(updatedChats);
  };

  const handleAcceptProposal = (chatId: string, messageId: string, proposalId: string) => {
    // 1. Find the proposal info to identify which books need to be locked
    let acceptedProposal: ExchangeProposal | undefined;
    
    const chatsWithAcceptedProposal = chats.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id === messageId && m.proposal) {
              acceptedProposal = m.proposal;
              return { ...m, proposal: { ...m.proposal, status: 'accepted' as const } };
            }
            return m;
          })
        };
      }
      return c;
    });

    if (!acceptedProposal) return;

    // 2. Mark Books as Swapped
    const targetBookId = acceptedProposal.targetBookId;
    const offeredBookId = acceptedProposal.offeredBookId;

    const updatedBooks = allBooks.map(b => {
      if (b.id === targetBookId || b.id === offeredBookId) {
        return { ...b, status: 'Swapped' as const };
      }
      return b;
    });
    setAllBooks(updatedBooks);
    
    // 3. Reject Conflicting Proposals
    // Find any pending proposals that involve the same Target Book OR the same Offered Book
    const finalChats = chatsWithAcceptedProposal.map(c => ({
      ...c,
      messages: c.messages.map(m => {
        if (m.proposal && m.proposal.status === 'pending' && m.proposal.id !== proposalId) {
           const involvesTarget = m.proposal.targetBookId === targetBookId || m.proposal.targetBookId === offeredBookId;
           const involvesOffered = m.proposal.offeredBookId === targetBookId || m.proposal.offeredBookId === offeredBookId;
           
           if (involvesTarget || involvesOffered) {
             return { ...m, proposal: { ...m.proposal, status: 'rejected' as const } };
           }
        }
        return m;
      })
    }));

    setChats(finalChats);
    
    // 4. Update History
    setExchangeHistory(prev => prev.map(tx => {
       if (tx.id === proposalId) return { ...tx, status: 'Completed' };
       // Also reject history for conflicting transactions if we were tracking them by ID
       return tx; 
    }));
  };

  const handleRejectProposal = (chatId: string, messageId: string, proposalId: string) => {
    const updatedChats = chats.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id === messageId && m.proposal) {
              return { ...m, proposal: { ...m.proposal, status: 'rejected' as const } };
            }
            return m;
          })
        };
      }
      return c;
    });
    setChats(updatedChats);
    
    // Update history for current user if applicable
    setExchangeHistory(prev => prev.map(tx => tx.id === proposalId ? { ...tx, status: 'Rejected' } : tx));
  };

  const handleMessageClick = (book: Book) => {
     if(!isLoggedIn) {
       setView('login');
       return;
     }
     const existingChat = chats.find(c => c.partnerId === book.ownerId);
     if(existingChat) {
       setActiveChatId(existingChat.id);
     }
     setView('messages');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar 
        lang={lang} 
        setLang={setLang} 
        setView={setView} 
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />
      
      {view === 'home' && (
        <>
          <Hero lang={lang} onFindBooks={() => setView('search')} />
          
          <main className="flex-grow w-full">
            <section className="bg-white py-20 lg:py-32 border-b border-slate-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SafetyBanner lang={lang} />
              </div>
            </section>

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
                  <BookGrid 
                    lang={lang} 
                    books={marketBooks.slice(0, 4)} 
                    onMessageClick={handleMessageClick}
                    onExchangeClick={handleInitiateExchange}
                    currentUserId={user.id}
                  />
               </div>
            </section>

            {/* Freshly Shelved Section */}
            <section className="py-20 bg-white border-t border-slate-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="flex justify-between items-center mb-10">
                    <h2 className="font-serif text-3xl text-slate-900">{t.freshlyShelved}</h2>
                    <button onClick={() => setView('search')} className="text-sm font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 group">
                       {t.viewAll} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                 </div>
                 <BookGrid 
                    lang={lang} 
                    books={marketBooks.slice(4, 8)} 
                    onMessageClick={handleMessageClick}
                    onExchangeClick={handleInitiateExchange}
                    currentUserId={user.id}
                 />
              </div>
            </section>

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

      {view === 'login' && (
        <main className="flex-grow w-full">
          <Auth lang={lang} onLogin={handleLogin} />
        </main>
      )}

      {view === 'search' && (
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
           <div className="mb-16 text-center">
             <h2 className="font-serif text-5xl text-slate-900 mb-4">{t.findBooks}</h2>
             <p className="text-slate-500 max-w-2xl mx-auto">Explore the library of shared wisdom from the community.</p>
           </div>
           <BookGrid 
              lang={lang} 
              books={marketBooks} 
              onMessageClick={handleMessageClick}
              onExchangeClick={handleInitiateExchange}
              currentUserId={user.id}
           />
        </main>
      )}

      {(view === 'profile' || view === 'my-library') && isLoggedIn && (
         <main className="flex-grow w-full bg-slate-50/50">
            <UserProfile 
              lang={lang}
              user={user}
              myBooks={myBooks}
              history={exchangeHistory}
              onAddBook={() => setView('upload')}
              onEdit={() => setIsEditingProfile(true)}
            />
         </main>
      )}

      {view === 'upload' && isLoggedIn && (
        <main className="flex-grow w-full">
          <UploadBook lang={lang} onUpload={handleUploadBook} onCancel={() => setView('profile')} />
        </main>
      )}

      {view === 'messages' && (
         <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
           {isLoggedIn ? (
             <ChatInterface 
                lang={lang} 
                chats={chats}
                initialChatId={activeChatId}
                onSendMessage={handleSendMessage}
                onAcceptProposal={handleAcceptProposal}
                onRejectProposal={handleRejectProposal}
             />
           ) : (
             <div className="text-center py-20">
               <h3 className="font-serif text-2xl mb-4">Please Sign In</h3>
               <button onClick={() => setView('login')} className="text-sky-600 hover:underline">Go to Login</button>
             </div>
           )}
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
      
      {(view === 'legal' || view === 'legal-privacy' || view === 'legal-damage') && (
         <main className="flex-grow w-full bg-slate-50">
            <LegalDocs 
              lang={lang} 
              initialTab={
                view === 'legal-privacy' ? 'privacy' : 
                view === 'legal-damage' ? 'damage' : 
                'terms'
              }
            />
         </main>
      )}

      {/* Modals */}
      {exchangeTarget && (
        <ExchangeModal
          lang={lang}
          targetBook={exchangeTarget}
          myBooks={myBooks}
          onClose={() => setExchangeTarget(null)}
          onConfirm={handleConfirmExchange}
          onUploadRedirect={() => {
             setExchangeTarget(null);
             setView('upload');
          }}
        />
      )}

      {isEditingProfile && isLoggedIn && (
         <EditProfileModal
            lang={lang}
            user={user}
            onClose={() => setIsEditingProfile(false)}
            onSave={handleUpdateProfile}
         />
      )}

      <Footer lang={lang} onLinkClick={setView} />
    </div>
  );
};

export default App;
