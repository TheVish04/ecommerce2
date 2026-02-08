import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Package, Download, Palette, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const StatCard = ({ icon, label, value, color }) => (
    <div className="glass-card bg-white dark:bg-dark-800 p-6 flex items-center gap-4 border border-light-700 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
        <div className={`p-3 rounded-xl ${color} bg-opacity-20 text-${color.split('-')[1]}-500`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{label}</p>
            <h3 className="text-2xl font-bold text-dark-900 dark:text-white">{value}</h3>
        </div>
    </div>
);

const Dashboard = () => {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:3001/api/users/dashboard', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(res.data);
            } catch (error) {
                console.error("Error loading dashboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="bg-light-900 dark:bg-dark-900 min-h-screen">
                <Navbar />
                <div className="pt-32 text-center text-gray-500">Loading Dashboard...</div>
            </div>
        );
    }

    return (
        <div className="bg-light-900 dark:bg-dark-900 min-h-screen text-dark-900 dark:text-white transition-colors duration-300">
            <Navbar />

            <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-display">Welcome back, {currentUser?.name}</h1>
                        <p className="text-gray-500 dark:text-gray-400">Here's what's happening with your account.</p>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center">
                        <Link to="/profile" className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-800 border border-light-700 dark:border-white/5 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <User size={18} /> Profile & Addresses
                        </Link>
                        <Link to="/shop" className="text-blue-500 font-medium hover:underline">
                            Browse Marketplace &rarr;
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard icon={<Package size={24} />} label="Total Orders" value={stats?.totalOrders || 0} color="bg-blue-500" />
                    <Link to="/downloads" className="block focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-xl">
                        <StatCard icon={<Download size={24} />} label="Digital Downloads" value={stats?.digitalDownloads || 0} color="bg-purple-500" />
                    </Link>
                    <StatCard icon={<Palette size={24} />} label="Active Commissions" value={stats?.activeCommissions || 0} color="bg-pink-500" />
                    <StatCard icon={<Clock size={24} />} label="Pending Reviews" value={stats?.pendingReviews || 0} color="bg-orange-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Orders */}
                    <div className="bg-white dark:bg-dark-800 rounded-xl border border-light-700 dark:border-white/5 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Recent Orders</h2>
                            <Link to="/orders" className="text-sm text-blue-500 hover:text-blue-400">View All</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-white/5 text-gray-500">
                                        <th className="pb-3 pl-2">Date</th>
                                        <th className="pb-3">Items</th>
                                        <th className="pb-3">Total</th>
                                        <th className="pb-3 text-right pr-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {(stats?.recentOrders || []).length > 0 ? stats.recentOrders.map(order => (
                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                            <td className="py-3 pl-2 text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                                            <td className="py-3 font-medium">{order.items} Items</td>
                                            <td className="py-3 font-semibold">₹{order.total}</td>
                                            <td className="py-3 text-right pr-2">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'delivered' ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' :
                                                        order.status === 'completed' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' :
                                                            'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4 text-gray-500">No recent orders</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Active Commissions */}
                    <div className="bg-white dark:bg-dark-800 rounded-xl border border-light-700 dark:border-white/5 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Active Commissions</h2>
                            <Link to="/commissions" className="text-sm text-blue-500 hover:text-blue-400">Manage</Link>
                        </div>

                        <div className="space-y-4">
                            {(stats?.activeCommissionList || []).length > 0 ? stats.activeCommissionList.map(comm => (
                                <div key={comm._id} className="bg-gray-50 dark:bg-white/5 rounded-lg p-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-dark-900 dark:text-white">{comm.service?.title}</h3>
                                        <p className="text-sm text-gray-500">by {comm.vendor?.name}</p>
                                        <p className="text-xs text-gray-400 mt-1">Deadline: {new Date(comm.deadline).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block px-2 py-1 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded text-xs font-bold mb-2 uppercase">
                                            {comm.status.replace('_', ' ')}
                                        </span>
                                        <Link to={`/commissions`} className="text-sm text-blue-500 hover:underline">View Details</Link>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-gray-500 text-center py-8">No active commissions.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
