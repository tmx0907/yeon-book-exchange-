/**
 * useAuth Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';

// Mock the supabase client
vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        auth: {
            getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
            onAuthStateChange: vi.fn().mockReturnValue({
                data: { subscription: { unsubscribe: vi.fn() } }
            }),
            signOut: vi.fn().mockResolvedValue({ error: null }),
        },
        from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
    },
    isSupabaseConfigured: true,
}));

describe('useAuth Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should initialize with logged out state', async () => {
        const { result } = renderHook(() => useAuth('en'));

        await waitFor(() => {
            expect(result.current.isLoggedIn).toBe(false);
            expect(result.current.user).toBe(null);
        });
    });

    it('should have handleLogout function', () => {
        const { result } = renderHook(() => useAuth('en'));

        expect(typeof result.current.handleLogout).toBe('function');
    });

    it('should set networkError when configured', () => {
        const { result } = renderHook(() => useAuth('en'));

        act(() => {
            result.current.setNetworkError('Test error');
        });

        expect(result.current.networkError).toBe('Test error');
    });

    it('should return isConfigured as true when Supabase is configured', () => {
        const { result } = renderHook(() => useAuth('en'));

        expect(result.current.isConfigured).toBe(true);
    });
});
