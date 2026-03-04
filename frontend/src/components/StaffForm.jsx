import React, { useState } from 'react';

const StaffForm = ({ staff, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: staff?.name || '',
        email: staff?.email || '',
        password: '',
        role: staff?.role || 'BILLING', // default
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="bg-neutral-900 light:bg-white border border-neutral-800 light:border-gray-200 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white light:text-gray-900 mb-6">
                {staff ? 'Edit Staff Member' : 'Add New Staff Member'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-neutral-400 light:text-gray-500 text-sm mb-1">Full Name *</label>
                    <input
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-neutral-950 light:bg-gray-50 border border-neutral-800 light:border-gray-200 rounded-lg p-3 text-white light:text-gray-900 focus:border-orange-500 outline-none transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-neutral-400 light:text-gray-500 text-sm mb-1">Email Address *</label>
                    <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        readOnly={!!staff}
                        className={`w-full bg-neutral-950 light:bg-gray-50 border border-neutral-800 light:border-gray-200 rounded-lg p-3 text-white light:text-gray-900 focus:border-orange-500 outline-none transition-colors ${staff ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                </div>

                <div>
                    <label className="block text-neutral-400 light:text-gray-500 text-sm mb-1">
                        {staff ? 'New Password (leave blank to keep current)' : 'Password *'}
                    </label>
                    <input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required={!staff}
                        className="w-full bg-neutral-950 light:bg-gray-50 border border-neutral-800 light:border-gray-200 rounded-lg p-3 text-white light:text-gray-900 focus:border-orange-500 outline-none transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-neutral-400 light:text-gray-500 text-sm mb-1">System Role *</label>
                    <div className="flex bg-neutral-950 light:bg-gray-50 border border-neutral-800 light:border-gray-200 rounded-lg p-1">
                        {['BILLING', 'KITCHEN', 'ADMIN'].map(r => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, role: r }))}
                                className={`flex-1 py-2 text-sm rounded transition-colors ${formData.role === r ? 'bg-orange-500 text-white light:text-gray-900 font-medium' : 'text-neutral-400 light:text-gray-500 hover:text-white light:hover:text-gray-900'}`}
                            >
                                {r.charAt(0) + r.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex space-x-3 pt-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-3 text-neutral-400 light:text-gray-500 font-medium hover:text-white light:hover:text-gray-900 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white light:text-gray-900 font-medium py-3 rounded-lg transition-colors"
                    >
                        {staff ? 'Save Changes' : 'Create Member'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StaffForm;
