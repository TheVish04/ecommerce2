import { useState, useEffect } from 'react';
import { Loader2, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';

const AdminUsers = () => {
    const [data, setData] = useState({ users: [], pagination: {} });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [roleFilter, setRoleFilter] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [page, roleFilter, search]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 20 });
            if (roleFilter) params.append('role', roleFilter);
            if (search) params.append('search', search);
            const res = await api.get(`/admin/users?${params}`);
            setData({ users: res.data.users, pagination: res.data.pagination });
        } catch (error) {
            console.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadge = (role) => {
        const map = {
            admin: 'bg-amber-500/20 text-amber-400',
            vendor: 'bg-blue-500/20 text-blue-400',
            customer: 'bg-gray-500/20 text-gray-400'
        };
        return map[role] || 'bg-gray-500/20 text-gray-400';
    };

    if (loading && data.users.length === 0) return <div className="p-8 text-center text-gray-400"><Loader2 className="animate-spin inline" size={40} /></div>;

    const { users, pagination } = data;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-white">Users</h2>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search name/email"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white w-48"
                    />
                    <select
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        className="bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                    >
                        <option value="">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="vendor">Vendor</option>
                        <option value="customer">Customer</option>
                    </select>
                </div>
            </div>

            {users.length === 0 ? (
                <div className="glass-card p-12 text-center text-gray-400">
                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No users found.</p>
                </div>
            ) : (
                <>
                    <div className="glass-card overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Vendor Status</th>
                                    <th className="px-6 py-4">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-white/5">
                                        <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                                        <td className="px-6 py-4 text-gray-400">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs capitalize ${getRoleBadge(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.role === 'vendor' && (
                                                <span className={`px-2 py-1 rounded-full text-xs capitalize ${user.vendorStatus === 'approved' ? 'bg-green-500/20 text-green-400' : user.vendorStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {user.vendorStatus || 'approved'}
                                                </span>
                                            )}
                                            {user.role !== 'vendor' && '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
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

export default AdminUsers;
