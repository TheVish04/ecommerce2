import { useState, useEffect } from 'react';
import { Loader2, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';

const AdminCommissions = () => {
    const [data, setData] = useState({ commissions: [], pagination: {} });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchCommissions();
    }, [page, statusFilter]);

    const fetchCommissions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 20 });
            if (statusFilter) params.append('status', statusFilter);
            const res = await api.get(`/admin/commissions?${params}`);
            setData({ commissions: res.data.commissions, pagination: res.data.pagination });
        } catch (error) {
            console.error('Failed to load commissions');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            pending: 'bg-yellow-500/20 text-yellow-400',
            accepted: 'bg-blue-500/20 text-blue-400',
            in_progress: 'bg-purple-500/20 text-purple-400',
            delivered: 'bg-orange-500/20 text-orange-400',
            completed: 'bg-green-500/20 text-green-400',
            rejected: 'bg-red-500/20 text-red-400',
            cancelled: 'bg-gray-500/20 text-gray-400'
        };
        return map[status] || 'bg-gray-500/20 text-gray-400';
    };

    if (loading && data.commissions.length === 0) return <div className="p-8 text-center text-gray-400"><Loader2 className="animate-spin inline" size={40} /></div>;

    const { commissions, pagination } = data;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-white">Commissions</h2>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="in_progress">In Progress</option>
                    <option value="delivered">Delivered</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {commissions.length === 0 ? (
                <div className="glass-card p-12 text-center text-gray-400">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No commissions found.</p>
                </div>
            ) : (
                <>
                    <div className="glass-card overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Vendor</th>
                                    <th className="px-6 py-4">Service</th>
                                    <th className="px-6 py-4">Budget</th>
                                    <th className="px-6 py-4">Deadline</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {commissions.map((comm) => (
                                    <tr key={comm._id} className="hover:bg-white/5">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{comm.customer?.name}</div>
                                            <div className="text-xs text-gray-500">{comm.customer?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">{comm.vendor?.name}</td>
                                        <td className="px-6 py-4 text-white max-w-[150px] truncate">{comm.service?.title}</td>
                                        <td className="px-6 py-4 font-mono text-emerald-400">₹{comm.budget}</td>
                                        <td className="px-6 py-4 text-gray-400">{new Date(comm.deadline).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs capitalize ${getStatusBadge(comm.status)}`}>
                                                {comm.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pagination?.pages > 1 && (
                        <div className="flex justify-center gap-2">
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg bg-white/5 disabled:opacity-50">
                                <ChevronLeft size={20} />
                            </button>
                            <span className="py-2 px-4 text-gray-400">Page {page} of {pagination.pages}</span>
                            <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg bg-white/5 disabled:opacity-50">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminCommissions;
