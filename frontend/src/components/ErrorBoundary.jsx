import React from 'react';
import { AlertOctagon, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-neutral-950 light:bg-gray-50 flex items-center justify-center p-4">
                    <div className="bg-neutral-900 light:bg-white border border-neutral-800 light:border-gray-200 p-8 rounded-2xl max-w-md w-full text-center">
                        <AlertOctagon size={64} className="text-rose-500 mx-auto mb-6 opacity-80" />
                        <h1 className="text-2xl font-bold text-white light:text-gray-900 mb-2">Something went wrong</h1>
                        <p className="text-neutral-400 light:text-gray-500 mb-6">
                            The application encountered an unexpected error. Don't worry, your data is safe.
                        </p>
                        <div className="bg-neutral-950 light:bg-gray-50 p-4 rounded-lg text-left overflow-x-auto border border-neutral-800 light:border-gray-200 mb-6">
                            <code className="text-sm text-rose-400 font-mono">
                                {this.state.error?.toString() || 'Unknown rendering error'}
                            </code>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white light:text-gray-900 font-bold py-3 px-6 rounded-xl flex items-center justify-center w-full transition-colors"
                        >
                            <RefreshCcw size={18} className="mr-2" /> Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
