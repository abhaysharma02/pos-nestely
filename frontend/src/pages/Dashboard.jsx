import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DollarSign, TrendingUp, ShoppingBag, Clock, Activity, BarChart3, Package, Heart } from 'lucide-react';

const Dashboard = () => {
    const { token } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/v1/dashboard/summary', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.success) {
                    setData(result.data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            }
            setLoading(false);
        };

        fetchDashboard();
    }, [token]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center bg-[#0a0a0a] light:bg-[#f3f4f6]">
                <div className="flex flex-col items-center">
                    <Activity className="h-10 w-10 text-orange-500 animate-pulse mb-4" />
                    <p className="text-neutral-500 light:text-gray-500 font-medium tracking-wide">Connecting to terminal...</p>
                </div>
            </div>
        );
    }

    if (!data) return <div className="p-8 text-neutral-400 light:text-gray-500 font-medium">Failed to load payload. Ensure backend is synced.</div>;

    const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, gradientClass }) => (
        <div className="relative group bg-[#161616] light:bg-white border border-[#262626] light:border-gray-200 rounded-[24px] p-6 transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-[0_12px_30px_rgba(0,0,0,0.4)] light:hover:shadow-lg overflow-hidden">
            <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full bg-gradient-to-br ${gradientClass} opacity-10 group-hover:opacity-20 transition-opacity duration-500 blur-2xl`} />
            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <h3 className="text-3xl font-black text-white light:text-gray-900 tracking-tight mb-1">{value}</h3>
                    <p className="text-[13px] font-bold text-neutral-500 light:text-gray-400 tracking-widest uppercase mb-1">{title}</p>
                    {subtitle && (
                        <p className="text-xs font-semibold text-neutral-600 light:text-gray-400 mt-2">{subtitle}</p>
                    )}
                </div>
                <div className={`p-4 rounded-2xl ${colorClass} shadow-inner`}>
                    <Icon className="h-7 w-7 text-white" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-full p-6 lg:p-10 bg-[#0a0a0a] light:bg-[#f3f4f6] font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black text-white light:text-gray-900 tracking-tight mb-2">Business Dashboard</h1>
                        <p className="text-neutral-500 light:text-gray-500 font-medium">Real-time terminal metrics and analytics snapshot.</p>
                    </div>
                </div>

                {/* Top Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Today's Revenue"
                        value={`₹${data.revenueToday?.toFixed(0) || '0'}`}
                        icon={DollarSign}
                        colorClass="bg-gradient-to-br from-orange-400 to-rose-500 shadow-orange-500/20"
                        gradientClass="from-orange-500 to-rose-500"
                    />
                    <StatCard
                        title="Orders Today"
                        value={data.totalOrdersToday || 0}
                        icon={ShoppingBag}
                        colorClass="bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/20"
                        gradientClass="from-emerald-500 to-teal-500"
                    />
                    <StatCard
                        title="Active POS Orders"
                        value={data.activeOrders || 0}
                        subtitle="Preparing or Pending"
                        icon={Clock}
                        colorClass="bg-gradient-to-br from-blue-400 to-indigo-500 shadow-blue-500/20"
                        gradientClass="from-blue-500 to-indigo-500"
                    />
                    <StatCard
                        title="Monthly Revenue"
                        value={`₹${data.revenueThisMonth?.toFixed(0) || '0'}`}
                        icon={TrendingUp}
                        colorClass="bg-gradient-to-br from-purple-400 to-fuchsia-500 shadow-purple-500/20"
                        gradientClass="from-purple-500 to-fuchsia-500"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue Breakdown */}
                    <div className="lg:col-span-2 bg-[#161616] light:bg-white border border-[#2a2a2a] light:border-gray-200 rounded-[32px] p-8 flex flex-col shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black flex items-center tracking-tight text-white light:text-gray-900">
                                <BarChart3 className="mr-3 h-7 w-7 text-orange-500" /> Revenue Summary
                            </h2>
                        </div>
                        <div className="flex-1 flex flex-col justify-center space-y-6">
                            {[
                                { label: 'Today', value: data.revenueToday, color: 'text-orange-400' },
                                { label: 'This Week', value: data.revenueThisWeek, color: 'text-emerald-400' },
                                { label: 'This Month', value: data.revenueThisMonth, color: 'text-purple-400' }
                            ].map((row, idx) => (
                                <div key={idx} className="bg-[#0a0a0a] light:bg-gray-50 p-6 rounded-2xl border border-[#262626] light:border-gray-200/50 flex justify-between items-center shadow-inner group transition-colors hover:border-[#333333]">
                                    <span className="text-neutral-500 light:text-gray-400 font-bold tracking-widest uppercase text-sm">{row.label}</span>
                                    <span className={`text-3xl font-black ${row.color}`}>₹{row.value?.toFixed(2) || '0.00'}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Selling Items */}
                    <div className="bg-[#161616] light:bg-white border border-[#2a2a2a] light:border-gray-200 rounded-[32px] p-8 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-8 shrink-0">
                            <h2 className="text-xl font-black flex items-center tracking-tight text-white light:text-gray-900">
                                <Heart className="mr-3 h-6 w-6 text-rose-500 fill-rose-500/20" /> Top Sellers
                            </h2>
                        </div>
                        {data.topSellingItems && data.topSellingItems.length > 0 ? (
                            <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
                                {data.topSellingItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between group p-3 hover:bg-[#222222] light:hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-[#333333] light:hover:border-gray-200">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#0a0a0a] light:bg-white text-neutral-400 light:text-gray-500 font-black text-sm border border-[#333333] light:border-gray-200 shadow-inner group-hover:text-orange-400 group-hover:border-orange-500/30 transition-colors">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white light:text-gray-900 group-hover:text-orange-400 transition-colors text-[15px]">{item.itemName}</p>
                                                <p className="text-[13px] font-medium text-neutral-500 light:text-gray-400 mt-0.5">{item.quantitySold} units sold</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-emerald-400 text-lg tracking-tight">₹{item.revenue?.toFixed(0) || 0}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-neutral-600 light:text-gray-400 opacity-60">
                                <Package className="h-12 w-12 mb-3" />
                                <p className="text-[15px] font-medium text-center">Not enough data to determine top sellers yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
