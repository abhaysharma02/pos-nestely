import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [tenantName, setTenantName] = useState('');
    const [name, setName] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Dummy login integration: will be replaced with real backend fetch
        const endpoint = isRegistering ? 'register' : 'authenticate';
        const payload = isRegistering
            ? { email, password, name, tenantName, role: 'ADMIN' }
            : { email, password };

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                login(data);
                navigate('/');
            } else {
                alert("Authentication failed!");
            }
        } catch (error) {
            console.error(error);
            alert("Network error. Backend not running?");
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 light:bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md p-8 rounded-2xl bg-neutral-900 light:bg-white border border-neutral-800 light:border-gray-200 shadow-2xl relative overflow-hidden">
                {/* Decorative background circle */}
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.1),transparent_50%)] pointer-events-none" />

                <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-orange-400 to-rose-500 bg-clip-text text-transparent">
                    Nestely POS
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    {isRegistering && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 light:text-gray-500 mb-2">Restaurant Name</label>
                                <input
                                    type="text"
                                    required
                                    value={tenantName}
                                    onChange={(e) => setTenantName(e.target.value)}
                                    className="w-full px-4 py-3 bg-neutral-800 light:bg-white border border-neutral-700 light:border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-white light:text-gray-900 placeholder-neutral-500"
                                    placeholder="The Pizza Place"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 light:text-gray-500 mb-2">Your Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 bg-neutral-800 light:bg-white border border-neutral-700 light:border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-white light:text-gray-900 placeholder-neutral-500"
                                    placeholder="John Doe"
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-neutral-400 light:text-gray-500 mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-neutral-800 light:bg-white border border-neutral-700 light:border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-white light:text-gray-900 placeholder-neutral-500"
                            placeholder="admin@nestely.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-400 light:text-gray-500 mb-2">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-neutral-800 light:bg-white border border-neutral-700 light:border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-white light:text-gray-900 placeholder-neutral-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white light:text-gray-900 font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-orange-500/25 transition-all outline-none"
                    >
                        {isRegistering ? 'Sign Up' : 'Sign In'}
                    </button>
                </form>

                <p className="mt-6 text-center dark:text-neutral-500 text-gray-400 light:text-gray-500 text-sm">
                    {isRegistering ? 'Already have an account?' : "Don't have an account?"}
                    <button
                        type="button"
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="ml-2 text-orange-400 hover:text-orange-300 font-medium transition-colors"
                    >
                        {isRegistering ? 'Log in' : 'Create one'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
