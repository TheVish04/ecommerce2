import { useEffect, useState } from 'react';
import {
    DollarSign,
    Package,
    ShoppingCart,
    TrendingUp,
    Users,
    Briefcase,
    Shield,
    Loader2
} from 'lucide-react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import api from '../../services/api';

const CHART_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="glass-card p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
            <Icon size={80} />
        </div>
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-white/5 ${color} text-white`}>
                    <Icon size={24} />
                </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-bold text-white mb-2">{value}</p>
            {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
        </div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/dashboard');
                setStats(res.data);
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatINR = (amount) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

    if (loading) return <div className="p-8 text-center text-gray-400"><Loader2 className="animate-spin inline" size={40} /></div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-white">Admin Dashboard</h2>
                <p className="text-gray-400 mt-2">Platform overview and analytics.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Revenue" value={formatINR(stats?.totalRevenue)} icon={DollarSign} color="text-emerald-400 bg-emerald-500/20" subtext="All time" />
                <StatCard title="Revenue (30d)" value={formatINR(stats?.revenueLast30Days)} icon={TrendingUp} color="text-blue-400 bg-blue-500/20" subtext="Last 30 days" />
                <StatCard title="Total Orders" value={stats?.totalOrders || 0} icon={ShoppingCart} color="text-purple-400 bg-purple-500/20" subtext="Non-cancelled" />
                <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} color="text-amber-400 bg-amber-500/20" subtext="All roles" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Products" value={stats?.totalProducts || 0} icon={Package} color="text-cyan-400 bg-cyan-500/20" />
                <StatCard title="Services" value={stats?.totalServices || 0} icon={Briefcase} color="text-pink-400 bg-pink-500/20" />
                <StatCard title="Pending Vendors" value={stats?.pendingVendors || 0} icon={Shield} color="text-orange-400 bg-orange-500/20" subtext={stats?.pendingVendors > 0 ? 'Requires approval' : ''} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                    <h3 className="text-xl font-semibold mb-4 text-white">Revenue Trend (Last 30 Days)</h3>
                    <div className="h-[260px]">
                        {(stats?.chartData?.length > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.chartData}>
                                    <defs>
                                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                    <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} tickLine={false} interval="preserveStartEnd" />
                                    <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000) + 'k' : v}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                        labelStyle={{ color: '#9ca3af' }}
                                        formatter={(value) => [`₹${value?.toLocaleString()}`, 'Revenue']}
                                        labelFormatter={(label) => label}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revenueGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">No revenue data</div>
                        )}
                    </div>
                </div>

                <div className="glass-card p-6">
                    <h3 className="text-xl font-semibold mb-4 text-white">Orders per Day (Last 30 Days)</h3>
                    <div className="h-[260px]">
                        {(stats?.chartData?.length > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                    <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} tickLine={false} interval="preserveStartEnd" />
                                    <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                        formatter={(value) => [value, 'Orders']}
                                    />
                                    <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">No order data</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass-card p-6">
                    <h3 className="text-xl font-semibold mb-4 text-white">Commissions by Status</h3>
                    <div className="h-[220px]">
                        {stats?.commissions && Object.keys(stats.commissions).length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={Object.entries(stats.commissions).map(([name, value], i) => ({ name: name.replace('_', ' '), value }))}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {Object.keys(stats.commissions).map((_, i) => (
                                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                        formatter={(value) => [value, 'Count']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">No commissions yet</div>
                        )}
                    </div>
                </div>

                <div className="glass-card p-6">
                    <h3 className="text-xl font-semibold mb-4 text-white">Users by Role</h3>
                    <div className="h-[220px]">
                        {stats?.usersByRole && Object.keys(stats.usersByRole).length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={Object.entries(stats.usersByRole).map(([name, value], i) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {Object.keys(stats.usersByRole).map((_, i) => (
                                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                        formatter={(value) => [value, 'Users']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">No user data</div>
                        )}
                    </div>
                </div>

                <div className="glass-card p-6">
                    <h3 className="text-xl font-semibold mb-4 text-white">Recent Orders</h3>
                    <div className="space-y-3 overflow-y-auto max-h-[220px]">
                        {stats?.recentOrders?.length > 0 ? (
                            stats.recentOrders.map((order) => (
                                <div key={order._id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-white">#{order._id?.toString().slice(-8).toUpperCase()}</p>
                                        <p className="text-xs text-gray-500">{order.buyer?.name} • {order.products?.length || 0} items</p>
                                    </div>
                                    <span className="font-mono text-emerald-400 text-sm">₹{order.totalAmount?.toLocaleString()}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 py-4">No recent orders.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
