import { useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

export const useAxiosInterceptor = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const originalFetch = window.fetch;

        window.fetch = async (...args) => {
            const response = await originalFetch(...args);

            // Catch generic 401s (Token Expired or Invalid) globally
            if (response.status === 401 && !response.url.includes('/api/v1/auth/')) {
                console.warn('Unauthorized access detected. Logging out.');
                logout();
                navigate('/login');
            }

            // Catch 402 Payment Required
            if (response.status === 402) {
                navigate('/settings');
            }

            return response;
        };

        return () => {
            window.fetch = originalFetch; // Cleanup
        };
    }, [logout, navigate]);

    return null;
};
