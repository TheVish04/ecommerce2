import { useEffect, useState } from 'react';
import {
    DollarSign,
    Package,
    ShoppingCart,
    TrendingUp,
    Clock,
    User,
    Gift
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

    const formatINR = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Loading Dashboard...</div>;

    const chartData = stats?.salesAnalytics || [];

    return (
        <div className="space-y-8 animate-fade-in">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-white">Dashboard Overview</h2>
                <p className="text-gray-400 mt-2">Welcome back, here's what's happening today.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Earnings"
                    value={formatINR(stats?.totalEarnings || 0)}
                    icon={DollarSign}
                    color="text-emerald-400 bg-emerald-500/20"
                    subtext="Net revenue from completed orders"
                />
                <StatCard
                    title="Total Sales"
                    value={formatINR(stats?.totalSales || 0)}
                    icon={TrendingUp}
                    color="text-blue-400 bg-blue-500/20"
                    subtext="Gross sales volume"
                />
                <StatCard
                    title="Total Products"
                    value={stats?.totalProducts || 0}
                    icon={Package}
                    color="text-purple-400 bg-purple-500/20"
                    subtext="Active in marketplace"
                />
                <StatCard
                    title="Pending Orders"
                    value={stats?.pendingOrders || 0}
                    icon={Clock}
                    color="text-orange-400 bg-orange-500/20"
                    subtext="Requires attention"
                />
            </div>

            {/* Recent Activity / Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
                {/* Recent Activity */}
                <div className="glass-card p-6">
                    <h3 className="text-xl font-semibold mb-6 text-white">Recent Activity</h3>
                    <div className="space-y-4">
                        {stats?.recentActivity?.length > 0 ? (
                            stats.recentActivity.map((act, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors border-b border-white/5 last:border-0">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${act.type === 'order' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                        {act.type === 'order' ? <ShoppingCart size={14} /> : <Gift size={14} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-white">{act.title}</p>
                                        <p className="text-xs text-gray-400">{act.desc}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-gray-500 block">{new Date(act.date).toLocaleDateString()}</span>
                                        <span className="text-[10px] uppercase font-bold text-gray-600">{act.status}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm py-8 text-center">No recent activity.</p>
                        )}
                    </div>
                </div>

                {/* Sales Analytics Chart */}
                <div className="glass-card p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-white">Sales Analytics</h3>
                        <select className="bg-dark-900 border border-white/10 rounded text-xs px-2 py-1 text-gray-400 focus:outline-none">
                            <option>Last 30 Days</option>
                        </select>
                    </div>

                    <div className="flex-1 w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
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
                                />
                                <YAxis
                                    stroke="#6b7280"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `₹${val}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
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
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
