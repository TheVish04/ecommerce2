import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { CheckCircle, Package, Loader2 } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const OrderConfirmationPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login?redirect=/orders');
            setLoading(false);
            return;
        }
        const fetchOrder = async () => {
            try {
                const res = await api.get(`/orders/${id}`);
                setOrder(res.data);
            } catch (error) {
                if (error.response?.status === 403 || error.response?.status === 404) {
                    navigate('/orders');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id, currentUser, navigate]);

    if (!currentUser) return null;
    if (loading) {
        return (
            <div className="bg-light-900 dark:bg-dark-900 min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="bg-light-900 dark:bg-dark-900 min-h-screen">
                <Navbar />
                <div className="pt-32 text-center text-gray-500">Order not found.</div>
            </div>
        );
    }

    const orderNumber = `#${order._id.toString().slice(-8).toUpperCase()}`;

    return (
        <div className="bg-light-900 dark:bg-dark-900 min-h-screen text-dark-900 dark:text-white transition-colors duration-300">
            <Navbar />

            <div className="pt-24 pb-12 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-dark-800 rounded-2xl border border-light-700 dark:border-white/5 shadow-lg p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={48} className="text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Thank you for your purchase. We've sent a confirmation email to {order.buyer?.email}.
                    </p>
                    <p className="text-lg font-mono font-semibold text-blue-600 dark:text-blue-400 mb-8">{orderNumber}</p>
                    <p className="text-2xl font-bold text-dark-900 dark:text-white mb-8">
                        Total: ₹{order.totalAmount?.toLocaleString()}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to={`/orders/${order._id}`}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                        >
                            <Package size={18} /> View Order
                        </Link>
                        <Link
                            to="/shop"
                            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-white/20 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-white/5"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;
