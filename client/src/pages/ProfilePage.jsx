import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, MapPin, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
    const { currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        label: 'Home',
        street: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        isDefault: false
    });

    useEffect(() => {
        fetchProfile();
        fetchAddresses();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/profile');
            setProfile(res.data);
            setName(res.data.name || '');
        } catch (error) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            const res = await api.get('/users/addresses');
            setAddresses(res.data);
        } catch (error) {
            console.error('Failed to load addresses');
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/users/profile', { name });
            setProfile(prev => ({ ...prev, name }));
            toast.success('Profile updated');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/users/addresses', formData);
            fetchAddresses();
            setFormData({ label: 'Home', street: '', city: '', state: '', pincode: '', phone: '', isDefault: false });
            setShowAddForm(false);
            toast.success('Address added');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add address');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateAddress = async (e, id) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/users/addresses/${id}`, formData);
            fetchAddresses();
            setEditingId(null);
            toast.success('Address updated');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm('Remove this address?')) return;
        try {
            await api.delete(`/users/addresses/${id}`);
            setAddresses(addresses.filter(a => a._id !== id));
            toast.success('Address removed');
        } catch (error) {
            toast.error('Failed to remove address');
        }
    };

    const startEdit = (addr) => {
        setEditingId(addr._id);
        setFormData({
            label: addr.label || 'Home',
            street: addr.street || '',
            city: addr.city || '',
            state: addr.state || '',
            pincode: addr.pincode || '',
            phone: addr.phone || '',
            isDefault: addr.isDefault || false
        });
    };

    if (loading) {
        return (
            <div className="bg-light-900 dark:bg-dark-900 min-h-screen">
                <Navbar />
                <div className="pt-32 text-center text-gray-500"><Loader2 className="animate-spin inline" size={40} /></div>
            </div>
        );
    }

    return (
        <div className="bg-light-900 dark:bg-dark-900 min-h-screen text-dark-900 dark:text-white transition-colors duration-300">
            <Navbar />

            <div className="pt-24 pb-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold font-display mb-8">My Profile</h1>

                {/* Profile Section */}
                <div className="bg-white dark:bg-dark-800 rounded-xl border border-light-700 dark:border-white/5 p-6 mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                            {profile?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Account Details</h2>
                            <p className="text-gray-500 text-sm">Update your personal information</p>
                        </div>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 text-dark-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                            <input
                                type="email"
                                value={profile?.email || ''}
                                disabled
                                className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-dark-900/50 border border-gray-200 dark:border-white/5 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : null}
                            Save Changes
                        </button>
                    </form>
                </div>

                {/* Addresses Section */}
                <div className="bg-white dark:bg-dark-800 rounded-xl border border-light-700 dark:border-white/5 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <MapPin size={24} className="text-blue-500" />
                            <div>
                                <h2 className="text-xl font-bold">Saved Addresses</h2>
                                <p className="text-gray-500 text-sm">Manage your shipping addresses</p>
                            </div>
                        </div>
                        {!showAddForm && (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                            >
                                <Plus size={18} /> Add Address
                            </button>
                        )}
                    </div>

                    {showAddForm && (
                        <form onSubmit={handleAddAddress} className="mb-6 p-4 bg-gray-50 dark:bg-dark-900 rounded-lg space-y-3">
                            <h3 className="font-semibold">New Address</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                    placeholder="Label (e.g. Home)"
                                    value={formData.label}
                                    onChange={e => setFormData(f => ({ ...f, label: e.target.value }))}
                                    className="px-3 py-2 rounded-lg bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10"
                                />
                                <input
                                    placeholder="Phone *"
                                    value={formData.phone}
                                    onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                                    required
                                    className="px-3 py-2 rounded-lg bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10"
                                />
                            </div>
                            <input
                                placeholder="Street address *"
                                value={formData.street}
                                onChange={e => setFormData(f => ({ ...f, street: e.target.value }))}
                                required
                                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10"
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <input
                                    placeholder="City *"
                                    value={formData.city}
                                    onChange={e => setFormData(f => ({ ...f, city: e.target.value }))}
                                    required
                                    className="px-3 py-2 rounded-lg bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10"
                                />
                                <input
                                    placeholder="State"
                                    value={formData.state}
                                    onChange={e => setFormData(f => ({ ...f, state: e.target.value }))}
                                    className="px-3 py-2 rounded-lg bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10"
                                />
                                <input
                                    placeholder="Pincode"
                                    value={formData.pincode}
                                    onChange={e => setFormData(f => ({ ...f, pincode: e.target.value }))}
                                    className="px-3 py-2 rounded-lg bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10"
                                />
                            </div>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isDefault}
                                    onChange={e => setFormData(f => ({ ...f, isDefault: e.target.checked }))}
                                    className="rounded"
                                />
                                <span className="text-sm">Set as default</span>
                            </label>
                            <div className="flex gap-2">
                                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
                                    {saving ? 'Saving...' : 'Add'}
                                </button>
                                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-gray-200 dark:bg-white/10 rounded-lg text-sm">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="space-y-4">
                        {addresses.length === 0 && !showAddForm ? (
                            <p className="text-gray-500 text-center py-8">No addresses yet. Add one for faster checkout.</p>
                        ) : (
                            addresses.map((addr) => (
                                <div key={addr._id} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5">
                                    {editingId === addr._id ? (
                                        <form onSubmit={e => handleUpdateAddress(e, addr._id)} className="flex-1 space-y-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <input
                                                    placeholder="Label"
                                                    value={formData.label}
                                                    onChange={e => setFormData(f => ({ ...f, label: e.target.value }))}
                                                    className="px-3 py-2 rounded text-sm bg-white dark:bg-dark-800"
                                                />
                                                <input
                                                    placeholder="Phone"
                                                    value={formData.phone}
                                                    onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                                                    required
                                                    className="px-3 py-2 rounded text-sm bg-white dark:bg-dark-800"
                                                />
                                            </div>
                                            <input
                                                placeholder="Street"
                                                value={formData.street}
                                                onChange={e => setFormData(f => ({ ...f, street: e.target.value }))}
                                                required
                                                className="w-full px-3 py-2 rounded text-sm bg-white dark:bg-dark-800"
                                            />
                                            <div className="grid grid-cols-3 gap-2">
                                                <input placeholder="City" value={formData.city} onChange={e => setFormData(f => ({ ...f, city: e.target.value }))} required className="px-3 py-2 rounded text-sm" />
                                                <input placeholder="State" value={formData.state} onChange={e => setFormData(f => ({ ...f, state: e.target.value }))} className="px-3 py-2 rounded text-sm bg-white dark:bg-dark-800" />
                                                <input placeholder="Pincode" value={formData.pincode} onChange={e => setFormData(f => ({ ...f, pincode: e.target.value }))} className="px-3 py-2 rounded text-sm bg-white dark:bg-dark-800" />
                                            </div>
                                            <label className="flex items-center gap-2 text-sm">
                                                <input type="checkbox" checked={formData.isDefault} onChange={e => setFormData(f => ({ ...f, isDefault: e.target.checked }))} className="rounded" />
                                                Default
                                            </label>
                                            <div className="flex gap-2">
                                                <button type="submit" disabled={saving} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm">Save</button>
                                                <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-gray-200 dark:bg-white/10 rounded text-sm">Cancel</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">{addr.label}</span>
                                                    {addr.isDefault && <span className="text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">Default</span>}
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                                    {addr.street}, {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.pincode}
                                                </p>
                                                <p className="text-gray-500 text-sm">{addr.phone}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => startEdit(addr)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteAddress(addr._id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
