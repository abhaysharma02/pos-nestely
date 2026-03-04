import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CreditCard, CheckCircle, Clock, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

const SubscriptionPage = () => {
    const { token, user } = useAuth();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/v1/subscription/current', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    setSubscription(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch subscription', err);
            }
            setLoading(false);
        };

        fetchSubscription();
    }, [token]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full p-8 text-neutral-400 light:text-gray-500">
                Loading subscription details...
            </div>
        );
    }

    if (!subscription) {
        return (
            <div className="p-8 max-w-4xl mx-auto text-white light:text-gray-900">
                <div className="bg-neutral-900 light:bg-white border border-neutral-800 light:border-gray-200 rounded-2xl p-8 text-center flex flex-col items-center">
                    <AlertTriangle size={48} className="text-amber-500 mb-4 opacity-50" />
                    <h2 className="text-2xl font-bold mb-2">No Subscription Found</h2>
                    <p className="text-neutral-400 light:text-gray-500">Please contact support or register to activate your account.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto text-white light:text-gray-900">
            <div className="mb-10">
                <h1 className="text-3xl font-bold mb-1">Subscription & Billing</h1>
                <p className="text-neutral-400 light:text-gray-500">Manage your Nestely POS software plan.</p>
            </div>

            <div className="bg-neutral-900 light:bg-white border border-neutral-800 light:border-gray-200 rounded-2xl p-8 lg:p-10 shadow-2xl relative overflow-hidden">
                {/* Background gradient splash */}
                <div className={`absolute top-0 right-0 w-64 h-64 opacity-20 blur-3xl rounded-full ${subscription.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-neutral-800 light:border-gray-200 pb-8 mb-8">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <span className="bg-neutral-800 light:bg-white text-neutral-300 light:text-gray-600 font-bold uppercase tracking-wider text-xs px-3 py-1 rounded-full border border-neutral-700 light:border-gray-300">
                                Current Plan
                            </span>
                            {subscription.isActive ? (
                                <span className="flex items-center text-emerald-400 text-xs font-bold uppercase"><CheckCircle size={14} className="mr-1" /> Active</span>
                            ) : (
                                <span className="flex items-center text-rose-500 text-xs font-bold uppercase"><AlertTriangle size={14} className="mr-1" /> Expired</span>
                            )}
                        </div>
                        <h2 className="text-4xl font-extrabold text-white light:text-gray-900 flex items-center">
                            {subscription.planType === 'TRIAL' && <Zap className="text-orange-500 mr-3" size={32} />}
                            {subscription.planType} PLAN
                        </h2>
                    </div>
                    <div className="text-left md:text-right">
                        <p className="text-neutral-400 light:text-gray-500 text-sm mb-1">Time Remaining</p>
                        <p className="text-3xl font-bold text-white light:text-gray-900 flex items-center md:justify-end">
                            <Clock className="dark:text-neutral-500 text-gray-400 light:text-gray-500 mr-2" size={24} />
                            {subscription.daysRemaining} Days
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 relative z-10">
                    <div>
                        <p className="text-sm text-neutral-400 light:text-gray-500 mb-1">Billing Cycle</p>
                        <p className="text-lg font-bold text-white light:text-gray-900">
                            {new Date(subscription.startDate).toLocaleDateString()} - {new Date(subscription.endDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="bg-neutral-950 light:bg-gray-50 border border-neutral-800 light:border-gray-200 p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center">
                        <ShieldCheck className="text-emerald-500 mr-4 h-10 w-10 opacity-80" />
                        <div>
                            <h3 className="text-white light:text-gray-900 font-bold">Secure Cloud Pos</h3>
                            <p className="text-sm text-neutral-400 light:text-gray-500">Your POS is actively synced and encrypted.</p>
                        </div>
                    </div>
                    {user?.role === 'ADMIN' && (
                        <button className="whitespace-nowrap bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white light:text-gray-900 font-bold py-3 px-8 rounded-lg transition-transform active:scale-95 shadow-lg shadow-orange-500/25">
                            Renew Plan
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;
