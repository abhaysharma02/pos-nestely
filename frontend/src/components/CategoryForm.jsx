import React, { useState } from 'react';

const CategoryForm = ({ category, onSave, onCancel }) => {
    const [name, setName] = useState(category ? category.name : '');
    const [active, setActive] = useState(category ? category.active : true);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave({ name, active });
    };

    return (
        <div className="bg-gray-800 light:bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold text-white light:text-gray-900 mb-4">
                {category ? 'Edit Category' : 'New Category'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-400 light:text-gray-500 text-sm mb-1">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-gray-900 light:bg-gray-50 border border-gray-700 light:border-gray-200 rounded-lg p-3 text-white light:text-gray-900 focus:border-orange-500 outline-none"
                        placeholder="e.g. Starter"
                        required
                    />
                </div>
                <div className="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                        className="w-5 h-5 text-orange-500 rounded bg-gray-900 light:bg-gray-50 border-gray-700 light:border-gray-200"
                    />
                    <label className="text-gray-300 light:text-gray-600">Is Active</label>
                </div>
                <div className="flex space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-3 text-gray-400 light:text-gray-500 font-medium hover:text-white light:hover:text-gray-900 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white light:text-gray-900 font-medium py-3 rounded-lg transition"
                    >
                        Save Category
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CategoryForm;
