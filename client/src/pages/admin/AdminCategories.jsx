import { useState, useEffect } from 'react';
import { Loader2, FolderTree, Plus, Pencil, Trash2, X } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', slug: '', type: 'product', parent: '', description: '', sortOrder: 0 });

    useEffect(() => {
        fetchCategories();
    }, [filter]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const params = filter ? `?type=${filter}` : '';
            const res = await api.get(`/admin/categories${params}`);
            setCategories(res.data);
        } catch (error) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ name: '', slug: '', type: 'product', parent: '', description: '', sortOrder: 0 });
        setModalOpen(true);
    };

    const openEdit = (cat) => {
        setEditing(cat);
        setForm({
            name: cat.name,
            slug: cat.slug || '',
            type: cat.type,
            parent: cat.parent?._id || cat.parent || '',
            description: cat.description || '',
            sortOrder: cat.sortOrder ?? 0,
            isActive: cat.isActive !== false
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                parent: form.parent || undefined,
                ...(editing && { isActive: form.isActive })
            };
            if (editing) {
                await api.put(`/admin/categories/${editing._id}`, payload);
                toast.success('Category updated');
            } else {
                await api.post('/admin/categories', payload);
                toast.success('Category created');
            }
            setModalOpen(false);
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save');
        }
    };

    const handleDelete = async (cat) => {
        if (!window.confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/admin/categories/${cat._id}`);
            toast.success('Category deleted');
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        }
    };

    const productCategories = categories.filter(c => c.type === 'product');
    const serviceCategories = categories.filter(c => c.type === 'service');

    const renderTable = (items, type) => (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Slug</th>
                        <th className="px-6 py-4">Parent</th>
                        <th className="px-6 py-4">Sort</th>
                        <th className="px-6 py-4">Active</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {items.map((cat) => (
                        <tr key={cat._id} className="hover:bg-white/5">
                            <td className="px-6 py-4 font-medium text-white">{cat.name}</td>
                            <td className="px-6 py-4 text-gray-400 font-mono text-sm">{cat.slug}</td>
                            <td className="px-6 py-4 text-gray-400">{cat.parent?.name || '-'}</td>
                            <td className="px-6 py-4 text-gray-400">{cat.sortOrder ?? 0}</td>
                            <td className="px-6 py-4">
                                <span className={cat.isActive ? 'text-green-400' : 'text-gray-500'}>
                                    {cat.isActive ? 'Yes' : 'No'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                <button
                                    onClick={() => openEdit(cat)}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-amber-500/20 text-amber-400"
                                    title="Edit"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(cat)}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-red-400"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FolderTree size={28} />
                    Categories
                </h2>
                <div className="flex gap-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                    >
                        <option value="">All Types</option>
                        <option value="product">Product</option>
                        <option value="service">Service</option>
                    </select>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium"
                    >
                        <Plus size={18} />
                        Add Category
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="p-12 text-center text-gray-400">
                    <Loader2 className="animate-spin inline" size={40} />
                </div>
            ) : categories.length === 0 ? (
                <div className="glass-card p-12 text-center text-gray-400">
                    <FolderTree size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="mb-4">No categories yet.</p>
                    <p className="text-sm mb-4">Add product and service categories to structure your catalog.</p>
                    <button
                        onClick={openCreate}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium"
                    >
                        Add First Category
                    </button>
                </div>
            ) : (
                <div className="space-y-8">
                    {productCategories.length > 0 && (
                        <div className="glass-card overflow-hidden">
                            <h3 className="px-6 py-4 bg-white/5 text-amber-400 font-bold">Product Categories</h3>
                            {renderTable(productCategories)}
                        </div>
                    )}
                    {serviceCategories.length > 0 && (
                        <div className="glass-card overflow-hidden">
                            <h3 className="px-6 py-4 bg-white/5 text-purple-400 font-bold">Service Categories</h3>
                            {renderTable(serviceCategories)}
                        </div>
                    )}
                </div>
            )}

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-dark-800 rounded-2xl w-full max-w-md shadow-2xl border border-white/10 overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">
                                {editing ? 'Edit Category' : 'Add Category'}
                            </h3>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white"
                                    placeholder="e.g. Physical Art"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Slug</label>
                                <input
                                    type="text"
                                    value={form.slug}
                                    onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
                                    className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white font-mono text-sm"
                                    placeholder="physical-art (auto-generated if empty)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Type *</label>
                                <select
                                    required
                                    value={form.type}
                                    onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                                    className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white"
                                >
                                    <option value="product">Product</option>
                                    <option value="service">Service</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Parent Category</label>
                                <select
                                    value={form.parent}
                                    onChange={(e) => setForm(f => ({ ...f, parent: e.target.value }))}
                                    className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white"
                                >
                                    <option value="">None</option>
                                    {categories
                                        .filter(c => c.type === form.type && c._id !== editing?._id)
                                        .map(c => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Sort Order</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.sortOrder}
                                    onChange={(e) => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                                    className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                                    rows="2"
                                    className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white resize-none"
                                    placeholder="Optional"
                                />
                            </div>
                            {editing && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={form.isActive !== false}
                                        onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))}
                                        className="rounded"
                                    />
                                    <label htmlFor="isActive" className="text-sm text-gray-400">Active</label>
                                </div>
                            )}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-gray-400 hover:bg-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium"
                                >
                                    {editing ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
