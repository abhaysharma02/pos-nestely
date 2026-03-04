import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Printer, CheckCircle, Search, Banknote, CreditCard, Smartphone, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PaymentService } from '../services/PaymentService';

const POS = () => {
    const { token, user } = useAuth();
    const [categories, setCategories] = useState([{ id: 'ALL', name: 'All' }]);
    const [items, setItems] = useState([]);
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    const [cart, setCart] = useState([]);

    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                const [catRes, itemRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/vendor/category`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/vendor/item`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                const catData = await catRes.json();
                const itemData = await itemRes.json();

                if (catData.success) {
                    setCategories([{ id: 'ALL', name: 'All' }, ...catData.data.filter(c => c.active)]);
                }
                if (itemData.success) {
                    setItems(itemData.data.filter(i => i.active).map(i => ({ ...i, color: 'from-orange-500/20 to-rose-500/5' })));
                }
            } catch (err) {
                console.error("Failed to load menu", err);
            }
        };
        fetchMenuData();
    }, [token]);

    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const GST_RATE = 0.05;

    const filteredItems = items.filter(item => {
        const matchesCategory = activeCategory === 'ALL' || item.categoryId === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };

    const updateQty = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.qty + delta;
                return newQty > 0 ? { ...item, qty: newQty } : item;
            }
            return item;
        }));
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discountAmount = (subtotal * discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    const gstAmount = taxableAmount * GST_RATE;
    const total = taxableAmount + gstAmount;

    const handleCheckout = async () => {
        if (cart.length === 0 || isProcessing) return;
        setIsProcessing(true);

        const orderPayload = {
            paymentMethod,
            customerName,
            customerPhone,
            subtotal,
            taxAmount: gstAmount,
            discountAmount,
            totalAmount: total,
            items: cart.map(item => ({
                itemId: item.id,
                quantity: item.qty,
                unitPrice: item.price,
                totalPrice: item.price * item.qty
            }))
        };

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderPayload)
            });
            const data = await res.json();

            if (data.success) {
                if (paymentMethod !== 'Cash' && data.data.razorpayOrderId) {
                    await PaymentService.initializePayment(
                        data.data,
                        user,
                        (response) => {
                            alert(`Payment Successful! Order Confirmed.\nPayment ID: ${response.razorpay_payment_id}`);
                            setCart([]);
                            setDiscount(0);
                            setCustomerName('');
                            setCustomerPhone('');
                            setIsProcessing(false);
                        },
                        (error) => {
                            alert(`Payment Failed: ${error.description}`);
                            setIsProcessing(false);
                        }
                    );
                } else {
                    alert(`Cash Order Placed Successfully!\nTotal: ₹${total.toFixed(2)}`);
                    setCart([]);
                    setDiscount(0);
                    setCustomerName('');
                    setCustomerPhone('');
                    setIsProcessing(false);
                }
            } else {
                alert('Order creation failed: ' + data.message);
                setIsProcessing(false);
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred during checkout.');
            setIsProcessing(false);
        }
    };

    return (
        <div className="h-full flex flex-col lg:flex-row bg-[#0a0a0a] light:bg-[#f3f4f6] overflow-hidden font-sans">
            {/* Items Section */}
            <div className="flex-1 flex flex-col h-full overflow-hidden p-5 lg:p-8 pb-24 lg:pb-8">
                {/* Header & Search */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white light:text-gray-900 tracking-tight">
                            Terminal
                        </h1>
                        <p className="text-neutral-500 light:text-gray-500 font-medium mt-1">Select items to begin order</p>
                    </div>
                    <div className="relative w-full sm:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 light:text-gray-400 h-5 w-5 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name, SKU..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-[#161616] light:bg-white border border-[#262626] light:border-gray-300 rounded-2xl py-3 pl-12 pr-4 text-white light:text-gray-900 placeholder-neutral-500 light:placeholder-gray-400 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-3 overflow-x-auto pb-4 mb-2 scrollbar-hide shrink-0">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`whitespace-nowrap px-6 py-2.5 rounded-2xl font-semibold transition-all duration-200 border shadow-sm tracking-wide text-[15px]
                                ${activeCategory === cat.id
                                    ? 'bg-orange-500 border-orange-500 text-white shadow-orange-500/25 scale-[1.02]'
                                    : 'bg-[#161616] light:bg-white border-[#262626] light:border-gray-200 text-neutral-400 light:text-gray-600 hover:text-white light:hover:text-gray-900 hover:border-neutral-700 light:hover:border-gray-300'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Items Grid */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mt-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 xl:gap-5 pb-10">
                        {filteredItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => addToCart(item)}
                                className="group relative flex flex-col items-start justify-between min-h-[140px] p-5 rounded-[20px] bg-[#161616] light:bg-white border border-[#2a2a2a] light:border-gray-200 hover:border-orange-500/50 overflow-hidden transition-all duration-300 transform hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.2)] light:shadow-sm hover:shadow-[0_12px_30px_rgba(249,115,22,0.1)] text-left"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-0`} />

                                <div className="flex justify-between items-start w-full z-10 mb-5">
                                    <div className="h-10 w-10 rounded-xl bg-[#222222] light:bg-gray-100 border border-[#333333] light:border-gray-200 flex items-center justify-center shadow-inner group-hover:bg-orange-500/10 group-hover:border-orange-500/30 transition-colors">
                                        <span className="text-lg font-bold text-neutral-500 light:text-gray-500 group-hover:text-orange-500">
                                            {item.name.charAt(0)}
                                        </span>
                                    </div>
                                    <span className="font-bold text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-xl text-sm border border-orange-500/20 shadow-sm">
                                        ₹{item.price}
                                    </span>
                                </div>
                                <div className="z-10 w-full">
                                    <h3 className="font-bold text-neutral-200 light:text-gray-800 text-lg leading-tight group-hover:text-white light:group-hover:text-black transition-colors line-clamp-2">
                                        {item.name}
                                    </h3>
                                </div>
                            </button>
                        ))}
                        {filteredItems.length === 0 && (
                            <div className="col-span-full py-32 text-center text-neutral-600 light:text-gray-400 flex flex-col items-center">
                                <Search className="h-16 w-16 mb-5 opacity-20" />
                                <p className="text-lg font-medium">No items found matching your criteria</p>
                                <button onClick={() => { setSearchQuery(''); setActiveCategory('ALL'); }} className="mt-4 text-orange-500 font-semibold hover:underline">Clear Filters</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Cart Sidebar */}
            <div className="w-full lg:w-[420px] xl:w-[480px] bg-[#111111] light:bg-white border-l border-[#1f1f1f] light:border-gray-200 flex flex-col h-[60vh] lg:h-full shrink-0 shadow-[-10px_0_40px_rgba(0,0,0,0.6)] light:shadow-[-5px_0_30px_rgba(0,0,0,0.05)] z-20 absolute bottom-0 lg:relative lg:bottom-auto transform transition-transform duration-300 rounded-t-[32px] lg:rounded-none">

                {/* Cart Header */}
                <div className="h-[72px] px-6 border-b border-[#1f1f1f] light:border-gray-200 flex justify-between items-center shrink-0">
                    <h2 className="text-[22px] font-black text-white light:text-gray-900 flex items-center tracking-tight">
                        <ShoppingCart className="mr-3 h-6 w-6 text-orange-500 drop-shadow-md" />
                        Current Order
                    </h2>
                    <span className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md shadow-orange-500/20">
                        {cart.reduce((s, i) => s + i.qty, 0)} Items
                    </span>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-3 custom-scrollbar">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-neutral-600 light:text-gray-400">
                            <ShoppingCart className="h-20 w-20 mb-6 opacity-20" />
                            <p className="text-lg font-medium">Cart is currently empty</p>
                            <p className="text-sm mt-1 opacity-70">Tap items on the left to add them</p>
                        </div>
                    ) : (
                        cart.map((item, index) => (
                            <div key={`${item.id}-${index}`} className="flex justify-between items-center bg-[#161616] light:bg-[#f8f9fa] border border-[#2a2a2a] light:border-gray-200 p-3.5 rounded-2xl hover:border-orange-500/30 transition-colors shadow-sm">
                                <div className="flex-1 pr-4 min-w-0">
                                    <h4 className="text-white light:text-gray-900 font-semibold truncate text-[15px]">{item.name}</h4>
                                    <p className="text-orange-400 font-bold text-sm mt-0.5">₹{item.price}</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="flex items-center bg-[#0a0a0a] light:bg-white rounded-xl border border-[#2a2a2a] light:border-gray-200 shadow-inner">
                                        <button onClick={() => updateQty(item.id, -1)} className="p-2 text-neutral-400 light:text-gray-500 hover:text-white light:hover:text-black hover:bg-[#222222] light:hover:bg-gray-100 rounded-lg transition-colors">
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="w-8 text-center text-white light:text-gray-900 font-bold text-[15px]">{item.qty}</span>
                                        <button onClick={() => updateQty(item.id, 1)} className="p-2 text-neutral-400 light:text-gray-500 hover:text-white light:hover:text-black hover:bg-[#222222] light:hover:bg-gray-100 rounded-lg transition-colors">
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Summary & Checkout */}
                <div className="px-6 py-6 border-t border-[#1f1f1f] light:border-gray-200 bg-[#0d0d0d] light:bg-[#f9fafb] flex flex-col gap-5 shrink-0">

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] text-neutral-500 light:text-gray-400 uppercase font-bold tracking-widest mb-1.5 block">Customer</label>
                            <input
                                type="text"
                                placeholder="Name (Optional)"
                                value={customerName}
                                onChange={e => setCustomerName(e.target.value)}
                                className="w-full bg-[#161616] light:bg-white border border-[#2a2a2a] light:border-gray-200 rounded-xl py-2.5 px-3 text-white light:text-gray-900 text-sm outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all font-medium placeholder-neutral-600"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] text-neutral-500 light:text-gray-400 uppercase font-bold tracking-widest mb-1.5 block">Phone</label>
                            <input
                                type="text"
                                placeholder="WhatsApp No."
                                value={customerPhone}
                                onChange={e => setCustomerPhone(e.target.value)}
                                className="w-full bg-[#161616] light:bg-white border border-[#2a2a2a] light:border-gray-200 rounded-xl py-2.5 px-3 text-white light:text-gray-900 text-sm outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all font-medium placeholder-neutral-600"
                            />
                        </div>
                    </div>

                    {/* Payment & Discount */}
                    <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-4">
                            <label className="text-[11px] text-neutral-500 light:text-gray-400 uppercase font-bold tracking-widest mb-1.5 block">Discount %</label>
                            <input
                                type="number"
                                min="0" max="100"
                                value={discount === 0 ? '' : discount}
                                placeholder="0"
                                onChange={e => setDiscount(Number(e.target.value))}
                                className="w-full bg-[#161616] light:bg-white border border-[#2a2a2a] light:border-gray-200 rounded-xl py-2.5 px-3 text-white light:text-gray-900 text-sm outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all font-medium text-center placeholder-neutral-600"
                            />
                        </div>
                        <div className="col-span-8">
                            <label className="text-[11px] text-neutral-500 light:text-gray-400 uppercase font-bold tracking-widest mb-1.5 block">Payment Mode</label>
                            <div className="flex bg-[#161616] light:bg-gray-200 border border-[#2a2a2a] light:border-transparent rounded-xl p-1 shadow-inner h-[42px]">
                                {[
                                    { id: 'Cash', icon: Banknote },
                                    { id: 'Card', icon: CreditCard },
                                    { id: 'UPI', icon: Smartphone }
                                ].map(method => {
                                    const Icon = method.icon;
                                    const isActive = paymentMethod === method.id;
                                    return (
                                        <button
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-sm font-semibold rounded-lg transition-all
                                                ${isActive
                                                    ? 'bg-[#2a2a2a] light:bg-white text-white light:text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.3)] light:shadow-sm border border-[#3a3a3a] light:border-gray-100'
                                                    : 'text-neutral-500 light:text-gray-500 hover:text-neutral-300 light:hover:text-gray-700'
                                                }`}
                                        >
                                            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-400' : ''}`} />
                                            {method.id}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="bg-[#161616] light:bg-white rounded-2xl p-4 border border-[#2a2a2a] light:border-gray-200 shadow-sm">
                        <div className="space-y-2.5 text-sm font-medium mb-3">
                            <div className="flex justify-between text-neutral-400 light:text-gray-500">
                                <span>Subtotal</span>
                                <span className="text-white light:text-gray-800">₹{subtotal.toFixed(2)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-rose-400">
                                    <span>Discount (-{discount}%)</span>
                                    <span>-₹{discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-neutral-400 light:text-gray-500">
                                <span>GST (5%)</span>
                                <span className="text-white light:text-gray-800">₹{gstAmount.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-end pt-3 border-t border-[#2a2a2a] light:border-gray-100 mt-1">
                            <span className="text-neutral-400 light:text-gray-500 text-sm font-bold uppercase tracking-widest mb-1">Total Amount</span>
                            <span className="text-3xl font-black bg-gradient-to-r from-white to-neutral-300 light:from-gray-900 light:to-gray-700 bg-clip-text text-transparent">₹{total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button className="flex items-center justify-center w-[72px] bg-[#1a1a1a] light:bg-white border border-[#2a2a2a] light:border-gray-200 text-neutral-400 hover:text-white light:hover:text-gray-800 rounded-2xl hover:bg-[#222222] light:hover:bg-gray-50 transition-all shadow-sm">
                            <Printer className="h-6 w-6" />
                        </button>
                        <button
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || isProcessing}
                            className={`flex-1 flex items-center justify-center py-4 rounded-2xl font-black text-lg transition-all duration-300 
                                ${cart.length === 0 || isProcessing
                                    ? 'bg-[#1a1a1a] light:bg-gray-200 border border-[#2a2a2a] light:border-transparent text-neutral-600 light:text-gray-400 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-[0_8px_24px_-6px_rgba(249,115,22,0.4)] hover:shadow-[0_12px_28px_-6px_rgba(249,115,22,0.6)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'
                                }`}
                        >
                            {isProcessing ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Processing...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5" />
                                    Charge ₹{total.toFixed(2)}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POS;
