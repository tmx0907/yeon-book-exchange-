
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BookGrid from './components/BookGrid';
import SafetyBanner from './components/SafetyBanner';
import StatsChart from './components/StatsChart';
import ChatInterface from './components/ChatInterface';
import Auth from './components/Auth';
import PasswordResetRequest from './components/PasswordResetRequest';
import PasswordReset from './components/PasswordReset';
import Footer from './components/Footer';
import UploadBook from './components/UploadBook';
import ExchangeModal from './components/ExchangeModal';
import UserProfile from './components/UserProfile';
import EditProfileModal from './components/EditProfileModal';
import LegalDocs from './components/LegalDocs';
import CommunityMain from './components/Community/CommunityMain';
import MyExchanges from './components/MyExchanges';
import { Language, Book, Chat, Message, User, ExchangeTransaction, ExchangeProposal } from './types';
import { translations, mockBooks, mockExchanges } from './data';
import { ArrowRight, AlertCircle, X } from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import { useAuth, useBooks, useRouter } from './hooks';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');

  // ========================================
  // 🛣️ ROUTER HOOK - URL-based navigation
  // ========================================
  const { view, setView } = useRouter();

  // ========================================
  // 🔐 AUTH HOOK - Handles all authentication
  // ========================================
  const {
    user,
    setUser,
    isLoggedIn,
    networkError,
    setNetworkError,
    handleLogout: authLogout
  } = useAuth(lang);

  // ========================================
  // 📚 BOOKS HOOK - Handles all book operations
  // ========================================
  const {
    allBooks,
    myBooks,
    marketBooks,
    loadBooks,
    uploadBook,
    deleteBook
  } = useBooks(user, lang);

  // --- REMAINING STATE (Chat & Exchanges - to be refactored later) ---
  const [chats, setChats] = useState<Chat[]>([]);
  const [exchangeHistory, setExchangeHistory] = useState<ExchangeTransaction[]>([]);

  // Redirect on auth state changes
  useEffect(() => {
    if (isLoggedIn && ['login', 'forgot-password', 'reset-password'].includes(view)) {
      setView('home');
    }
  }, [isLoggedIn, view]);

  // Handle logout with view redirect
  const handleLogout = async () => {
    await authLogout();
    setChats([]);
    setView('home');
  };

  // --- CHAT LOADING (Chats not yet in hooks) ---

  // Load chats when user is available
  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;
    loadUserChats(user.id);
  }, [user]);

  const loadUserChats = async (userId: string) => {
    try {
      const { data: chatsData } = await supabase
        .from('chats')
        .select(`
          id, partner_a, partner_b, last_message, last_message_time,
          profiles!partner_a(name, avatar_url),
          profiles!partner_b(name, avatar_url)
        `)
        .or(`partner_a.eq.${userId},partner_b.eq.${userId}`)
        .order('updated_at', { ascending: false });

      if (chatsData) {
        await processChatsData(chatsData, userId);
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  // Helper function to process chats
  const processChatsData = async (chatsData: any[], userId: string) => {
    const loadedChats: Chat[] = await Promise.all(chatsData.map(async (c: any) => {
      const isPartnerA = c.partner_a === userId;
      const partnerId = isPartnerA ? c.partner_b : c.partner_a;
      const partnerProfile = isPartnerA ? c.profiles : c.profiles;

      // Fetch messages for this chat
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', c.id)
        .order('created_at', { ascending: true });

      const messages: Message[] = (messagesData || []).map((m: any) => ({
        id: m.id,
        senderId: m.sender_id,
        text: m.text,
        timestamp: m.created_at,
        isMe: m.sender_id === userId,
        proposal: m.proposal_data
      }));

      return {
        id: c.id,
        partnerId,
        partnerName: partnerProfile?.name || 'Unknown',
        partnerAvatar: partnerProfile?.avatar_url || '',
        lastMessage: c.last_message || '',
        lastMessageTime: c.last_message_time || new Date().toISOString(),
        unread: 0,
        messages
      };
    }));

    setChats(loadedChats);
  };


  // Removed duplicate fetchUserChats - now integrated into fetchUserProfile for parallel execution

  // --- Realtime Chat Subscription ---
  useEffect(() => {
    if (!user) return;

    const chatChannel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        // Chats are already loaded - realtime will update
        // No need to re-fetch, processChatsData handles updates
      })
      .subscribe();

    return () => { supabase.removeChannel(chatChannel); };
  }, [user]);

  // --- ACTIONS (using hooks) ---

  const handleUploadBook = async (bookData: Partial<Book>) => {
    const success = await uploadBook(bookData);
    if (success) {
      setView('profile');
    }
  };

  const handleDeleteBook = async (book: Book) => {
    const success = await deleteBook(book);
    if (!success) {
      alert(lang === 'ko' ? '책 삭제에 실패했습니다.' : 'Failed to delete book.');
    }
  };

  // --- ACCOUNT DELETION ---
  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      // 1. Delete all user's books
      await supabase.from('books').delete().eq('owner_id', user.id);

      // 2. Delete all user's messages
      await supabase.from('messages').delete().eq('sender_id', user.id);

      // 3. Delete all user's chats
      await supabase.from('chats').delete().or(`partner_a.eq.${user.id},partner_b.eq.${user.id}`);

      // 4. Delete user's profile
      await supabase.from('profiles').delete().eq('id', user.id);

      // 5. Log the deletion (keep for audit)
      await supabase.from('activity_logs').insert([{
        user_id: user.id,
        user_email: user.email,
        action_type: 'account_delete',
        target_type: 'profile',
        target_id: user.id,
        details: { name: user.name }
      }]);

      // 6. Sign out and clear local state
      handleLogout();

      alert(lang === 'ko' ? '계정이 삭제되었습니다.' : 'Your account has been deleted.');

    } catch (error) {
      console.error('Error deleting account:', error);
      alert(lang === 'ko' ? '계정 삭제 중 오류가 발생했습니다.' : 'Error deleting account.');
    }
  };

  // ============================================
  // 📤 EXCHANGE PROPOSAL FUNCTIONS
  // ============================================

  const handleSendExchangeProposal = async (
    requestedBook: Book,
    offeredBook: Book,
    message?: string
  ) => {
    if (!user) {
      alert(lang === 'ko' ? '로그인이 필요합니다.' : 'Please login first.');
      setView('login');
      return;
    }

    // Prevent proposing to yourself
    if (requestedBook.ownerId === user.id) {
      alert(lang === 'ko'
        ? '자신의 책에는 제안할 수 없습니다.'
        : 'You cannot propose an exchange for your own book.');
      return;
    }

    try {
      const proposal = {
        requester_id: user.id,
        requester_name: user.name,
        receiver_id: requestedBook.ownerId,
        receiver_name: requestedBook.ownerName,
        requested_book_id: requestedBook.id,
        requested_book_title: requestedBook.title,
        offered_book_id: offeredBook.id,
        offered_book_title: offeredBook.title,
        status: 'pending' as const,
        message: message || null,
        notification_read: false,
        email_sent: false,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('exchange_proposals')
        .insert([proposal]);

      if (error) {
        console.error('Error sending proposal:', error);
        alert(lang === 'ko'
          ? '제안 전송에 실패했습니다.'
          : 'Failed to send proposal.');
      } else {
        alert(lang === 'ko'
          ? '교환 제안이 전송되었습니다!'
          : 'Exchange proposal sent successfully!');
        setView('home');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(lang === 'ko' ? '오류가 발생했습니다.' : 'An error occurred.');
    }
  };

  const handleAcceptProposal = async (proposalId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('exchange_proposals')
        .update({
          status: 'accepted',
          responded_at: new Date().toISOString()
        })
        .eq('id', proposalId)
        .eq('receiver_id', user.id);

      if (error) {
        console.error('Error:', error);
        alert(lang === 'ko' ? '제안 수락에 실패했습니다.' : 'Failed to accept proposal.');
      } else {
        alert(lang === 'ko' ? '제안을 수락했습니다!' : 'Proposal accepted!');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeclineProposal = async (proposalId: string, reason?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('exchange_proposals')
        .update({
          status: 'declined',
          decline_reason: reason || null,
          responded_at: new Date().toISOString()
        })
        .eq('id', proposalId)
        .eq('receiver_id', user.id);

      if (error) {
        console.error('Error:', error);
        alert(lang === 'ko' ? '제안 거절에 실패했습니다.' : 'Failed to decline proposal.');
      } else {
        alert(lang === 'ko' ? '제안을 거절했습니다.' : 'Proposal declined.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCancelProposal = async (proposalId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('exchange_proposals')
        .update({
          status: 'cancelled',
          responded_at: new Date().toISOString()
        })
        .eq('id', proposalId)
        .eq('requester_id', user.id);

      if (error) {
        console.error('Error:', error);
        alert(lang === 'ko' ? '제안 취소에 실패했습니다.' : 'Failed to cancel proposal.');
      } else {
        alert(lang === 'ko' ? '제안을 취소했습니다.' : 'Proposal cancelled.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
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

    // 2. Create Proposal Data (Legacy format for chat messages)
    const isOpenProposal = offeredBook === 'OPEN';
    const proposalData: any = {
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

  // myBooks and marketBooks are now provided by useBooks hook
  // handleLogout is now defined above using authLogout from useAuth hook

  const handleLogin = () => { /* Handled in Auth Component */ };

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

  // NOTE: Simple version of proposal acceptance via chat (Legacy - to be migrated)
  const handleAcceptChatProposal = async (chatId: string, messageId: string, proposalId: string) => {
    // For this MVP, we need to update the message JSONB. 
    // Fetch the message first to get data? No, we have it in state.
    const chat = chats.find(c => c.id === chatId);
    const msg = chat?.messages.find(m => m.id === messageId);
    if (msg && msg.proposal) {
      const newProposal = { ...msg.proposal, status: 'accepted' };

      await supabase.from('messages').update({
        proposal_data: newProposal
      }).eq('id', messageId);

      // Mark books as swapped
      // Note: Using old field names for backward compatibility
      const bookId = (newProposal as any).targetBookId || (newProposal as any).requested_book_id;
      const offeredId = (newProposal as any).offeredBookId || (newProposal as any).offered_book_id;

      if (bookId) {
        await supabase.from('books').update({ status: 'Swapped' }).eq('id', bookId);
      }
      if (offeredId) {
        await supabase.from('books').update({ status: 'Swapped' }).eq('id', offeredId);
      }

      // Refresh via realtime - no need to manually re-fetch
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Network Error Banner */}
      {networkError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 text-sm font-medium">{networkError}</p>
            </div>
            <button
              onClick={() => setNetworkError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

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

            {/* FRESHLY SHELVED SECTION */}
            <section className="py-24 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16">
                  <div className="mb-6 md:mb-0">
                    <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs mb-3">Just In</p>
                    <h2 className="font-serif text-4xl md:text-5xl text-slate-900">{t.freshlyShelved}</h2>
                  </div>
                  <button onClick={() => setView('search')} className="text-sky-600 hover:text-sky-700 font-medium flex items-center gap-2">
                    {t.viewAll} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <BookGrid
                  lang={lang}
                  books={marketBooks.slice(4, 8)}
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
          <Auth
            lang={lang}
            onLogin={() => { }}
            onForgotPassword={() => setView('forgot-password')}
          />
        </main>
      )}

      {view === 'forgot-password' && (
        <main className="flex-grow w-full">
          <PasswordResetRequest
            lang={lang}
            onBack={() => setView('login')}
          />
        </main>
      )}

      {view === 'reset-password' && (
        <main className="flex-grow w-full">
          <PasswordReset
            lang={lang}
            onBack={() => setView('login')}
            onSuccess={() => {
              setView('login');
              // Could add a success message here
            }}
          />
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

      {(view === 'profile' || view === 'my-library') && (
        <main className="flex-grow w-full bg-slate-50/50">
          {user ? (
            <UserProfile
              lang={lang}
              user={user}
              myBooks={myBooks}
              history={exchangeHistory}
              onAddBook={() => setView('upload')}
              onEdit={() => setIsEditingProfile(true)}
              onDeleteBook={handleDeleteBook}
              onViewExchanges={() => setView('my-exchanges')}
              onDeleteAccount={handleDeleteAccount}
            />
          ) : (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
              <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100">
                <h2 className="font-serif text-2xl text-slate-900 mb-4">Please Sign In</h2>
                <p className="text-slate-500 mb-6">You need to be logged in to view your profile.</p>
                <button
                  onClick={() => setView('login')}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-sky-600 transition-colors font-medium"
                >
                  Go to Sign In
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {view === 'my-exchanges' && (
        <main className="flex-grow w-full bg-slate-50/50 py-12">
          {user ? (
            <MyExchanges
              lang={lang}
              userId={user.id}
              onAcceptProposal={handleAcceptProposal}
              onDeclineProposal={handleDeclineProposal}
              onCancelProposal={handleCancelProposal}
            />
          ) : (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
              <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100">
                <h2 className="font-serif text-2xl text-slate-900 mb-4">
                  {lang === 'ko' ? '로그인이 필요합니다' : 'Please Sign In'}
                </h2>
                <p className="text-slate-500 mb-6">
                  {lang === 'ko'
                    ? '교환 제안을 보려면 로그인하세요.'
                    : 'You need to be logged in to view exchange proposals.'}
                </p>
                <button
                  onClick={() => setView('login')}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-sky-600 transition-colors font-medium"
                >
                  {lang === 'ko' ? '로그인하기' : 'Go to Sign In'}
                </button>
              </div>
            </div>
          )}
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
            onAcceptProposal={handleAcceptChatProposal}
            onRejectProposal={() => { }} // Implement similar to accept
            onBrowseLibrary={() => setView('search')}
          />
        </main>
      )}

      {view === 'safety' && <main className="flex-grow w-full"><SafetyBanner lang={lang} /></main>}

      {(view === 'legal' || view === 'legal-privacy' || view === 'legal-damage') && (
        <main className="flex-grow w-full bg-slate-50">
          <LegalDocs lang={lang} initialTab={view === 'legal-privacy' ? 'privacy' : view === 'legal-damage' ? 'damage' : 'terms'} />
        </main>
      )}

      {view === 'community' && (
        <main className="flex-grow w-full bg-slate-50/30">
          <CommunityMain
            user={user}
            onLoginRedirect={() => setView('login')}
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
