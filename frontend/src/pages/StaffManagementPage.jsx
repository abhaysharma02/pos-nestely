import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Users, Shield, Receipt, ChefHat } from 'lucide-react';
import StaffForm from '../components/StaffForm';

const StaffManagementPage = () => {
    const { token, user } = useAuth();
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [error, setError] = useState('');

    if (user?.role !== 'ADMIN') {
        return (
            <div className="min-h-full p-8 bg-[#0a0a0a] light:bg-[#f3f4f6] flex flex-col items-center justify-center">
                <Shield size={64} className="text-rose-500 mb-6 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]" />
                <h1 className="text-3xl font-black text-white light:text-gray-900 tracking-tight">Access Denied</h1>
                <p className="text-neutral-500 light:text-gray-500 mt-2 font-medium">Only administrators can manage staff accounts.</p>
            </div>
        );
    }

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/v1/staff', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setStaffList(data.data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            console.error('Failed to fetch staff', err);
            setError('Connection error');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchStaff();
    }, [token]);

    const handleSaveStaff = async (formData) => {
        const isEditing = !!editingStaff;
        const url = isEditing
            ? `http://localhost:8080/api/v1/staff/${editingStaff.id}`
            : `http://localhost:8080/api/v1/staff`;

        try {
            const res = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                setShowForm(false);
                setEditingStaff(null);
                fetchStaff();
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error('Save staff failed', err);
            alert('Failed to save staff member');
        }
    };

    const handleDelete = async (id, email) => {
        if (email === user.email) {
            alert("You cannot delete your own admin account.");
            return;
        }
        if (!window.confirm('Are you sure you want to delete this staff member?')) return;

        try {
            await fetch(`http://localhost:8080/api/v1/staff/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchStaff();
        } catch (err) {
            console.error('Delete staff failed', err);
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'ADMIN': return <Shield size={16} className="text-rose-400 mr-2" />;
            case 'KITCHEN': return <ChefHat size={16} className="text-emerald-400 mr-2" />;
            case 'BILLING': return <Receipt size={16} className="text-blue-400 mr-2" />;
            default: return <Users size={16} className="text-neutral-400 light:text-gray-500 mr-2" />;
        }
    };

    const getRoleColors = (role) => {
        switch (role) {
            case 'ADMIN': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'KITCHEN': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'BILLING': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default: return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20';
        }
    };

    return (
        <div className="min-h-full p-6 lg:p-10 bg-[#0a0a0a] light:bg-[#f3f4f6] font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white light:text-gray-900 tracking-tight mb-2">Staff Management</h1>
                        <p className="text-neutral-500 light:text-gray-500 font-medium tracking-wide">Manage system access roles & employee credentials.</p>
                    </div>
                    <button
                        onClick={() => { setShowForm(true); setEditingStaff(null); }}
                        className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white px-6 py-3.5 rounded-2xl flex items-center justify-center transition-all shadow-[0_8px_24px_-6px_rgba(249,115,22,0.4)] font-bold hover:-translate-y-0.5"
                    >
                        <Plus size={18} className="mr-2" /> Invite Employee
                    </button>
                </div>

                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-2xl font-bold tracking-wide text-sm shadow-sm flex items-center gap-2">
                        <Shield size={16} /> {error}
                    </div>
                )}

                {loading ? (
                    <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-[#161616] light:bg-white border border-[#2a2a2a] light:border-gray-200 h-48 rounded-[32px]"></div>
                        <div className="bg-[#161616] light:bg-white border border-[#2a2a2a] light:border-gray-200 h-48 rounded-[32px]"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {staffList.map(member => (
                            <div key={member.id} className="group relative bg-[#161616] light:bg-white border border-[#2a2a2a] light:border-gray-200 rounded-[32px] p-6 transition-all duration-300 hover:border-orange-500/50 hover:shadow-[0_8px_30px_rgba(249,115,22,0.1)] light:hover:shadow-md flex flex-col overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-gradient-to-br from-orange-500/5 to-rose-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-0 pointer-events-none" />

                                <div className="z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-5">
                                        <div className="h-12 w-12 rounded-2xl bg-[#0a0a0a] light:bg-gray-100 border border-[#2a2a2a] light:border-gray-200 flex items-center justify-center shadow-inner mb-4 group-hover:border-orange-500/30 transition-colors">
                                            <Users size={20} className="text-neutral-500 light:text-gray-400 group-hover:text-orange-400 transition-colors" />
                                        </div>
                                        <div className={`flex items-center px-3 py-1.5 rounded-xl border font-bold text-[10px] uppercase tracking-widest shadow-sm ${getRoleColors(member.role)}`}>
                                            {getRoleIcon(member.role)}
                                            {member.role}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-black text-white light:text-gray-900 leading-tight mb-1 truncate">{member.name}</h3>
                                        <p className="text-[13px] font-medium text-neutral-500 light:text-gray-500 truncate mb-6">{member.email}</p>
                                    </div>

                                    <div className="mt-auto pt-5 flex space-x-2 border-t border-[#2a2a2a] light:border-gray-100">
                                        <button
                                            onClick={() => { setEditingStaff(member); setShowForm(true); }}
                                            className="flex-1 flex justify-center items-center py-2.5 bg-[#0a0a0a] light:bg-gray-50 hover:bg-[#222222] light:hover:bg-gray-100 text-neutral-400 light:text-gray-600 hover:text-white light:hover:text-gray-900 rounded-xl border border-[#2a2a2a] light:border-gray-200 transition-all shadow-sm font-bold text-sm"
                                        >
                                            <Edit2 size={16} className="mr-2" /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(member.id, member.email)}
                                            disabled={member.email === user.email}
                                            className="flex justify-center items-center px-4 bg-[#0a0a0a] light:bg-gray-50 hover:bg-rose-500/10 text-neutral-400 light:text-gray-500 hover:text-rose-500 rounded-xl border border-[#2a2a2a] light:border-gray-200 transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showForm && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 py-10 z-50 overflow-y-auto">
                        <div className="w-full max-w-lg bg-[#161616] light:bg-white border border-[#2a2a2a] light:border-gray-200 rounded-[32px] p-2 shadow-2xl my-auto">
                            <StaffForm
                                staff={editingStaff}
                                onSave={handleSaveStaff}
                                onCancel={() => setShowForm(false)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffManagementPage;
