import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CategoryForm from '../components/CategoryForm';
import ItemForm from '../components/ItemForm';
import { Plus, Edit2, Trash2, Layers, Package, Search } from 'lucide-react';

const MenuManagementPage = () => {
    const { token } = useAuth();
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);

    const [activeTab, setActiveTab] = useState('items'); // 'categories' or 'items'
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [showItemForm, setShowItemForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [token]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [catRes, itemRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/vendor/category`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/vendor/item`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            const catData = await catRes.json();
            const itemData = await itemRes.json();
            if (catData.success) setCategories(catData.data);
            if (itemData.success) setItems(itemData.data);
        } catch (err) {
            console.error('Failed to fetch menu data', err);
        }
        setLoading(false);
    };

    const handleSaveCategory = async (catData) => {
        const method = editingCategory ? 'PUT' : 'POST';
        const url = editingCategory
            ? `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/vendor/category/${editingCategory.id}`
            : `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/vendor/category`;

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(catData)
            });
            const data = await res.json();
            if (data.success) {
                setShowCategoryForm(false);
                setEditingCategory(null);
                fetchData();
            }
        } catch (err) {
            console.error('Save category failed', err);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/vendor/category/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            console.error('Delete category failed', err);
        }
    };

    const handleSaveItem = async (itemData) => {
        const method = editingItem ? 'PUT' : 'POST';
        const url = editingItem
            ? `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/vendor/item/${editingItem.id}`
            : `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/vendor/item`;

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(itemData)
            });
            const data = await res.json();
            if (data.success) {
                setShowItemForm(false);
                setEditingItem(null);
                fetchData();
            }
        } catch (err) {
            console.error('Save item failed', err);
        }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/vendor/item/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            console.error('Delete item failed', err);
        }
    };

    return (
        <div className="min-h-full p-6 lg:p-10 bg-[#0a0a0a] light:bg-[#f3f4f6] font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white light:text-gray-900 tracking-tight mb-2">Menu Management</h1>
                        <p className="text-neutral-500 light:text-gray-500 font-medium tracking-wide">Configure your categories and terminal products.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <button
                            onClick={() => { setShowCategoryForm(true); setEditingCategory(null); }}
                            className="bg-[#161616] light:bg-white text-neutral-300 light:text-gray-700 hover:text-white light:hover:text-black border border-[#2a2a2a] light:border-gray-200 hover:border-[#3a3a3a] light:hover:border-gray-300 px-5 py-3 rounded-2xl flex items-center justify-center transition-all shadow-sm font-bold hover:-translate-y-0.5"
                        >
                            <Plus size={18} className="mr-2" /> New Category
                        </button>
                        <button
                            onClick={() => { setShowItemForm(true); setEditingItem(null); }}
                            className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white px-5 py-3 rounded-2xl flex items-center justify-center transition-all shadow-md shadow-orange-500/20 font-bold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/30"
                        >
                            <Plus size={18} className="mr-2" /> New Item
                        </button>
                    </div>
                </div>

                {/* Unified Segmented Toggles */}
                <div className="flex w-max bg-[#161616] light:bg-gray-200 border border-[#2a2a2a] light:border-transparent rounded-2xl p-1 shadow-inner h-[52px]">
                    <button
                        onClick={() => setActiveTab('items')}
                        className={`flex items-center px-6 py-2 font-bold rounded-xl transition-all duration-200 ${activeTab === 'items' ? 'bg-[#2a2a2a] light:bg-white text-white light:text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.3)] light:shadow-sm border border-[#3a3a3a] light:border-gray-100 scale-100' : 'text-neutral-500 light:text-gray-500 hover:text-neutral-300 light:hover:text-gray-700 scale-95 hover:scale-100'}`}
                    >
                        <Package size={18} className={`mr-2.5 ${activeTab === 'items' ? 'text-orange-500' : ''}`} /> Menu Items
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`flex items-center px-6 py-2 font-bold rounded-xl transition-all duration-200 ${activeTab === 'categories' ? 'bg-[#2a2a2a] light:bg-white text-white light:text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.3)] light:shadow-sm border border-[#3a3a3a] light:border-gray-100 scale-100' : 'text-neutral-500 light:text-gray-500 hover:text-neutral-300 light:hover:text-gray-700 scale-95 hover:scale-100'}`}
                    >
                        <Layers size={18} className={`mr-2.5 ${activeTab === 'categories' ? 'text-orange-500' : ''}`} /> Categories
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                        <div className="h-48 bg-[#161616] light:bg-white border border-[#2a2a2a] light:border-gray-200 rounded-[32px]"></div>
                        <div className="h-48 bg-[#161616] light:bg-white border border-[#2a2a2a] light:border-gray-200 rounded-[32px]"></div>
                    </div>
                ) : (
                    <div>
                        {activeTab === 'categories' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {categories.map(cat => (
                                    <div key={cat.id} className="group relative bg-[#161616] light:bg-white rounded-[32px] p-6 border border-[#2a2a2a] light:border-gray-200 flex flex-col justify-between hover:border-orange-500/50 hover:shadow-[0_8px_30px_rgba(249,115,22,0.1)] light:hover:shadow-md transition-all duration-300 overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-gradient-to-br from-orange-500/10 to-rose-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-0 pointer-events-none" />

                                        <div className="z-10 flex justify-between items-start mb-6">
                                            <div className="flex-1 pr-4">
                                                <h3 className="text-xl font-black text-white light:text-gray-900 truncate mb-2">{cat.name}</h3>
                                                <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${cat.active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                                    {cat.active ? 'Active' : 'Hidden'}
                                                </span>
                                            </div>
                                            <div className="flex space-x-2 shrink-0">
                                                <button onClick={() => { setEditingCategory(cat); setShowCategoryForm(true); }} className="p-2.5 bg-[#0a0a0a] light:bg-gray-50 text-neutral-400 hover:text-orange-500 rounded-xl border border-[#222222] light:border-gray-200 transition-colors shadow-sm">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteCategory(cat.id)} className="p-2.5 bg-[#0a0a0a] light:bg-gray-50 text-neutral-400 hover:text-rose-500 rounded-xl border border-[#222222] light:border-gray-200 transition-colors shadow-sm">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="z-10 mt-auto pt-4 border-t border-[#2a2a2a] light:border-gray-100">
                                            <p className="text-xs font-bold text-neutral-500 light:text-gray-500 uppercase tracking-widest text-right">Category ID: {cat.id.slice(0, 6)}</p>
                                        </div>
                                    </div>
                                ))}
                                {categories.length === 0 && (
                                    <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-[#2a2a2a] light:border-gray-300 rounded-[32px]">
                                        <Layers size={48} className="mb-4 text-neutral-600 light:text-gray-300 opacity-50" />
                                        <p className="text-lg font-medium text-neutral-400 light:text-gray-500">No categories created yet.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'items' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                {items.map(item => (
                                    <div key={item.id} className="group relative bg-[#161616] light:bg-white rounded-[32px] overflow-hidden border border-[#2a2a2a] light:border-gray-200 flex flex-col hover:border-orange-500/50 hover:shadow-[0_8px_30px_rgba(249,115,22,0.1)] light:hover:shadow-md transition-all duration-300">

                                        <div className="relative h-44 bg-[#0a0a0a] light:bg-gray-100 border-b border-[#2a2a2a] light:border-gray-200 overflow-hidden shrink-0 group-hover:opacity-90 transition-opacity">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex h-full items-center justify-center opacity-20">
                                                    <Package size={64} className="text-neutral-500 light:text-gray-400" />
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4 bg-[#111111]/80 light:bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#333333] light:border-gray-200 shadow-xl">
                                                <span className="font-black text-orange-400 light:text-orange-500 text-[15px]">₹{item.price}</span>
                                            </div>
                                        </div>

                                        <div className="p-6 flex-1 flex flex-col relative z-10">
                                            <h3 className="text-lg font-black text-white light:text-gray-900 line-clamp-2 leading-tight mb-2 group-hover:text-orange-400 transition-colors">{item.name}</h3>
                                            {item.description ? (
                                                <p className="text-[13px] font-medium text-neutral-400 light:text-gray-500 line-clamp-2 leading-relaxed mb-4">{item.description}</p>
                                            ) : (
                                                <div className="mb-4"></div>
                                            )}

                                            <div className="mt-auto pt-5 flex items-end justify-between border-t border-[#2a2a2a] light:border-gray-100">
                                                <div className="flex flex-col space-y-2">
                                                    <span className={`inline-flex w-max items-center text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${item.active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                                        {item.active ? 'Active' : 'Hidden'}
                                                    </span>
                                                    {item.trackStock && (
                                                        <span className="text-[11px] font-bold tracking-widest text-neutral-500 light:text-gray-500 uppercase">Stock: {item.stockQuantity}</span>
                                                    )}
                                                </div>
                                                <div className="flex space-x-2 shrink-0">
                                                    <button onClick={() => { setEditingItem(item); setShowItemForm(true); }} className="p-2.5 bg-[#0a0a0a] light:bg-gray-50 text-neutral-400 hover:text-orange-500 rounded-xl border border-[#222222] light:border-gray-200 transition-colors shadow-sm">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteItem(item.id)} className="p-2.5 bg-[#0a0a0a] light:bg-gray-50 text-neutral-400 hover:text-rose-500 rounded-xl border border-[#222222] light:border-gray-200 transition-colors shadow-sm">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {items.length === 0 && (
                                    <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-[#2a2a2a] light:border-gray-300 rounded-[32px]">
                                        <Package size={48} className="mb-4 text-neutral-600 light:text-gray-300 opacity-50" />
                                        <p className="text-lg font-medium text-neutral-400 light:text-gray-500">No items available.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showCategoryForm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="w-full max-w-md bg-[#161616] light:bg-white border border-[#2a2a2a] light:border-gray-200 rounded-[32px] p-2 shadow-2xl">
                        <CategoryForm
                            category={editingCategory}
                            onSave={handleSaveCategory}
                            onCancel={() => { setShowCategoryForm(false); setEditingCategory(null); }}
                        />
                    </div>
                </div>
            )}

            {showItemForm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 py-10 z-50 overflow-y-auto">
                    <div className="w-full max-w-2xl bg-[#161616] light:bg-white border border-[#2a2a2a] light:border-gray-200 rounded-[32px] p-2 shadow-2xl my-auto">
                        <ItemForm
                            item={editingItem}
                            categories={categories}
                            onSave={handleSaveItem}
                            onCancel={() => { setShowItemForm(false); setEditingItem(null); }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuManagementPage;
