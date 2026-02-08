import { useState, useEffect } from 'react';
import api from '../../services/api';
import DeliveryCycle from '../../components/DeliveryCycle';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const STATUS_LABEL = { pending: 'PLACED', processing: 'CONFIRMED', shipped: 'SHIPPED', completed: 'DELIVERED', cancelled: 'CANCELLED' };

const VendorOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/vendor/orders');
            setOrders(res.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        setSaving(orderId);
        try {
            await api.patch(`/orders/${orderId}`, { status: newStatus });
            setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
            toast.success('Order status updated');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update');
        } finally {
            setSaving(null);
        }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    if (loading) return <div className="text-center p-8 text-gray-400"><Loader2 className="animate-spin inline" size={32} /></div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Order Management</h2>
            <p className="text-gray-400 text-sm">Update delivery status for your orders.</p>

            <div className="space-y-6">
                {orders.length === 0 ? (
                    <div className="glass-card p-12 text-center text-gray-500">No orders yet.</div>
                ) : (
                    orders.map((order) => (
                        <div key={order._id} className="glass-card p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                                <h3 className="font-bold text-white">
                                    Order #{order._id?.toString().slice(-8).toUpperCase()}
                                </h3>
                                <span className={`text-sm font-bold uppercase ${order.status === 'completed' ? 'text-green-400' : order.status === 'cancelled' ? 'text-red-400' : 'text-amber-400'}`}>
                                    {STATUS_LABEL[order.status] || order.status}
                                </span>
                            </div>
                            <DeliveryCycle
                                status={order.status}
                                editable={true}
                                onStatusChange={(s) => handleStatusChange(order._id, s)}
                                saving={saving === order._id}
                            />
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <p className="text-gray-300 text-sm">{order.product}</p>
                                <p className="text-gray-500 text-xs mt-1">Customer: {order.customer} • {formatDate(order.date)}</p>
                                <p className="text-emerald-400 font-mono font-bold mt-2">₹{order.amount?.toLocaleString()}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default VendorOrders;
