import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Download, Loader2, Package, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const DownloadsPage = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }
        const fetchOrders = async () => {
            try {
                const res = await api.get('/orders');
                setOrders(res.data);
            } catch (error) {
                if (error.response?.status === 401) {
                    navigate('/login?redirect=/downloads');
                    return;
                }
                console.error('Failed to fetch orders', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [currentUser, navigate]);

    const digitalItems = [];
    (orders || []).forEach((order) => {
        (order.products || []).forEach((item) => {
            const product = item.product;
            if (product && product.type === 'digital') {
                digitalItems.push({
                    orderId: order._id,
                    orderDate: order.createdAt,
                    productId: product._id,
                    title: product.title,
                    image: product.images?.[0],
                    quantity: item.quantity || 1
                });
            }
        });
    });

    const handleDownload = async (orderId, productId, productTitle) => {
        setDownloading(productId);
        try {
            const res = await api.get(`/orders/${orderId}/download/${productId}`);
            const { url, fileName } = res.data;
            const win = window.open(url, '_blank');
            if (win) {
                toast.success('Download opened in new tab');
            } else {
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName || `${productTitle.replace(/[^a-z0-9]/gi, '_')}.file`;
                a.target = '_blank';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                toast.success('Download started');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Download failed');
        } finally {
            setDownloading(null);
        }
    };

    if (!currentUser) {
        return (
            <div className="bg-light-900 dark:bg-dark-900 min-h-screen text-dark-900 dark:text-white transition-colors duration-300">
                <Navbar />
                <div className="pt-32 pb-12 flex flex-col items-center justify-center text-center px-4">
                    <h2 className="text-xl font-bold mb-2">Login to view your downloads</h2>
                    <Link to="/login?redirect=/downloads" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium">Login</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-light-900 dark:bg-dark-900 min-h-screen text-dark-900 dark:text-white transition-colors duration-300">
            <Navbar />

            <div className="pt-24 pb-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-purple-100 dark:bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
                        <Download size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold font-display">Digital Downloads</h1>
                        <p className="text-gray-500 dark:text-gray-400">Your purchased digital products</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-purple-500" size={40} />
                    </div>
                ) : digitalItems.length === 0 ? (
                    <div className="bg-white dark:bg-dark-800 rounded-xl border border-light-700 dark:border-white/5 p-12 text-center">
                        <Package size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No digital downloads yet</h3>
                        <p className="text-gray-500 mb-6">Digital products you purchase will appear here.</p>
                        <Link
                            to="/shop?type=digital"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Browse Digital Products <ExternalLink size={18} />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {digitalItems.map((item, idx) => (
                            <div
                                key={`${item.orderId}-${item.productId}-${idx}`}
                                className="bg-white dark:bg-dark-800 rounded-xl border border-light-700 dark:border-white/5 p-4 flex gap-4 items-center shadow-sm"
                            >
                                <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-dark-900 overflow-hidden shrink-0">
                                    <img
                                        src={item.image || 'https://via.placeholder.com/80'}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-dark-900 dark:text-white truncate">{item.title}</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        Purchased {new Date(item.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        {item.quantity > 1 && ` • Qty: ${item.quantity}`}
                                    </p>
                                    <Link
                                        to={`/orders/${item.orderId}`}
                                        className="text-xs text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 mt-1 inline-flex items-center gap-1"
                                    >
                                        View order <ExternalLink size={12} />
                                    </Link>
                                </div>
                                <button
                                    onClick={() => handleDownload(item.orderId, item.productId, item.title)}
                                    disabled={!!downloading}
                                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                                >
                                    {downloading === item.productId ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <Download size={18} />
                                    )}
                                    Download
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DownloadsPage;
