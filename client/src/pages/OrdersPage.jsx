import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Package, Loader2, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DeliveryCycle from '../components/DeliveryCycle';

const STATUS_LABEL = {
    pending: 'PLACED',
    processing: 'CONFIRMED',
    shipped: 'SHIPPED',
    completed: 'DELIVERED',
    cancelled: 'CANCELLED'
};

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }
            try {
                const res = await api.get('/orders');
                setOrders(res.data);
            } catch (error) {
                if (error.response?.status === 401) {
                    navigate('/login?redirect=/orders');
                    return;
                }
                console.error('Failed to fetch orders', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [currentUser, navigate]);

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getItemNames = (order) => {
        return order.products
            ?.map(p => `${p.product?.title || 'Unknown'} × ${p.quantity || 1}`)
            .filter(Boolean)
            .join(', ') || '-';
    };

    if (!currentUser) {
        return (
            <div className="bg-light-900 dark:bg-dark-900 min-h-screen text-dark-900 dark:text-white transition-colors duration-300">
                <Navbar />
                <div className="pt-32 pb-12 flex flex-col items-center justify-center text-center px-4">
                    <h2 className="text-xl font-bold mb-2">Login to view your orders</h2>
                    <p className="text-gray-500 mb-6">Please sign in to see your order history.</p>
                    <Link
                        to="/login?redirect=/orders"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-light-900 dark:bg-dark-900 min-h-screen text-dark-900 dark:text-white transition-colors duration-300">
            <Navbar />

            <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-100 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                        <Package size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold font-display">My Orders</h1>
                        <p className="text-gray-500 dark:text-gray-400">Track and manage your purchases</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-blue-500" size={40} />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white dark:bg-dark-800 rounded-xl border border-light-700 dark:border-white/5 p-12 text-center">
                        <Package size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                        <p className="text-gray-500 mb-6">Your order history will appear here.</p>
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Start Shopping <ExternalLink size={18} />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => (
                            <div
                                key={order._id}
                                className="bg-white dark:bg-dark-800 rounded-xl border border-light-700 dark:border-white/5 shadow-sm overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                                        <h3 className="font-bold text-dark-900 dark:text-white">
                                            Order #{order._id.toString().slice(-8).toUpperCase()}
                                        </h3>
                                        <span className={`text-sm font-bold uppercase ${order.status === 'completed' ? 'text-blue-500' : order.status === 'cancelled' ? 'text-red-500' : 'text-amber-500'}`}>
                                            {STATUS_LABEL[order.status] || order.status}
                                        </span>
                                    </div>

                                    <DeliveryCycle status={order.status} editable={false} />

                                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 space-y-2">
                                        <div className="flex justify-between items-start gap-4">
                                            <p className="text-dark-900 dark:text-gray-300 text-sm">
                                                {getItemNames(order)}
                                            </p>
                                            <span className="font-mono text-sm text-gray-600 dark:text-gray-400 shrink-0">
                                                ₹{order.totalAmount?.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-2xl font-bold text-dark-900 dark:text-white">
                                                Total: ₹{order.totalAmount?.toLocaleString()}
                                            </p>
                                            <Link
                                                to={`/orders/${order._id}`}
                                                className="text-sm text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                                            >
                                                View Details <ExternalLink size={14} className="inline" />
                                            </Link>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Ordered on {formatDate(order.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
