/**
 * Router Configuration
 * 
 * 앱의 모든 라우트를 정의하는 파일
 */

import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Route paths - centralized for easy management
export const ROUTES = {
    HOME: '/',
    SEARCH: '/search',
    LOGIN: '/login',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    PROFILE: '/profile',
    MY_LIBRARY: '/my-library',
    UPLOAD: '/upload',
    CHAT: '/chat',
    CHAT_DETAIL: '/chat/:chatId',
    MY_EXCHANGES: '/my-exchanges',
    COMMUNITY: '/community',
    LEGAL: '/legal',
    PRIVACY: '/privacy',
    TERMS: '/terms',
} as const;

// Type for route paths
export type RoutePath = typeof ROUTES[keyof typeof ROUTES];

// Helper to navigate programmatically
export const getRoutePath = (route: keyof typeof ROUTES, params?: Record<string, string>): string => {
    let path = ROUTES[route] as string;
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            path = path.replace(`:${key}`, value);
        });
    }
    return path;
};
