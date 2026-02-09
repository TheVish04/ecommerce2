import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Loader2, MapPin, Briefcase } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import api from '../services/api';
import toast from 'react-hot-toast';

const CartPage = () => {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const total = getCartTotal();
    const [checkingOut, setCheckingOut] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [shippingAddress, setShippingAddress] = useState({
        street: '',
        city: '',
        state: '',
        pincode: '',
        phone: ''
    });

    const hasPhysicalProduct = cartItems.some(item => item.type === 'physical');

    useEffect(() => {
        if (currentUser && hasPhysicalProduct) {
            api.get('/users/addresses')
                .then(res => {
                    setAddresses(res.data);
                    const defaultAddr = res.data.find(a => a.isDefault) || res.data[0];
                    if (defaultAddr) {
                        setSelectedAddressId(defaultAddr._id);
                        setShippingAddress({
                            street: defaultAddr.street || '',
                            city: defaultAddr.city || '',
                            state: defaultAddr.state || '',
                            pincode: defaultAddr.pincode || '',
                            phone: defaultAddr.phone || ''
                        });
                        setUseNewAddress(false);
                    }
                })
                .catch(() => { });
        }
    }, [currentUser, hasPhysicalProduct]);

    const selectAddress = (addr) => {
        setSelectedAddressId(addr._id);
        setUseNewAddress(false);
        setShippingAddress({
            street: addr.street || '',
            city: addr.city || '',
            state: addr.state || '',
            pincode: addr.pincode || '',
            phone: addr.phone || ''
        });
    };

    const getPayload = () => ({
        items: cartItems.map(item => {
            if (item.itemType === 'service') {
                return {
                    serviceId: item._id,
                    quantity: 1,
                    customizations: item.customizations || '',
                    scheduledDate: item.scheduledDate || null
                };
            }
            return {
                productId: item._id,
                quantity: item.quantity,
                options: item.selectedOptions || {}
            };
        }),
        shippingAddress: hasPhysicalProduct ? shippingAddress : {}
    });

    const handleCheckout = async () => {
        if (!currentUser) {
            navigate('/login?redirect=/cart');
            return;
        }

        if (hasPhysicalProduct) {
            const { street, city, phone } = shippingAddress;
            if (!street?.trim() || !city?.trim() || !phone?.trim()) {
                toast.error('Please fill in shipping address (street, city, phone)');
                return;
            }
        }

        setCheckingOut(true);
        const payload = getPayload();

        try {
            const initiateRes = await api.post('/orders/initiate-payment', payload).catch(err => ({ data: null, status: err.response?.status }));

            if (initiateRes.status === 503 || !initiateRes.data?.razorpayOrderId) {
                const orderRes = await api.post('/orders', payload);
                clearCart();
                toast.success('Order placed successfully!');
                navigate(`/order-confirmation/${orderRes.data._id}`);
                return;
            }

            const { razorpayOrderId, amount, currency, key } = initiateRes.data;

            if (!window.Razorpay) {
                toast.error('Payment gateway is loading. Please try again in a moment.');
                setCheckingOut(false);
                return;
            }

            const rzpOptions = {
                key,
                amount,
                currency,
                name: 'KalaVPP',
                description: 'Art & Creative Marketplace',
                order_id: razorpayOrderId,
                prefill: { name: currentUser.name, email: currentUser.email, contact: shippingAddress.phone || '' },
                theme: { color: '#2563eb' },
                handler: async (response) => {
                    const toastId = toast.loading('Verifying payment...');
                    try {
                        const verifyRes = await api.post('/orders/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            ...payload
                        });
                        clearCart();
                        toast.success('Payment successful! Order confirmed.', { id: toastId });
                        navigate(`/order-confirmation/${verifyRes.data._id}`);
                    } catch (err) {
                        console.error('Payment verification error:', err);
                        toast.error(err.response?.data?.message || 'Payment verification failed', { id: toastId });
                    } finally {
                        setCheckingOut(false);
                    }
                },
                modal: {
                    ondismiss: () => setCheckingOut(false)
                }
            };

            const rzp = new window.Razorpay(rzpOptions);
            rzp.on('payment.failed', () => {
                toast.error('Payment failed. Please try again.');
                setCheckingOut(false);
            });
            rzp.open();
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Checkout failed';
            toast.error(message);
            setCheckingOut(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="bg-light-900 dark:bg-dark-900 min-h-screen transition-colors duration-300">
                <Navbar />
                <div className="pt-32 pb-12 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-24 h-24 bg-light-800 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <ShoppingBag size={48} className="text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
                    <div className="flex gap-4">
                        <Link to="/shop"><Button variant="primary">Shop Products</Button></Link>
                        <Link to="/services"><Button variant="outline">Browse Services</Button></Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-light-900 dark:bg-dark-900 min-h-screen text-dark-900 dark:text-white transition-colors duration-300">
            <Navbar />

            <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold font-display mb-8">Shopping Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => {
                            const isService = item.itemType === 'service';
                            const price = item.price ?? item.basePrice ?? 0;
                            const qty = item.quantity ?? 1;
                            const lineTotal = price * qty;
                            const imgSrc = (Array.isArray(item.images) ? item.images[0] : item.coverImage) || item.images?.[0] || 'https://via.placeholder.com/150';
                            return (
                                <div key={item.cartItemId || item._id} className="bg-white dark:bg-dark-800 p-4 rounded-xl border border-light-700 dark:border-white/5 flex gap-4 items-center shadow-sm">
                                    <div className="w-24 h-24 bg-gray-100 dark:bg-dark-900 rounded-lg overflow-hidden shrink-0">
                                        <img src={imgSrc} alt={item.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-dark-900 dark:text-white truncate pr-4">
                                                {isService ? (
                                                    <span>{item.title}</span>
                                                ) : (
                                                    <Link to={`/products/${item._id}`}>{item.title}</Link>
                                                )}
                                            </h3>
                                            <button onClick={() => removeFromCart(item.cartItemId || item._id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                                            {isService ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                                    <Briefcase size={12} /> Service
                                                </span>
                                            ) : (
                                                <span className="capitalize">{item.type || 'product'}</span>
                                            )}
                                        </p>

                                        {!isService && item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {Object.entries(item.selectedOptions).map(([key, value]) =>
                                                    value && (
                                                        <span key={key} className="text-xs bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-gray-600 dark:text-gray-300 capitalize">
                                                            <span className="font-bold">{key}:</span> {value}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        )}
                                        {isService && item.customizations && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{item.customizations}</p>
                                        )}

                                        <div className="flex justify-between items-center">
                                            {isService ? (
                                                <span className="text-sm text-gray-500">Qty: 1</span>
                                            ) : (
                                                <div className="flex items-center gap-3 bg-light-900 dark:bg-white/5 rounded-lg p-1">
                                                    <button onClick={() => updateQuantity(item.cartItemId || item._id, item.quantity - 1)} className="p-1 hover:bg-white dark:hover:bg-white/10 rounded disabled:opacity-50" disabled={item.quantity <= 1}>
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.cartItemId || item._id, item.quantity + 1)} className="p-1 hover:bg-white dark:hover:bg-white/10 rounded">
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            )}
                                            <div className="font-bold text-lg">₹{lineTotal}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Order Summary & Checkout */}
                    <div className="lg:col-span-1 space-y-6">
                        {hasPhysicalProduct && (
                            <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-light-700 dark:border-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold">Shipping Address</h3>
                                    <Link to="/profile" className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
                                        <MapPin size={14} /> Manage
                                    </Link>
                                </div>

                                {addresses.length > 0 && !useNewAddress && (
                                    <div className="space-y-2 mb-4">
                                        {addresses.map((addr) => (
                                            <button
                                                key={addr._id}
                                                type="button"
                                                onClick={() => selectAddress(addr)}
                                                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedAddressId === addr._id
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                                                        : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">{addr.label}</span>
                                                    {addr.isDefault && <span className="text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">Default</span>}
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {addr.street}, {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.pincode}
                                                </p>
                                                <p className="text-xs text-gray-500">{addr.phone}</p>
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => { setUseNewAddress(true); setSelectedAddressId(null); setShippingAddress({ street: '', city: '', state: '', pincode: '', phone: '' }); }}
                                            className="w-full p-3 rounded-lg border border-dashed border-gray-300 dark:border-white/20 text-gray-500 hover:border-blue-500 hover:text-blue-500 text-sm"
                                        >
                                            + Add new address
                                        </button>
                                    </div>
                                )}

                                {(useNewAddress || addresses.length === 0) && (
                                    <div className="space-y-3">
                                        {addresses.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => { setUseNewAddress(false); const d = addresses.find(a => a.isDefault) || addresses[0]; if (d) selectAddress(d); }}
                                                className="text-sm text-blue-500 hover:underline mb-2"
                                            >
                                                ← Use saved address
                                            </button>
                                        )}
                                        <input
                                            type="text"
                                            placeholder="Street address"
                                            value={shippingAddress.street}
                                            onChange={e => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                                            className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 text-dark-900 dark:text-white placeholder-gray-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="City"
                                            value={shippingAddress.city}
                                            onChange={e => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                                            className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 text-dark-900 dark:text-white placeholder-gray-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="State"
                                            value={shippingAddress.state}
                                            onChange={e => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                                            className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 text-dark-900 dark:text-white placeholder-gray-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Pincode"
                                            value={shippingAddress.pincode}
                                            onChange={e => setShippingAddress(prev => ({ ...prev, pincode: e.target.value }))}
                                            className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 text-dark-900 dark:text-white placeholder-gray-500"
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Phone"
                                            value={shippingAddress.phone}
                                            onChange={e => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 text-dark-900 dark:text-white placeholder-gray-500"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-light-700 dark:border-white/5 shadow-lg sticky top-24">
                            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span>₹{total}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Taxes (Estimated)</span>
                                    <span>₹{(total * 0.18).toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-200 dark:border-white/10 pt-3 flex justify-between font-bold text-lg text-dark-900 dark:text-white">
                                    <span>Total</span>
                                    <span>₹{(total * 1.18).toFixed(2)}</span>
                                </div>
                            </div>

                            {!currentUser ? (
                                <Button
                                    onClick={() => navigate('/login?redirect=/cart')}
                                    className="w-full flex items-center justify-center gap-2 py-3"
                                >
                                    Login to Checkout <ArrowRight size={18} />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleCheckout}
                                    disabled={checkingOut}
                                    className="w-full flex items-center justify-center gap-2 py-3"
                                >
                                    {checkingOut ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Placing Order...
                                        </>
                                    ) : (
                                        <>
                                            Place Order <ArrowRight size={18} />
                                        </>
                                    )}
                                </Button>
                            )}

                            <p className="text-xs text-center text-gray-500 mt-4">
                                Secure payment via Razorpay. Orders without Razorpay config use direct checkout.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
