import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Package, Loader2, ArrowLeft, FileText, Download } from 'lucide-react';
import DeliveryCycle from '../components/DeliveryCycle';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingInvoice, setLoadingInvoice] = useState(false);
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }
        const fetchOrder = async () => {
            try {
                const res = await api.get(`/orders/${id}`);
                setOrder(res.data);
            } catch (error) {
                if (error.response?.status === 401) {
                    navigate('/login?redirect=/orders/' + id);
                    return;
                }
                if (error.response?.status === 403 || error.response?.status === 404) {
                    toast.error('Order not found');
                    navigate('/orders');
                    return;
                }
                toast.error('Failed to load order');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id, currentUser, navigate]);

    const handleViewInvoice = async () => {
        setLoadingInvoice(true);
        try {
            const res = await api.get(`/orders/${id}/invoice?format=html`, { responseType: 'text' });
            const win = window.open('', '_blank');
            win.document.write(res.data);
            win.document.close();
            toast.success('Invoice opened in new tab');
        } catch (error) {
            toast.error('Failed to load invoice');
        } finally {
            setLoadingInvoice(false);
        }
    };

    const handleDownloadInvoice = async () => {
        setLoadingInvoice(true);
        try {
            const res = await api.get(`/orders/${id}/invoice?format=html`, { responseType: 'text' });
            const blob = new Blob([res.data], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${id.slice(-8).toUpperCase()}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('Invoice downloaded');
        } catch (error) {
            toast.error('Failed to download invoice');
        } finally {
            setLoadingInvoice(false);
        }
    };

    const handleDownload = async (productId, productTitle) => {
        setDownloading(productId);
        try {
            const res = await api.get(`/orders/${id}/download/${productId}`);
            const { url, fileName } = res.data;
            // Open in new tab for reliability (works with external URLs like Cloudinary)
            const win = window.open(url, '_blank');
            if (win) {
                toast.success('Download opened in new tab – save from there if needed');
            } else {
                // Fallback: use anchor for same-origin or when popup blocked
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

    const getStatusColor = (status) => {
        const map = {
            delivered: 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400',
            completed: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
            shipped: 'bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400',
            processing: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400',
            pending: 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400',
            cancelled: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
        };
        return map[status] || 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400';
    };

    if (!currentUser) {
        return (
            <div className="bg-light-900 dark:bg-dark-900 min-h-screen text-dark-900 dark:text-white transition-colors duration-300">
                <Navbar />
                <div className="pt-32 pb-12 flex flex-col items-center justify-center text-center px-4">
                    <h2 className="text-xl font-bold mb-2">Login to view orders</h2>
                    <Link to="/login?redirect=/orders" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium">Login</Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-light-900 dark:bg-dark-900 min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="bg-light-900 dark:bg-dark-900 min-h-screen text-dark-900 dark:text-white">
                <Navbar />
                <div className="pt-32 text-center">Order not found.</div>
            </div>
        );
    }

    const orderNumber = `#${order._id.toString().slice(-8).toUpperCase()}`;
    const addr = order.shippingAddress;
    const addrStr = [addr?.street, addr?.city, addr?.state, addr?.pincode, addr?.phone].filter(Boolean).join(', ') || '-';

    return (
        <div className="bg-light-900 dark:bg-dark-900 min-h-screen text-dark-900 dark:text-white transition-colors duration-300">
            <Navbar />

            <div className="pt-24 pb-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/orders" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-500 mb-6">
                    <ArrowLeft size={18} /> Back to Orders
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold font-display">{orderNumber}</h1>
                        <p className="text-gray-500 text-sm">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleViewInvoice}
                            disabled={loadingInvoice}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-800 border border-light-700 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                        >
                            {loadingInvoice ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                            View Invoice
                        </button>
                        <button
                            onClick={handleDownloadInvoice}
                            disabled={loadingInvoice}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loadingInvoice ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                            Download Invoice
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-800 rounded-xl border border-light-700 dark:border-white/5 shadow-sm overflow-hidden mb-6">
                    <div className="p-6 border-b border-gray-100 dark:border-white/5">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                                <span className="text-gray-500 text-sm">
                                    Payment: <span className="font-medium capitalize">{order.paymentStatus}</span>
                                </span>
                            </div>
                        </div>
                        <DeliveryCycle status={order.status} editable={false} />
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                        {(() => {
                            const items = (order.lineItems && order.lineItems.length > 0)
                                ? order.lineItems.map(li => ({
                                    product: li.product,
                                    service: li.service,
                                    quantity: li.quantity,
                                    unitPrice: li.unitPrice,
                                    isService: !!li.service
                                }))
                                : (order.products || []).map(p => ({ product: p.product, quantity: p.quantity, unitPrice: p.product?.price, isService: false }));

                            return items.map((item, idx) => {
                                const isService = item.isService;
                                const title = item.product?.title || item.service?.title || 'Unknown';
                                const img = item.product?.images?.[0] || item.service?.coverImage || 'https://via.placeholder.com/80';
                                const isDigital = !isService && item.product?.type === 'digital';
                                const lineTotal = (item.unitPrice || 0) * (item.quantity || 1);
                                const key = item.product?._id || item.service?._id || idx;

                                return (
                                    <div key={key} className="p-6 flex gap-4 items-center">
                                        <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-dark-900 overflow-hidden shrink-0">
                                            <img src={img} alt={title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold truncate">{title}{isService && <span className="ml-2 text-xs font-normal text-purple-500">(Service)</span>}</h3>
                                            <p className="text-gray-500 text-sm">
                                                Qty: {item.quantity} × ₹{(item.unitPrice || 0).toLocaleString()} = ₹{lineTotal.toLocaleString()}
                                            </p>
                                        </div>
                                        {isDigital && (
                                            <button
                                                onClick={() => handleDownload(item.product._id, item.product.title)}
                                                disabled={!!downloading}
                                                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                                            >
                                                {downloading === item.product._id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                                Download
                                            </button>
                                        )}
                                    </div>
                                );
                            });
                        })()}
                    </div>

                    {addrStr !== '-' && (
                        <div className="p-6 bg-gray-50 dark:bg-dark-900/50 border-t border-gray-100 dark:border-white/5">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Shipping Address</p>
                            <p className="text-dark-900 dark:text-white">{addrStr}</p>
                        </div>
                    )}

                    <div className="p-6 border-t border-gray-100 dark:border-white/5 flex justify-end">
                        <div className="text-right">
                            <p className="text-gray-500 text-sm">Total</p>
                            <p className="text-2xl font-bold text-dark-900 dark:text-white">₹{order.totalAmount?.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
