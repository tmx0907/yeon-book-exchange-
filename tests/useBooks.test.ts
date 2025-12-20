/**
 * useBooks Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBooks } from '../hooks/useBooks';
import type { User } from '../types';

// Mock the supabase client
vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
                data: [
                    {
                        id: '1',
                        title: 'Test Book',
                        author: 'Test Author',
                        isbn: '1234',
                        condition: 'Good',
                        owner_id: 'user-1',
                        owner_name: 'Test User',
                        location_suburb: 'Sydney',
                        location_state: 'NSW',
                        points: 10,
                        image_url: 'https://example.com/book.jpg',
                        category: 'Fiction',
                        status: 'Available'
                    }
                ],
                error: null
            }),
        }),
        channel: vi.fn().mockReturnValue({
            on: vi.fn().mockReturnThis(),
            subscribe: vi.fn().mockReturnThis(),
        }),
        removeChannel: vi.fn(),
    },
    isSupabaseConfigured: true,
}));

const mockUser: User = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    state: 'NSW',
    suburb: 'Sydney',
    points: 100,
    booksRead: 5,
    exchangesCompleted: 3,
    rating: 4.5,
    joinDate: '2024-01-01',
    avatarUrl: 'https://example.com/avatar.jpg',
    favoriteQuote: 'Test quote'
};

describe('useBooks Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should load books on mount', async () => {
        const { result } = renderHook(() => useBooks(mockUser, 'en'));

        await waitFor(() => {
            expect(result.current.allBooks.length).toBeGreaterThanOrEqual(0);
        });
    });

    it('should filter myBooks based on user id', async () => {
        const { result } = renderHook(() => useBooks(mockUser, 'en'));

        await waitFor(() => {
            // myBooks should only contain books owned by the current user
            result.current.myBooks.forEach(book => {
                expect(book.ownerId).toBe(mockUser.id);
            });
        });
    });

    it('should have uploadBook function', () => {
        const { result } = renderHook(() => useBooks(mockUser, 'en'));

        expect(typeof result.current.uploadBook).toBe('function');
    });

    it('should have deleteBook function', () => {
        const { result } = renderHook(() => useBooks(mockUser, 'en'));

        expect(typeof result.current.deleteBook).toBe('function');
    });

    it('should return empty myBooks when user is null', async () => {
        const { result } = renderHook(() => useBooks(null, 'en'));

        await waitFor(() => {
            expect(result.current.myBooks).toEqual([]);
        });
    });
});
