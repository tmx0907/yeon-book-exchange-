/**
 * Error Boundary Component
 * 
 * React 에러 경계 - JavaScript 에러를 잡아서
 * 앱 전체가 크래시되는 것을 방지합니다.
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReload = () => window.location.reload();
    handleGoHome = () => { window.location.href = '/'; };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>

                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            문제가 발생했습니다
                        </h1>
                        <p className="text-slate-600 mb-6">
                            예기치 않은 오류가 발생했습니다. 다시 시도해주세요.
                        </p>

                        {this.state.error && (
                            <div className="bg-slate-100 rounded-lg p-4 mb-6 text-left">
                                <p className="text-sm font-mono text-red-600 break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={this.handleGoHome}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                            >
                                <Home className="w-4 h-4" />
                                홈으로
                            </button>
                            <button
                                onClick={this.handleReload}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                새로고침
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
