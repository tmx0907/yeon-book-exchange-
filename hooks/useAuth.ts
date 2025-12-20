/**
 * useAuth Hook
 * 
 * 인증 관련 모든 로직을 관리하는 커스텀 훅
 * - 세션 관리
 * - 로그인/로그아웃
 * - 자동 로그아웃 (30분 비활성)
 * - 사용자 프로필 로드
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User, Language } from '../types';

// --- HELPER: Create User object from Supabase Auth User ---
const createUserFromAuth = (authUser: SupabaseUser): User => ({
    id: authUser.id,
    name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Member',
    email: authUser.email || '',
    state: 'NSW',
    suburb: '',
    points: 0,
    booksRead: 0,
    exchangesCompleted: 0,
    rating: 5.0,
    joinDate: new Date().toISOString(),
    avatarUrl: authUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User')}`,
    favoriteQuote: ''
});

interface UseAuthReturn {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    isLoggedIn: boolean;
    isConfigured: boolean;
    networkError: string | null;
    setNetworkError: React.Dispatch<React.SetStateAction<string | null>>;
    handleLogout: () => Promise<void>;
    fetchUserProfile: (authUser: SupabaseUser) => Promise<void>;
}

export function useAuth(lang: Language): UseAuthReturn {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [networkError, setNetworkError] = useState<string | null>(null);
    const [lastActivity, setLastActivity] = useState<number>(Date.now());

    // --- AUTO LOGOUT (30 minutes inactivity) ---
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

    // Logout function
    const handleLogout = useCallback(async () => {
        // FORCE LOGOUT: Clear UI immediately without waiting for server
        setIsLoggedIn(false);
        setUser(null);

        // Clear Supabase session from local storage manually
        const key = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
        if (key) localStorage.removeItem(key);

        // Attempt server sign out (fire and forget)
        try {
            await supabase.auth.signOut();
        } catch (e) {
            console.error("Sign out error:", e);
        }
    }, []);

    // Fetch user profile from database
    const fetchUserProfile = useCallback(async (authUser: SupabaseUser) => {
        const userId = authUser.id;

        try {
            const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (profileData && !error) {
                setUser({
                    id: profileData.id,
                    name: profileData.name || 'User',
                    email: profileData.email,
                    state: profileData.state || 'NSW',
                    suburb: profileData.suburb || '',
                    points: profileData.points,
                    booksRead: 0,
                    exchangesCompleted: 0,
                    rating: 4.8,
                    joinDate: profileData.join_date || 'Recently',
                    avatarUrl: profileData.avatar_url,
                    favoriteQuote: profileData.favorite_quote
                });
            } else {
                // Fallback to auth metadata
                console.warn('Profile fetch issue, using fallback.');
                setUser(createUserFromAuth(authUser));
            }
        } catch (error) {
            console.error('fetchUserProfile failed:', error);
            setNetworkError(lang === 'ko' ? '프로필 정보를 불러오는데 실패했습니다.' : 'Failed to load profile data.');
            setUser(createUserFromAuth(authUser));
        }
    }, [lang]);

    // Auto-logout timer
    useEffect(() => {
        if (!isLoggedIn) return;

        const checkInactivity = () => {
            if (Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
                console.log('Auto logout due to inactivity');
                handleLogout();
            }
        };

        const interval = setInterval(checkInactivity, 60000);
        return () => clearInterval(interval);
    }, [isLoggedIn, lastActivity, handleLogout]);

    // Activity tracking
    useEffect(() => {
        const updateActivity = () => setLastActivity(Date.now());

        window.addEventListener('mousemove', updateActivity);
        window.addEventListener('keydown', updateActivity);
        window.addEventListener('click', updateActivity);
        window.addEventListener('touchstart', updateActivity);

        return () => {
            window.removeEventListener('mousemove', updateActivity);
            window.removeEventListener('keydown', updateActivity);
            window.removeEventListener('click', updateActivity);
            window.removeEventListener('touchstart', updateActivity);
        };
    }, []);

    // Initial session check & auth state listener
    useEffect(() => {
        if (!isSupabaseConfigured) {
            console.error("Supabase not configured: Check Vercel Environment Variables");
            setIsLoggedIn(false);
            return;
        }

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session && session.user) {
                setUser(createUserFromAuth(session.user));
                setIsLoggedIn(true);
                fetchUserProfile(session.user);
            }
        }).catch(err => {
            console.error("Session check failed:", err);
            setNetworkError(lang === 'ko' ? '네트워크 연결 오류. 인터넷 연결을 확인해주세요.' : 'Network error. Please check your connection.');
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                setIsLoggedIn(false);
                setUser(null);
                return;
            }

            if (session && session.user) {
                setUser(createUserFromAuth(session.user));
                setIsLoggedIn(true);
                fetchUserProfile(session.user);
            } else {
                setIsLoggedIn(false);
                setUser(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [lang, fetchUserProfile]);

    return {
        user,
        setUser,
        isLoggedIn,
        isConfigured: isSupabaseConfigured,
        networkError,
        setNetworkError,
        handleLogout,
        fetchUserProfile
    };
}
