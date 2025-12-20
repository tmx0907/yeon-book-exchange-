/**
 * App Context
 * 
 * 전역 상태를 관리하는 Context
 * - 언어 설정
 * - 사용자 정보 (useAuth에서 제공)
 * - 책 목록 (useBooks에서 제공)
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language, User, Book, Chat, ExchangeTransaction } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useBooks } from '../hooks/useBooks';
import { useRouter } from '../hooks/useRouter';

// ========================================
// 📝 CONTEXT TYPE DEFINITIONS
// ========================================

interface AppContextType {
    // Language
    lang: Language;
    setLang: (lang: Language) => void;

    // Router
    view: string;
    setView: (view: string) => void;

    // Auth (from useAuth hook)
    user: User | null;
    setUser: (user: User | null) => void;
    isLoggedIn: boolean;
    networkError: string | null;
    setNetworkError: (error: string | null) => void;
    handleLogout: () => Promise<void>;

    // Books (from useBooks hook)
    allBooks: Book[];
    myBooks: Book[];
    marketBooks: Book[];
    loadBooks: () => Promise<void>;
    uploadBook: (bookData: Partial<Book>) => Promise<boolean>;
    deleteBook: (book: Book) => Promise<boolean>;
    isLoadingBooks: boolean;

    // Chats (still managed locally for now)
    chats: Chat[];
    setChats: React.Dispatch<React.SetStateAction<Chat[]>>;

    // Exchange History
    exchangeHistory: ExchangeTransaction[];
    setExchangeHistory: React.Dispatch<React.SetStateAction<ExchangeTransaction[]>>;
}

// ========================================
// 📦 CONTEXT CREATION
// ========================================

const AppContext = createContext<AppContextType | undefined>(undefined);

// ========================================
// 🎁 PROVIDER COMPONENT
// ========================================

interface AppProviderProps {
    children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
    // Language state
    const [lang, setLang] = useState<Language>('en');

    // Router hook
    const { view, setView } = useRouter();

    // Auth hook
    const {
        user,
        setUser,
        isLoggedIn,
        networkError,
        setNetworkError,
        handleLogout: authLogout
    } = useAuth(lang);

    // Books hook
    const {
        allBooks,
        myBooks,
        marketBooks,
        loadBooks,
        uploadBook,
        deleteBook,
        isLoading: isLoadingBooks
    } = useBooks(user, lang);

    // Local state (to be moved to hooks later)
    const [chats, setChats] = useState<Chat[]>([]);
    const [exchangeHistory, setExchangeHistory] = useState<ExchangeTransaction[]>([]);

    // Wrapped logout to also clear chats
    const handleLogout = async () => {
        await authLogout();
        setChats([]);
        setView('home');
    };

    const value: AppContextType = {
        lang,
        setLang,
        view,
        setView,
        user,
        setUser,
        isLoggedIn,
        networkError,
        setNetworkError,
        handleLogout,
        allBooks,
        myBooks,
        marketBooks,
        loadBooks,
        uploadBook,
        deleteBook,
        isLoadingBooks,
        chats,
        setChats,
        exchangeHistory,
        setExchangeHistory,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

// ========================================
// 🪝 CUSTOM HOOK TO USE CONTEXT
// ========================================

export function useAppContext(): AppContextType {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}

// Export the context for advanced use cases
export { AppContext };
