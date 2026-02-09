import { useState, useEffect } from 'react';
import { Loader2, Check, X, Shield } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const AdminVendors = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const res = await api.get('/admin/vendors');
            setVendors(res.data);
        } catch (error) {
            console.error('Error fetching vendors:', error);
            toast.error('Failed to load vendors');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, status) => {
        try {
            await api.put(`/admin/vendors/${id}/approve`, { status });
            setVendors(vendors.map(v => v._id === id ? { ...v, vendorStatus: status } : v));
            toast.success(`Vendor ${status === 'approved' ? 'approved' : 'rejected'}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            approved: 'bg-green-500/20 text-green-400',
            pending: 'bg-yellow-500/20 text-yellow-400',
            rejected: 'bg-red-500/20 text-red-400'
        };
        return map[status] || 'bg-gray-500/20 text-gray-400';
    };

    if (loading) return <div className="p-8 text-center text-gray-400"><Loader2 className="animate-spin inline" size={40} /></div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Vendors</h2>

            {vendors.length === 0 ? (
                <div className="glass-card p-12 text-center text-gray-400">
                    <Shield size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No vendors found.</p>
                </div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Vendor</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Store</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {vendors.map((vendor) => (
                                <tr key={vendor._id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{vendor.name}</div>
                                        <div className="text-xs text-gray-500">{new Date(vendor.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">{vendor.email}</td>
                                    <td className="px-6 py-4 text-gray-400">{vendor.vendorProfile?.storeName || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(vendor.vendorStatus)}`}>
                                            {vendor.vendorStatus || 'approved'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {vendor.vendorStatus === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(vendor._id, 'approved')}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                                                >
                                                    <Check size={14} /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(vendor._id, 'rejected')}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                                >
                                                    <X size={14} /> Reject
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminVendors;
