import { useEffect, useState } from 'react';
import {
    DollarSign,
    Package,
    ShoppingCart,
    TrendingUp,
    Clock,
    User,
    Gift,
    Loader2
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';

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

const VendorDashboard = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                };

                const response = await axios.get('http://localhost:3001/api/vendor/dashboard', config);
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching stats:", error);

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
            <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
    );

    const chartData = stats?.salesAnalytics || [];

    return (
        <div className="space-y-8">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl font-display font-bold text-white mb-2"
                    >
                        Vendor Dashboard
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400"
                    >
                        Overview of your store performance.
                    </motion.p>
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex gap-3"
                >
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all">
                        + Add Product
                    </button>
                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400">
                        Live Data
                    </div>
                </motion.div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    delay={0.1}
                    title="Total Earnings"
                    value={formatINR(stats?.totalEarnings || 0)}
                    icon={DollarSign}
                    color="text-emerald-400 bg-emerald-500/20"
                    subtext="Net Profit"
                />
                <StatCard
                    delay={0.2}
                    title="Total Sales"
                    value={formatINR(stats?.totalSales || 0)}
                    icon={TrendingUp}
                    color="text-blue-400 bg-blue-500/20"
                    subtext="Gross Revenue"
                />
                <StatCard
                    delay={0.3}
                    title="Active Products"
                    value={stats?.totalProducts || 0}
                    icon={Package}
                    color="text-purple-400 bg-purple-500/20"
                    subtext="In Catalogue"
                />
                <StatCard
                    delay={0.4}
                    title="Pending Orders"
                    value={stats?.pendingOrders || 0}
                    icon={Clock}
                    color="text-orange-400 bg-orange-500/20"
                    subtext="Action Required"
                />
            </div>

            {/* Recent Activity / Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Sales Analytics Chart */}
                <GlassCard className="lg:col-span-2 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white">Sales Analytics</h3>
                        <select className="bg-black/20 border border-white/10 rounded-lg text-xs px-3 py-1.5 text-gray-400 focus:outline-none">
                            <option>Last 30 Days</option>
                        </select>
                    </div>

                    <div className="flex-1 w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#6b7280"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(str) => {
                                        const d = new Date(str);
                                        return `${d.getDate()}/${d.getMonth() + 1}`;
                                    }}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#6b7280"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `₹${val}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: '#e5e7eb' }}
                                    formatter={(value) => [`₹${value}`, 'Sales']}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Recent Activity */}
                <GlassCard>
                    <h3 className="text-xl font-bold mb-6 text-white">Recent Activity</h3>
                    <div className="space-y-4 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                        {stats?.recentActivity?.length > 0 ? (
                            stats.recentActivity.map((act, i) => (
                                <div key={i} className="flex items-start gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-white/5">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${act.type === 'order' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                        {act.type === 'order' ? <ShoppingCart size={14} /> : <Gift size={14} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white truncate">{act.title}</p>
                                        <p className="text-xs text-gray-400 line-clamp-2">{act.desc}</p>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-[10px] text-gray-500">{new Date(act.date).toLocaleDateString()}</span>
                                            <span className="text-[10px] uppercase font-bold text-gray-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{act.status}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                                <Clock size={32} className="mb-2 opacity-20" />
                                <p className="text-sm">No recent activity.</p>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default VendorDashboard;
