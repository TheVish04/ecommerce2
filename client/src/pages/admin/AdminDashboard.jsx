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
import { motion } from 'framer-motion';
import api from '../../services/api';

const CHART_COLORS = ['#fbbf24', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

const GlassCard = ({ children, className = "" }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`glass-card p-6 relative overflow-hidden ${className}`}
    >
        {children}
    </motion.div>
);

const StatCard = ({ title, value, icon: Icon, color, subtext, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="glass-card p-6 relative overflow-hidden group hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
    >
        <div className={`absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity ${color} rounded-full`}>
            <Icon size={100} />
        </div>
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-white/5 ${color} text-white ring-1 ring-white/10 shadow-lg`}>
                    <Icon size={24} />
                </div>
                {subtext && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                        {subtext}
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-gray-400 text-sm font-medium mb-1 tracking-wide">{title}</h3>
                <p className="text-3xl font-display font-bold text-white tracking-tight">{value}</p>
            </div>
        </div>
    </motion.div>
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

    if (loading) return (
        <div className="h-[calc(100vh-100px)] flex items-center justify-center">
            <Loader2 className="animate-spin text-amber-500" size={40} />
        </div>
    );

    return (
        <div className="space-y-8">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl font-display font-bold text-white mb-2"
                    >
                        Dashboard
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400"
                    >
                        Platform analytics and overview.
                    </motion.p>
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex gap-2"
                >
                    {/* Date filter placeholder */}
                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400">
                        Live Data
                    </div>
                </motion.div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard delay={0.1} title="Total Revenue" value={formatINR(stats?.totalRevenue)} icon={DollarSign} color="text-green-400 bg-green-500/20" subtext="All Time" />
                <StatCard delay={0.2} title="Active Vendors" value={stats?.totalUsers || 0} icon={Users} color="text-blue-400 bg-blue-500/20" subtext="Verified" />
                <StatCard delay={0.3} title="Total Orders" value={stats?.totalOrders || 0} icon={ShoppingCart} color="text-purple-400 bg-purple-500/20" subtext="Completed" />
                <StatCard delay={0.4} title="Pending Approvals" value={stats?.pendingVendors || 0} icon={Shield} color="text-amber-400 bg-amber-500/20" subtext="In Review" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <GlassCard className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white">Revenue Analytics</h3>
                        <select className="bg-black/20 border border-white/10 rounded-lg text-xs px-3 py-1.5 text-gray-400 focus:outline-none">
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        {stats?.chartData?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis
                                        dataKey="label"
                                        stroke="#6b7280"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#6b7280"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000) + 'k' : v}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                                        formatter={(value) => [`₹${value?.toLocaleString()}`, 'Revenue']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#fbbf24"
                                        strokeWidth={3}
                                        fill="url(#revenueGradient)"
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">No revenue data available</div>
                        )}
                    </div>
                </GlassCard>

                {/* Recent Orders */}
                <GlassCard>
                    <h3 className="text-xl font-bold text-white mb-6">Recent Orders</h3>
                    <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                        {stats?.recentOrders?.length > 0 ? (
                            stats.recentOrders.map((order, i) => (
                                <div key={order._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                                            {order.buyer?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{order.buyer?.name}</p>
                                            <p className="text-xs text-gray-500">#{order._id?.toString().slice(-6).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-amber-400">₹{order.totalAmount?.toLocaleString()}</p>
                                        <p className="text-[10px] text-gray-500 uppercase">{order.status || 'Pending'}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">No recent orders found.</p>
                        )}
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Categories / Roles Breakdown */}
                <GlassCard>
                    <h3 className="text-xl font-bold text-white mb-6">User Distribution</h3>
                    <div className="h-[250px]">
                        {stats?.usersByRole && Object.keys(stats.usersByRole).length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={Object.entries(stats.usersByRole).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {Object.keys(stats.usersByRole).map((_, i) => (
                                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">No user data</div>
                        )}
                    </div>
                </GlassCard>

                <GlassCard>
                    <h3 className="text-xl font-bold text-white mb-6">Commissions Status</h3>
                    <div className="h-[250px]">
                        {stats?.commissions && Object.keys(stats.commissions).length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={Object.entries(stats.commissions).map(([name, value]) => ({ name: name.replace('_', ' '), value }))} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={true} vertical={false} />
                                    <XAxis type="number" stroke="#6b7280" fontSize={11} hide />
                                    <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={11} width={80} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">No commissions data</div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default AdminDashboard;
