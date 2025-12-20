/**
 * useRouter Hook
 * 
 * React Router와 기존 view 상태를 연결하는 훅
 * URL 변경 시 view 동기화, 뒤로가기 지원
 */

import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../router/routes';

// Map view names to routes
const VIEW_TO_ROUTE: Record<string, string> = {
    'home': ROUTES.HOME,
    'search': ROUTES.SEARCH,
    'login': ROUTES.LOGIN,
    'forgot-password': ROUTES.FORGOT_PASSWORD,
    'reset-password': ROUTES.RESET_PASSWORD,
    'profile': ROUTES.PROFILE,
    'my-library': ROUTES.MY_LIBRARY,
    'upload': ROUTES.UPLOAD,
    'chat': ROUTES.CHAT,
    'my-exchanges': ROUTES.MY_EXCHANGES,
    'community': ROUTES.COMMUNITY,
    'legal': ROUTES.LEGAL,
    'privacy': ROUTES.PRIVACY,
    'terms': ROUTES.TERMS,
};

// Reverse mapping
const ROUTE_TO_VIEW: Record<string, string> = Object.fromEntries(
    Object.entries(VIEW_TO_ROUTE).map(([view, route]) => [route, view])
);

interface UseRouterReturn {
    view: string;
    setView: (view: string) => void;
    goBack: () => void;
}

export function useRouter(): UseRouterReturn {
    const navigate = useNavigate();
    const location = useLocation();

    // Convert current URL to view name
    const getViewFromPath = useCallback((pathname: string): string => {
        return ROUTE_TO_VIEW[pathname] || 'home';
    }, []);

    // Current view based on URL
    const view = getViewFromPath(location.pathname);

    // Navigate and update URL
    const setView = useCallback((newView: string) => {
        const route = VIEW_TO_ROUTE[newView] || ROUTES.HOME;
        navigate(route);
    }, [navigate]);

    // Go back in history
    const goBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    return {
        view,
        setView,
        goBack
    };
}
