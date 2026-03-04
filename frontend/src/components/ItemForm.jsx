import React, { useState } from 'react';

const ItemForm = ({ item, categories, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: item?.name || '',
        categoryId: item?.categoryId || (categories.length > 0 ? categories[0].id : ''),
        description: item?.description || '',
        price: item?.price || '',
        imageUrl: item?.imageUrl || '',
        active: item?.active ?? true,
        trackStock: item?.trackStock ?? false,
        stockQuantity: item?.stockQuantity || 0
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            categoryId: formData.categoryId === '' ? null : Number(formData.categoryId),
            price: Number(formData.price),
            stockQuantity: Number(formData.stockQuantity)
        });
    };

    return (
        <div className="bg-gray-800 light:bg-white p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-xl font-bold text-white light:text-gray-900 mb-6">
                {item ? 'Edit Menu Item' : 'New Menu Item'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-400 light:text-gray-500 text-sm mb-1">Item Name *</label>
                        <input
                            name="name" type="text" value={formData.name} onChange={handleChange} required
                            className="w-full bg-gray-900 light:bg-gray-50 border border-gray-700 light:border-gray-200 rounded-lg p-3 text-white light:text-gray-900 focus:border-orange-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 light:text-gray-500 text-sm mb-1">Category *</label>
                        <select
                            name="categoryId" value={formData.categoryId} onChange={handleChange} required
                            className="w-full bg-gray-900 light:bg-gray-50 border border-gray-700 light:border-gray-200 rounded-lg p-3 text-white light:text-gray-900 focus:border-orange-500 outline-none"
                        >
                            <option value="" disabled>Select Category</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-400 light:text-gray-500 text-sm mb-1">Price (₹) *</label>
                        <input
                            name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required
                            className="w-full bg-gray-900 light:bg-gray-50 border border-gray-700 light:border-gray-200 rounded-lg p-3 text-white light:text-gray-900 focus:border-orange-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 light:text-gray-500 text-sm mb-1">Image URL</label>
                        <input
                            name="imageUrl" type="url" value={formData.imageUrl} onChange={handleChange}
                            className="w-full bg-gray-900 light:bg-gray-50 border border-gray-700 light:border-gray-200 rounded-lg p-3 text-white light:text-gray-900 focus:border-orange-500 outline-none"
                            placeholder="https://..."
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-gray-400 light:text-gray-500 text-sm mb-1">Description</label>
                    <textarea
                        name="description" value={formData.description} onChange={handleChange} rows="2"
                        className="w-full bg-gray-900 light:bg-gray-50 border border-gray-700 light:border-gray-200 rounded-lg p-3 text-white light:text-gray-900 focus:border-orange-500 outline-none resize-none"
                    ></textarea>
                </div>

                <div className="flex items-center space-x-6 py-2 border-t border-gray-700 light:border-gray-200 mt-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input name="active" type="checkbox" checked={formData.active} onChange={handleChange}
                            className="w-5 h-5 text-orange-500 bg-gray-900 light:bg-gray-50 border-gray-700 light:border-gray-200 rounded" />
                        <span className="text-gray-300 light:text-gray-600">Is Active</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input name="trackStock" type="checkbox" checked={formData.trackStock} onChange={handleChange}
                            className="w-5 h-5 text-orange-500 bg-gray-900 light:bg-gray-50 border-gray-700 light:border-gray-200 rounded" />
                        <span className="text-gray-300 light:text-gray-600">Track Stock</span>
                    </label>
                </div>

                {formData.trackStock && (
                    <div>
                        <label className="block text-gray-400 light:text-gray-500 text-sm mb-1">Stock Quantity</label>
                        <input
                            name="stockQuantity" type="number" value={formData.stockQuantity} onChange={handleChange}
                            className="w-full bg-gray-900 light:bg-gray-50 border border-gray-700 light:border-gray-200 rounded-lg p-3 text-white light:text-gray-900 focus:border-orange-500 outline-none"
                        />
                    </div>
                )}

                <div className="flex space-x-3 pt-6">
                    <button type="button" onClick={onCancel} className="flex-1 py-3 text-gray-400 light:text-gray-500 font-medium hover:text-white light:hover:text-gray-900 transition">
                        Cancel
                    </button>
                    <button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white light:text-gray-900 font-medium py-3 rounded-lg transition">
                        Save Item
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ItemForm;
