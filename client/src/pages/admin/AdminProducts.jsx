import { useState, useEffect } from 'react';
import { Loader2, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const AdminProducts = () => {
    const [data, setData] = useState({ products: [], pagination: {} });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({ status: '', category: '' });

    useEffect(() => {
        api.get('/categories?type=product').then(r => setCategories(r.data)).catch(() => {});
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [page, filters.status, filters.category]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 20 });
            if (filters.status) params.append('status', filters.status);
            if (filters.category) params.append('category', filters.category);
            const res = await api.get(`/admin/products?${params}`);
            setData({ products: res.data.products, pagination: res.data.pagination });
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (product) => {
        try {
            await api.patch(`/admin/products/${product._id}`, { isActive: !product.isActive });
            setData(prev => ({
                ...prev,
                products: prev.products.map(p =>
                    p._id === product._id ? { ...p, isActive: !p.isActive } : p
                )
            }));
            toast.success(product.isActive ? 'Product disabled' : 'Product enabled');
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    if (loading && data.products.length === 0) return <div className="p-8 text-center text-gray-400"><Loader2 className="animate-spin inline" size={40} /></div>;

    const { products, pagination } = data;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-white">Products</h2>
                <div className="flex gap-2">
                    <select
                        value={filters.status}
                        onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                        className="bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="sold_out">Sold Out</option>
                    </select>
                    <select
                        value={filters.category}
                        onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
                        className="bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white min-w-[140px]"
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {products.length === 0 ? (
                <div className="glass-card p-12 text-center text-gray-400">
                    <Package size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No products found.</p>
                </div>
            ) : (
                <>
                    <div className="glass-card overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Image</th>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Vendor</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Active</th>
                                    <th className="px-6 py-4 text-right">Toggle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {products.map((product) => (
                                    <tr key={product._id} className="hover:bg-white/5">
                                        <td className="px-6 py-4">
                                            <div className="w-12 h-12 rounded-lg bg-gray-700 overflow-hidden">
                                                <img src={product.images?.[0] || ''} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-white max-w-[200px] truncate">{product.title}</td>
                                        <td className="px-6 py-4 text-gray-400">{product.vendor?.name || '-'}</td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {product.category?.name || product.categorySlug || product.category || '-'}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-emerald-400">₹{product.price}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${product.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                                {product.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={product.isActive ? 'text-green-400' : 'text-gray-500'}>{product.isActive ? 'Yes' : 'No'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleToggle(product)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${product.isActive ? 'bg-blue-600' : 'bg-gray-700'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${product.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pagination?.pages > 1 && (
                        <div className="flex justify-center gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
                                className="p-2 rounded-lg bg-white/5 disabled:opacity-50"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="py-2 px-4 text-gray-400">Page {page} of {pagination.pages}</span>
                            <button
                                disabled={page >= pagination.pages}
                                onClick={() => setPage(p => p + 1)}
                                className="p-2 rounded-lg bg-white/5 disabled:opacity-50"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminProducts;
