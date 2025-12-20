/**
 * Error Boundary Component
 * 
 * React 에러 경계 - 자식 컴포넌트의 JavaScript 에러를 잡아서
 * 앱 전체가 크래시되는 것을 방지합니다.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });

        // TODO: Send error to logging service (e.g., Sentry)
        // logErrorToService(error, errorInfo);
    }

    handleReload = (): void => {
        window.location.reload();
    };

    handleGoHome = (): void => {
        window.location.href = '/';
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                        {/* Icon */}
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            문제가 발생했습니다
                        </h1>
                        <p className="text-slate-600 mb-6">
                            예기치 않은 오류가 발생했습니다. 다시 시도해주세요.
                        </p>

                        {/* Error details (development only) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="bg-slate-100 rounded-lg p-4 mb-6 text-left">
                                <p className="text-sm font-mono text-red-600 break-all">
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo && (
                                    <pre className="text-xs text-slate-500 mt-2 overflow-auto max-h-32">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </div>
                        )}

                        {/* Action buttons */}
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
