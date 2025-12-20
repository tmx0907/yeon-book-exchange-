/**
 * useBooks Hook
 * 
 * 책 관련 모든 로직을 관리하는 커스텀 훅
 * - 책 목록 로드
 * - 책 업로드
 * - 책 삭제
 * - 실시간 업데이트
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { Book, User, Language } from '../types';

interface UseBooksReturn {
    allBooks: Book[];
    myBooks: Book[];
    marketBooks: Book[];
    loadBooks: () => Promise<void>;
    uploadBook: (bookData: Partial<Book>) => Promise<boolean>;
    deleteBook: (book: Book) => Promise<boolean>;
    isLoading: boolean;
}

export function useBooks(user: User | null, lang: Language): UseBooksReturn {
    const [allBooks, setAllBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Derived state
    const myBooks = user ? allBooks.filter(b => b.ownerId === user.id) : [];
    const marketBooks = allBooks; // All books visible in marketplace

    // Load all books from database
    const loadBooks = useCallback(async () => {
        if (!isSupabaseConfigured) return;

        setIsLoading(true);
        try {
            const { data: booksData, error } = await supabase
                .from('books')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading books:', error);
                return;
            }

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
        } catch (error) {
            console.error('loadBooks failed:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Upload a new book
    const uploadBook = useCallback(async (bookData: Partial<Book>): Promise<boolean> => {
        if (!user) return false;

        try {
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

            const { error } = await supabase.from('books').insert([newBook]);

            if (error) {
                console.error('Error uploading book:', error);
                return false;
            }

            // Realtime will auto-update, but we can also manually refresh
            await loadBooks();
            return true;
        } catch (error) {
            console.error('uploadBook failed:', error);
            return false;
        }
    }, [user, loadBooks]);

    // Delete a book
    const deleteBook = useCallback(async (book: Book): Promise<boolean> => {
        if (!user) return false;

        try {
            const { error } = await supabase
                .from('books')
                .delete()
                .eq('id', book.id)
                .eq('owner_id', user.id);

            if (error) {
                console.error('Error deleting book:', error);
                return false;
            }

            // Log the action (optional - may fail if table doesn't exist)
            try {
                await supabase.from('activity_logs').insert([{
                    user_id: user.id,
                    user_email: user.email,
                    action_type: 'book_delete',
                    target_type: 'book',
                    target_id: book.id,
                    target_title: book.title,
                    details: { author: book.author }
                }]);
            } catch { /* Silent fail for logging */ }

            return true;
        } catch (error) {
            console.error('deleteBook failed:', error);
            return false;
        }
    }, [user]);

    // Load books on mount
    useEffect(() => {
        loadBooks();
    }, [loadBooks]);

    // Realtime subscription for books
    useEffect(() => {
        if (!isSupabaseConfigured) return;

        const bookChannel = supabase
            .channel('public:books')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'books' }, () => {
                loadBooks();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(bookChannel);
        };
    }, [loadBooks]);

    return {
        allBooks,
        myBooks,
        marketBooks,
        loadBooks,
        uploadBook,
        deleteBook,
        isLoading
    };
}
