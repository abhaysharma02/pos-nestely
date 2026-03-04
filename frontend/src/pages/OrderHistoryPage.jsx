import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Calendar, FileText, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

const OrderHistoryPage = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('');

    const fetchOrders = async () => {
        setLoading(true);
        try {
            let url = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/orders/history?page=${page}&size=10`;
            if (statusFilter !== 'ALL') url += `&status=${statusFilter}`;
            if (dateFilter) {
                url += `&startDate=${dateFilter}&endDate=${dateFilter}`;
            }

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setOrders(data.data.content);
                setTotalPages(data.data.totalPages);
            }
        } catch (err) {
            console.error('Failed to fetch orders', err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, [page, statusFilter, dateFilter, token]);

    const getStatusBadge = (status) => {
        let colors = '';
        let IconElement = null;

        switch (status) {
            case 'CONFIRMED':
            case 'COMPLETED':
                colors = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
                IconElement = CheckCircle;
                break;
            case 'FAILED':
            case 'CANCELLED':
                colors = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
                IconElement = XCircle;
                break;
            default:
                colors = 'bg-orange-500/10 text-orange-500 border-orange-500/20';
                IconElement = Clock;
        }

        return (
            <span className={`inline-flex items-center text-xs px-3 py-1.5 rounded-full border font-bold tracking-wide uppercase shadow-sm ${colors}`}>
                {IconElement && <IconElement size={14} className="mr-1.5" />}
                {status}
            </span>
        );
    };

    return (
        <div className="min-h-full p-6 lg:p-10 bg-[#0a0a0a] light:bg-[#f3f4f6] font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header & Filters */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white light:text-gray-900 tracking-tight mb-2">Order History</h1>
                        <p className="text-neutral-500 light:text-gray-500 font-medium tracking-wide">View and manage past terminal transactions.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative group">
                            <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 light:text-gray-400 group-focus-within:text-orange-500 transition-colors z-10" />
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                                className="w-full sm:w-56 bg-[#161616] light:bg-white border border-[#2a2a2a] light:border-gray-300 rounded-2xl py-3 pl-12 pr-10 text-white light:text-gray-900 appearance-none outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm font-medium cursor-pointer"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="FAILED">Failed</option>
                                <option value="INITIATED">Initiated</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                                <ChevronRight size={16} className="rotate-90" />
                            </div>
                        </div>
                        <div className="relative group">
                            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 light:text-gray-400 group-focus-within:text-orange-500 transition-colors z-10" />
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => { setDateFilter(e.target.value); setPage(0); }}
                                className="w-full sm:w-48 bg-[#161616] light:bg-white border border-[#2a2a2a] light:border-gray-300 rounded-2xl py-3 pl-12 pr-4 text-white light:text-gray-900 appearance-none outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm font-medium cursor-pointer custom-date-input"
                            />
                        </div>
                    </div>
                </div>

                {/* Data Grid */}
                <div className="bg-[#161616] light:bg-white border border-[#2a2a2a] light:border-gray-200 rounded-[32px] overflow-hidden shadow-sm flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-[#0a0a0a] light:bg-gray-50 border-b border-[#2a2a2a] light:border-gray-200 shadow-sm">
                                    <th className="px-6 py-5 text-xs font-bold text-neutral-500 light:text-gray-500 uppercase tracking-widest">Order ID</th>
                                    <th className="px-6 py-5 text-xs font-bold text-neutral-500 light:text-gray-500 uppercase tracking-widest">Date & Time</th>
                                    <th className="px-6 py-5 text-xs font-bold text-neutral-500 light:text-gray-500 uppercase tracking-widest">Items</th>
                                    <th className="px-6 py-5 text-xs font-bold text-neutral-500 light:text-gray-500 uppercase tracking-widest">Total Amount</th>
                                    <th className="px-6 py-5 text-xs font-bold text-neutral-500 light:text-gray-500 uppercase tracking-widest">Payment</th>
                                    <th className="px-6 py-5 text-xs font-bold text-neutral-500 light:text-gray-500 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-5 text-xs font-bold text-neutral-500 light:text-gray-500 uppercase tracking-widest text-right">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2a2a2a] light:divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-16 text-center text-neutral-500 light:text-gray-400 font-medium">Fetching orders...</td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-24 text-center flex flex-col items-center justify-center w-full min-w-[800px]">
                                            <FileText size={48} className="mb-4 text-neutral-600 light:text-gray-300 opacity-50" />
                                            <p className="text-lg font-medium text-neutral-400 light:text-gray-500">No orders found matching the filter criteria.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-[#1a1a1a] light:hover:bg-gray-50 transition-colors group cursor-default">
                                            <td className="px-6 py-5">
                                                <div className="font-black text-white light:text-gray-900 group-hover:text-orange-400 transition-colors">#{order.tokenNumber}</div>
                                                <div className="text-[11px] font-bold text-neutral-600 light:text-gray-400 mt-1 uppercase tracking-wider">ID: {order.id.slice(0, 8)}...</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="font-medium text-neutral-200 light:text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</div>
                                                <div className="text-xs font-semibold text-neutral-500 light:text-gray-500 mt-1">{new Date(order.createdAt).toLocaleTimeString()}</div>
                                            </td>
                                            <td className="px-6 py-5 max-w-[250px]">
                                                <div className="text-[13px] font-medium text-neutral-400 light:text-gray-600 truncate bg-[#0a0a0a] light:bg-gray-100 px-3 py-1.5 rounded-lg border border-[#222222] light:border-transparent inline-block max-w-full hover:max-w-none hover:absolute hover:z-10 hover:shadow-xl transition-all">
                                                    {order.items.map(i => `${i.quantity}x ${i.itemName}`).join(', ')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="font-black text-lg text-emerald-400 bg-emerald-500/5 px-3 py-1 rounded-xl inline-block border border-emerald-500/10">
                                                    ₹{order.totalAmount.toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="font-bold text-[13px] text-neutral-400 light:text-gray-600 bg-[#222222] light:bg-gray-100 px-3 py-1 rounded-lg border border-[#333333] light:border-transparent">
                                                    {order.paymentMethod}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                {getStatusBadge(order.status)}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button className="inline-flex items-center justify-center p-2.5 bg-[#111111] light:bg-white hover:bg-[#222222] light:hover:bg-gray-50 text-neutral-400 light:text-gray-600 hover:text-white light:hover:text-gray-900 rounded-xl border border-[#2a2a2a] light:border-gray-200 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5" title="View Receipt">
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <div className="px-6 py-5 border-t border-[#2a2a2a] light:border-gray-200 bg-[#0a0a0a] light:bg-gray-50 flex items-center justify-between text-sm shrink-0">
                            <span className="font-bold text-neutral-500 light:text-gray-500 uppercase tracking-widest text-[11px]">
                                Page {page + 1} of {totalPages}
                            </span>
                            <div className="flex gap-3">
                                <button
                                    disabled={page === 0}
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    className="flex items-center px-4 py-2 bg-[#161616] light:bg-white border border-[#2a2a2a] light:border-gray-200 text-neutral-300 light:text-gray-700 font-bold rounded-xl hover:bg-[#222222] light:hover:bg-gray-50 disabled:opacity-50 disabled:hover:-translate-y-0 hover:-translate-y-0.5 transition-all shadow-sm disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={18} className="mr-1.5" /> Prev
                                </button>
                                <button
                                    disabled={page >= totalPages - 1}
                                    onClick={() => setPage(p => p + 1)}
                                    className="flex items-center px-4 py-2 bg-[#161616] light:bg-white border border-[#2a2a2a] light:border-gray-200 text-neutral-300 light:text-gray-700 font-bold rounded-xl hover:bg-[#222222] light:hover:bg-gray-50 disabled:opacity-50 disabled:hover:-translate-y-0 hover:-translate-y-0.5 transition-all shadow-sm disabled:cursor-not-allowed"
                                >
                                    Next <ChevronRight size={18} className="ml-1.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderHistoryPage;
