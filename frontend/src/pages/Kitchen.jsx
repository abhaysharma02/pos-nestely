import React, { useState } from 'react';
import { ChefHat, CheckCircle, Clock, Utensils, AlertTriangle } from 'lucide-react';

const MOCK_ORDERS = [
    {
        id: 1,
        tokenNumber: 'T-101',
        status: 'Pending',
        time: '2 mins ago',
        items: [
            { name: 'Paneer Tikka', qty: 2 },
            { name: 'Garlic Naan', qty: 4 }
        ]
    },
    {
        id: 2,
        tokenNumber: 'T-102',
        status: 'Preparing',
        time: '5 mins ago',
        items: [
            { name: 'Butter Chicken', qty: 1 },
            { name: 'Mojito', qty: 2 }
        ]
    }
];

const Kitchen = () => {
    const [orders, setOrders] = useState(MOCK_ORDERS);

    const updateStatus = (id, newStatus) => {
        setOrders(prev => prev.map(order => {
            if (order.id === id) {
                return { ...order, status: newStatus };
            }
            return order;
        }));
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending':
                return {
                    headerBg: 'bg-rose-500',
                    headerText: 'text-white',
                    cardBorder: 'border-rose-500/30',
                    glow: 'shadow-[0_8px_30px_rgba(244,63,94,0.15)]',
                    badge: 'bg-rose-500/20 text-rose-500 border-rose-500/30'
                };
            case 'Preparing':
                return {
                    headerBg: 'bg-amber-500',
                    headerText: 'text-white',
                    cardBorder: 'border-amber-500/30',
                    glow: 'shadow-[0_8px_30px_rgba(245,158,11,0.15)]',
                    badge: 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                };
            default:
                return {
                    headerBg: 'bg-[#222222] light:bg-gray-200',
                    headerText: 'text-white light:text-gray-900',
                    cardBorder: 'border-[#2a2a2a] light:border-gray-300',
                    glow: 'shadow-sm',
                    badge: 'bg-[#222222] light:bg-gray-200 text-neutral-400 light:text-gray-600 border-[#333333] light:border-gray-300'
                };
        }
    };

    return (
        <div className="h-full bg-[#050505] light:bg-[#eef0f3] flex flex-col p-6 lg:p-10 overflow-hidden font-sans">

            {/* Header */}
            <div className="flex justify-between items-center mb-8 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#111111] light:bg-white border border-[#2a2a2a] light:border-gray-200 flex flex-col items-center justify-center shadow-inner text-orange-500">
                        <ChefHat className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white light:text-gray-900 tracking-tight leading-none mb-1">
                            Kitchen Display
                        </h1>
                        <p className="text-neutral-500 light:text-gray-500 font-bold tracking-widest text-[11px] uppercase">
                            Live Order Tickets
                        </p>
                    </div>
                </div>

                <div className="flex bg-[#111111] light:bg-white border border-[#2a2a2a] light:border-gray-200 rounded-2xl p-2 shadow-sm gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0 animate-pulse"></span>
                        <span className="text-xs font-bold tracking-widest uppercase">Pending</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                        <span className="text-xs font-bold tracking-widest uppercase">Preparing</span>
                    </div>
                </div>
            </div>

            {/* Orders Grid (Tickets) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {orders.filter(o => o.status !== 'Ready').map(order => {
                        const style = getStatusStyle(order.status);

                        return (
                            <div
                                key={order.id}
                                className={`flex flex-col rounded-[24px] bg-[#111111] light:bg-white border-2 overflow-hidden transition-all duration-300 hover:-translate-y-1 ${style.cardBorder} ${style.glow} relative group`}
                            >
                                {/* Ticket Header */}
                                <div className={`px-5 py-4 ${style.headerBg} flex justify-between items-center transition-colors shadow-sm`}>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-black/20 px-2 py-1 rounded-lg">
                                            <Utensils className={`h-5 w-5 ${style.headerText} opacity-90`} />
                                        </div>
                                        <span className={`text-2xl font-black ${style.headerText} tracking-tight`}>
                                            #{order.tokenNumber}
                                        </span>
                                    </div>
                                    <div className={`px-2.5 py-1 rounded-lg bg-black/20 flex flex-col items-end`}>
                                        <span className={`text-[10px] font-bold tracking-widest uppercase ${style.headerText} opacity-80 mb-0.5`}>Time</span>
                                        <div className={`flex items-center gap-1.5 text-sm font-black ${style.headerText}`}>
                                            <Clock className="h-3.5 w-3.5" />
                                            {order.time.replace(' mins ago', 'm')}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items (List) */}
                                <div className="p-5 flex-1 space-y-4 bg-[repeating-linear-gradient(transparent,transparent_39px,#1a1a1a_40px)] light:bg-[repeating-linear-gradient(transparent,transparent_39px,#f3f4f6_40px)]">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start pt-1.5 h-[40px] group-hover:bg-[#1a1a1a]/50 light:group-hover:bg-gray-50/50 rounded-lg px-2 -mx-2 transition-colors">
                                            <span className="text-lg text-white light:text-gray-900 font-bold leading-tight mt-0.5 line-clamp-1 pr-2">{item.name}</span>
                                            <span className="bg-[#222222] light:bg-gray-200 border border-[#333333] light:border-gray-300 px-3 py-1 rounded-xl text-orange-400 font-black text-lg shadow-inner shrink-0 leading-none">
                                                x{item.qty}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Action Button */}
                                <div className="p-4 bg-[#0a0a0a] light:bg-gray-50 border-t border-[#222222] light:border-gray-200 mt-auto shrink-0 flex gap-2">
                                    {order.status === 'Pending' && (
                                        <button
                                            onClick={() => updateStatus(order.id, 'Preparing')}
                                            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-amber-500 bg-amber-500/10 hover:bg-amber-500 hover:text-white border-2 border-amber-500/30 transition-all uppercase tracking-widest text-[13px] active:scale-95 shadow-sm"
                                        >
                                            <AlertTriangle className="h-4 w-4" /> Start Preparing
                                        </button>
                                    )}

                                    {order.status === 'Preparing' && (
                                        <button
                                            onClick={() => updateStatus(order.id, 'Ready')}
                                            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-white bg-emerald-500 border-2 border-emerald-500 hover:bg-emerald-400 hover:border-emerald-400 transition-all uppercase tracking-widest text-[13px] shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.5)] active:scale-95"
                                        >
                                            <CheckCircle className="h-5 w-5" /> Mark Ready
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {orders.filter(o => o.status !== 'Ready').length === 0 && (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center bg-[#111111] light:bg-white border-2 border-dashed border-[#2a2a2a] light:border-gray-300 rounded-[32px]">
                            <div className="w-24 h-24 bg-[#1a1a1a] light:bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-[#222222] light:border-gray-200">
                                <CheckCircle className="h-12 w-12 text-emerald-500/50 light:text-emerald-500/80" />
                            </div>
                            <h3 className="text-3xl font-black text-white light:text-gray-900 tracking-tight mb-2">All Caught Up!</h3>
                            <p className="font-bold text-neutral-500 light:text-gray-500 tracking-wide uppercase text-sm">No pending orders in the kitchen queue.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Kitchen;
