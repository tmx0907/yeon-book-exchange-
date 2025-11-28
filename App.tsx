
import React, { useState, useEffect } from 'react';
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
import { translations, mockBooks, mockExchanges } from './data';
import { ArrowRight } from 'lucide-react';
import { supabase } from './lib/supabaseClient';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [view, setView] = useState('home'); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // --- REAL SUPABASE STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [exchangeHistory, setExchangeHistory] = useState<ExchangeTransaction[]>([]);

  // --- INITIAL LOAD & AUTH ---
  useEffect(() => {
    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchUserProfile(session.user.id);
      else loadPublicData(); // Load books even if not logged in
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsLoggedIn(true);
        fetchUserProfile(session.user.id);
        fetchUserChats(session.user.id);
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setChats([]);
        loadPublicData();
      }
    });

    // 3. Realtime Subscription for Books (Global)
    const bookChannel = supabase
      .channel('public:books')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'books' }, (payload) => {
        // Refresh books when change happens
        loadPublicData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(bookChannel);
    };
  }, []);

  // --- FETCHING FUNCTIONS ---

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) {
      setUser({
        id: data.id,
        name: data.name || 'User',
        email: data.email,
        state: data.state || 'NSW',
        suburb: data.suburb || '',
        points: data.points,
        booksRead: 0,
        exchangesCompleted: 0,
        rating: 4.8,
        joinDate: data.join_date || 'Recently',
        avatarUrl: data.avatar_url,
        favoriteQuote: data.favorite_quote
      });
      setIsLoggedIn(true);
      fetchUserChats(userId);
    }
    loadPublicData();
  };

  const loadPublicData = async () => {
    // Fetch all available books
    const { data: booksData } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (booksData) {
      const mappedBooks: Book[] = booksData.map((b: any) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        isbn: b.isbn || '0000',
        condition: b.condition,
        ownerId: b.owner_id,
        ownerName: b.owner_name,
        location: { suburb: b.location_suburb, state: b.location_state },
        points: b.points,
        imageUrl: b.image_url,
        category: b.category,
        status: b.status
      }));
      setAllBooks(mappedBooks);
    }
  };

  const fetchUserChats = async (userId: string) => {
    // 1. Get Chats where user is A or B
    const { data: chatsData } = await supabase
      .from('chats')
      .select(`
        id, partner_a, partner_b, last_message, last_message_time,
        profiles!partner_a(name, avatar_url),
        profiles!partner_b(name, avatar_url)
      `)
      .or(`partner_a.eq.${userId},partner_b.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (!chatsData) return;

    const loadedChats: Chat[] = await Promise.all(chatsData.map(async (c: any) => {
      const isPartnerA = c.partner_a === userId;
      // If I am A, partner is B. If I am B, partner is A.
      // Note: profiles array comes back. 
      // Supabase returns arrays for relations unless mapped differently.
      // Simplified extraction:
      const partnerProfile = isPartnerA ? c.profiles_partner_b : c.profiles_partner_a; 
      // NOTE: In raw response, it might be nested differently depending on query. 
      // For this quick prototype, let's just fetch messages to build the object.
      
      // Let's get messages for this chat
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', c.id)
        .order('created_at', { ascending: true });

      const messages: Message[] = (msgs || []).map((m: any) => ({
        id: m.id,
        senderId: m.sender_id,
        text: m.text,
        timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: m.sender_id === userId,
        proposal: m.proposal_data
      }));

      // Hacky way to get partner info if the join above is tricky in simple mode
      // We will do a second fetch if needed or rely on ID logic.
      // But let's assume we store partner details locally or rely on what we have.
      const partnerId = isPartnerA ? c.partner_b : c.partner_a;
      
      // Need partner name/avatar. 
      // For speed, let's fetch profile of partner
      const { data: pData } = await supabase.from('profiles').select('name, avatar_url').eq('id', partnerId).single();

      return {
        id: c.id,
        partnerId: partnerId,
        partnerName: pData?.name || 'Partner',
        partnerAvatar: pData?.avatar_url || 'https://i.pravatar.cc/150',
        lastMessage: c.last_message,
        lastMessageTime: new Date(c.last_message_time).toLocaleDateString(),
        unread: 0,
        messages: messages
      };
    }));

    setChats(loadedChats);
  };

  // --- Realtime Chat Subscription ---
  useEffect(() => {
    if (!user) return;

    const chatChannel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        // When a new message arrives, refresh chats
        fetchUserChats(user.id);
      })
      .subscribe();

    return () => { supabase.removeChannel(chatChannel); };
  }, [user]);

  // --- ACTIONS ---

  const handleUploadBook = async (bookData: Partial<Book>) => {
    if (!user) return;
    
    const newBook = {
      title: bookData.title,
      author: bookData.author,
      condition: bookData.condition,
      category: bookData.category,
      image_url: bookData.imageUrl,
      owner_id: user.id,
      owner_name: user.name,
      location_state: user.state,
      location_suburb: user.suburb,
      status: 'Available'
    };

    await supabase.from('books').insert([newBook]);
    // Realtime will auto-update the list
    setView('profile');
  };

  const handleSendMessage = async (chatId: string, text: string) => {
    if (!user) return;
    
    // Insert message
    await supabase.from('messages').insert([{
      chat_id: chatId,
      sender_id: user.id,
      text: text,
      proposal_data: null
    }]);

    // Update Chat last message
    await supabase.from('chats').update({
      last_message: text,
      last_message_time: new Date().toISOString()
    }).eq('id', chatId);

    // Fetch will happen via realtime
  };

  const handleInitiateExchange = (targetBook: Book) => {
    if (!user) {
      setView('login');
      return;
    }
    setExchangeTarget(targetBook);
  };

  const handleConfirmExchange = async (offeredBook: Book | 'OPEN') => {
    if (!exchangeTarget || !user) return;

    // 1. Check if chat exists
    let chatId: string;
    const existingChat = chats.find(c => c.partnerId === exchangeTarget.ownerId);

    if (existingChat) {
      chatId = existingChat.id;
    } else {
      // Create new chat
      const { data: newChat } = await supabase.from('chats').insert([{
        partner_a: user.id,
        partner_b: exchangeTarget.ownerId,
        last_message: 'Exchange Proposal'
      }]).select().single();
      chatId = newChat.id;
    }

    // 2. Create Proposal Data
    const isOpenProposal = offeredBook === 'OPEN';
    const proposalData: ExchangeProposal = {
        id: Date.now().toString(),
        targetBookId: exchangeTarget.id,
        targetBookTitle: exchangeTarget.title,
        targetBookImage: exchangeTarget.imageUrl,
        type: isOpenProposal ? 'open' : 'direct',
        offeredBookId: isOpenProposal ? undefined : offeredBook.id,
        offeredBookTitle: isOpenProposal ? undefined : offeredBook.title,
        offeredBookImage: isOpenProposal ? undefined : offeredBook.imageUrl,
        status: 'pending'
    };

    const text = isOpenProposal 
       ? `${t.proposalTitle}: ${t.openProposalDesc} ${exchangeTarget.title}`
       : `${t.proposalTitle}: ${offeredBook.title} for ${exchangeTarget.title}`;

    // 3. Send Message
    await supabase.from('messages').insert([{
      chat_id: chatId,
      sender_id: user.id,
      text: text,
      proposal_data: proposalData
    }]);

    setExchangeTarget(null);
    setActiveChatId(chatId);
    setView('messages');
  };

  // --- STATE ---
  const [activeChatId, setActiveChatId] = useState<string | undefined>(undefined);
  const [exchangeTarget, setExchangeTarget] = useState<Book | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const t = translations[lang];

  // Derived state for My Books
  const myBooks = allBooks.filter(b => user && b.ownerId === user.id);
  const marketBooks = allBooks.filter(b => !user || b.ownerId !== user.id); // For market, show others

  const handleLogin = () => { /* Handled in Auth Component */ };
  const handleLogout = async () => { await supabase.auth.signOut(); };

  // Helper for Profile Edit
  const handleUpdateProfile = async (updatedUser: User) => {
    await supabase.from('profiles').update({
      name: updatedUser.name,
      suburb: updatedUser.suburb,
      state: updatedUser.state,
      favorite_quote: updatedUser.favoriteQuote,
      avatar_url: updatedUser.avatarUrl
    }).eq('id', updatedUser.id);
    
    setUser(updatedUser);
    setIsEditingProfile(false);
  };
  
  // NOTE: Simple version of proposal acceptance (Database update)
  const handleAcceptProposal = async (chatId: string, messageId: string, proposalId: string) => {
     // For this MVP, we need to update the message JSONB. 
     // Fetch the message first to get data? No, we have it in state.
     const chat = chats.find(c => c.id === chatId);
     const msg = chat?.messages.find(m => m.id === messageId);
     if(msg && msg.proposal) {
        const newProposal = { ...msg.proposal, status: 'accepted' };
        
        await supabase.from('messages').update({
           proposal_data: newProposal
        }).eq('id', messageId);

        // Mark books as swapped
        await supabase.from('books').update({ status: 'Swapped' }).eq('id', newProposal.targetBookId);
        if(newProposal.offeredBookId) {
            await supabase.from('books').update({ status: 'Swapped' }).eq('id', newProposal.offeredBookId);
        }
        
        // Refresh
        fetchUserChats(user!.id);
        loadPublicData();
     }
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
                  </div>
                  <BookGrid 
                    lang={lang} 
                    books={marketBooks.slice(0, 4)} 
                    onMessageClick={(b) => handleInitiateExchange(b)}
                    onExchangeClick={handleInitiateExchange}
                    currentUserId={user?.id}
                  />
               </div>
            </section>
          </main>
        </>
      )}

      {view === 'login' && (
        <main className="flex-grow w-full">
          <Auth lang={lang} onLogin={() => {}} />
        </main>
      )}

      {view === 'search' && (
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
           <BookGrid 
              lang={lang} 
              books={marketBooks} 
              onMessageClick={(b) => handleInitiateExchange(b)}
              onExchangeClick={handleInitiateExchange}
              currentUserId={user?.id}
           />
        </main>
      )}

      {(view === 'profile' || view === 'my-library') && user && (
         <main className="flex-grow w-full bg-slate-50/50">
            <UserProfile 
              lang={lang}
              user={user}
              myBooks={myBooks}
              history={exchangeHistory} // History needs proper fetching implementation in v2
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
            <ChatInterface 
              lang={lang} 
              chats={chats}
              initialChatId={activeChatId}
              onSendMessage={handleSendMessage}
              onAcceptProposal={handleAcceptProposal}
              onRejectProposal={() => {}} // Implement similar to accept
              onBrowseLibrary={() => setView('search')}
            />
         </main>
      )}
      
      {view === 'safety' && <main className="flex-grow w-full"><SafetyBanner lang={lang}/></main>}
      
      {(view === 'legal' || view === 'legal-privacy' || view === 'legal-damage') && (
         <main className="flex-grow w-full bg-slate-50">
            <LegalDocs lang={lang} initialTab={view === 'legal-privacy' ? 'privacy' : view === 'legal-damage' ? 'damage' : 'terms'} />
         </main>
      )}

      {exchangeTarget && (
        <ExchangeModal
          lang={lang}
          targetBook={exchangeTarget}
          myBooks={myBooks}
          onClose={() => setExchangeTarget(null)}
          onConfirm={handleConfirmExchange}
          onUploadRedirect={() => { setExchangeTarget(null); setView('upload'); }}
        />
      )}

      {isEditingProfile && user && (
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
