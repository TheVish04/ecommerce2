import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Heart, Share2, ArrowLeft, Loader2, Zap, X, MapPin } from 'lucide-react';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedPrintLocation, setSelectedPrintLocation] = useState('Front');
    const [buyNowModalOpen, setBuyNowModalOpen] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [shippingAddress, setShippingAddress] = useState({ street: '', city: '', state: '', pincode: '', phone: '' });
    const [buyNowLoading, setBuyNowLoading] = useState(false);
    const { addToCart } = useCart();
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/products/${id}`);
                setProduct(res.data);
            } catch (error) {
                console.error("Error fetching product", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    useEffect(() => {
        if (currentUser && product?.type === 'physical' && buyNowModalOpen) {
            api.get('/users/addresses').then(res => {
                const addrs = res.data || [];
                setAddresses(addrs);
                const defaultAddr = addrs.find(a => a.isDefault) || addrs[0];
                if (defaultAddr) {
                    setSelectedAddressId(defaultAddr._id);
                    setShippingAddress({
                        street: defaultAddr.street || '',
                        city: defaultAddr.city || '',
                        state: defaultAddr.state || '',
                        pincode: defaultAddr.pincode || '',
                        phone: defaultAddr.phone || ''
                    });
                }
            }).catch(() => {});
        }
    }, [currentUser, product?.type, buyNowModalOpen]);

    const handleBuyNow = () => {
        if (!currentUser) {
            navigate(`/login?redirect=/products/${id}`);
            return;
        }
        if (product?.type === 'physical' && product?.stock <= 0) return;
        setBuyNowModalOpen(true);
    };

    const handleBuyNowCheckout = async () => {
        const hasPhysical = product?.type === 'physical';
        if (hasPhysical) {
            const { street, city, phone } = shippingAddress;
            if (!street?.trim() || !city?.trim() || !phone?.trim()) {
                toast.error('Please fill in shipping address (street, city, phone)');
                return;
            }
        }

        setBuyNowLoading(true);
        const payload = {
            items: [{ productId: product._id, quantity: 1, options: { size: selectedSize, color: selectedColor, printLocation: selectedPrintLocation } }],
            shippingAddress: hasPhysical ? shippingAddress : {}
        };

        try {
            const initiateRes = await api.post('/orders/initiate-payment', payload).catch(err => ({ data: null, status: err.response?.status }));

            if (initiateRes.status === 503 || !initiateRes.data?.razorpayOrderId) {
                const orderRes = await api.post('/orders', payload);
                toast.success('Order placed successfully!');
                setBuyNowModalOpen(false);
                navigate(`/order-confirmation/${orderRes.data._id}`);
                return;
            }

            const { razorpayOrderId, amount, currency, key } = initiateRes.data;

            if (!window.Razorpay) {
                toast.error('Payment gateway is loading. Please try again.');
                setBuyNowLoading(false);
                return;
            }

            const rzp = new window.Razorpay({
                key,
                amount,
                currency,
                name: 'KalaVPP',
                description: product.title,
                order_id: razorpayOrderId,
                prefill: { name: currentUser.name, email: currentUser.email, contact: shippingAddress.phone || '' },
                theme: { color: '#2563eb' },
                handler: async (response) => {
                    try {
                        const verifyRes = await api.post('/orders/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            ...payload
                        });
                        toast.success('Payment successful!');
                        setBuyNowModalOpen(false);
                        navigate(`/order-confirmation/${verifyRes.data._id}`);
                    } catch (err) {
                        toast.error(err.response?.data?.message || 'Payment verification failed');
                    } finally {
                        setBuyNowLoading(false);
                    }
                },
                modal: { ondismiss: () => setBuyNowLoading(false) }
            });
            rzp.on('payment.failed', () => {
                toast.error('Payment failed. Please try again.');
                setBuyNowLoading(false);
            });
            rzp.open();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Checkout failed');
        } finally {
            setBuyNowLoading(false);
        }
    };

    useEffect(() => {
        if (product) {
            if (product.availableSizes?.length > 0) setSelectedSize(product.availableSizes[0]);
            if (product.availableColors?.length > 0) setSelectedColor(product.availableColors[0]);
            if (product.printLocations?.length > 0) setSelectedPrintLocation(product.printLocations[0]);
        }
    }, [product]);

    if (loading) return (
        <div className="bg-light-900 dark:bg-dark-900 min-h-screen flex items-center justify-center text-blue-500">
            <Loader2 className="animate-spin" size={40} />
        </div>
    );

    if (!product) return (
        <div className="bg-light-900 dark:bg-dark-900 min-h-screen flex items-center justify-center text-dark-900 dark:text-white">
            Product Not Found
        </div>
    );

    return (
        <div className="bg-light-900 dark:bg-dark-900 min-h-screen text-dark-900 dark:text-white transition-colors duration-300">
            <Navbar />

            <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/shop" className="inline-flex items-center text-gray-500 hover:text-blue-500 mb-8 transition-colors">
                    <ArrowLeft size={18} className="mr-2" /> Back to Shop
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Images */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-white dark:bg-white/5 rounded-2xl overflow-hidden border border-light-700 dark:border-white/10 relative shadow-lg">
                            <img
                                src={product.images?.[activeImage] || 'https://via.placeholder.com/600'}
                                alt={product.title}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        {product.images?.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${activeImage === idx ? 'border-blue-500 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-col">
                        <div className="mb-2">
                            <span className="text-sm font-bold text-blue-500 uppercase tracking-wider bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded">
                                {product.type}
                            </span>
                        </div>
                        <h1 className="text-4xl font-bold font-display mb-4 text-dark-900 dark:text-white">{product.title}</h1>

                        {/* Vendor Info */}
                        <div className="flex items-center gap-3 mb-6 p-3 bg-white dark:bg-white/5 rounded-xl w-fit pr-6 border border-light-700 dark:border-white/10">
                            <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full overflow-hidden">
                                {product.vendor?.vendorProfile?.profileImage ? (
                                    <img src={product.vendor.vendorProfile.profileImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                                        {product.vendor?.name?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Created by</p>
                                <Link to={`/artist/${product.vendor?._id}`} className="font-bold text-blue-500 hover:underline">
                                    {product.vendor?.vendorProfile?.storeName || product.vendor?.name}
                                </Link>
                            </div>
                        </div>

                        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                            <p>{product.description}</p>
                        </div>

                        {/* Merchandise Options */}
                        {(product.availableSizes?.length > 0 || product.availableColors?.length > 0) && (
                            <div className="space-y-6 mb-8 border-t border-gray-200 dark:border-white/10 pt-6">
                                {/* Size Selector */}
                                {product.availableSizes?.length > 0 && (
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-sm font-bold text-dark-900 dark:text-white">Select Size</label>
                                            <button className="text-xs text-blue-500 hover:underline">Size Guide</button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {product.availableSizes.map(size => (
                                                <button
                                                    key={size}
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`w-12 h-12 rounded-lg border font-medium transition-all ${selectedSize === size
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                                                        : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/30 text-gray-600 dark:text-gray-300'}`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Color Selector */}
                                {product.availableColors?.length > 0 && (
                                    <div>
                                        <label className="text-sm font-bold text-dark-900 dark:text-white mb-2 block">Select Color</label>
                                        <div className="flex flex-wrap gap-3">
                                            {product.availableColors.map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => setSelectedColor(color)}
                                                    className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color
                                                        ? 'border-blue-500 scale-110 shadow-md ring-2 ring-blue-500/20'
                                                        : 'border-transparent hover:scale-105'}`}
                                                    style={{ backgroundColor: color.toLowerCase() }} // Assuming color names are valid CSS colors
                                                    title={color}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Selected: <span className="font-bold">{selectedColor}</span></p>
                                    </div>
                                )}

                                {/* Print Location */}
                                {product.printLocations?.length > 0 && (
                                    <div>
                                        <label className="text-sm font-bold text-dark-900 dark:text-white mb-2 block">Print Location</label>
                                        <div className="flex gap-2">
                                            {product.printLocations.map(loc => (
                                                <button
                                                    key={loc}
                                                    onClick={() => setSelectedPrintLocation(loc)}
                                                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedPrintLocation === loc
                                                        ? 'bg-dark-900 dark:bg-white text-white dark:text-dark-900 border-transparent'
                                                        : 'bg-transparent border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                                >
                                                    {loc}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Material & Design Type */}
                                {(product.material || product.designType) && (
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                        {product.material && (
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Material</label>
                                                <p className="text-dark-900 dark:text-white font-medium">{product.material}</p>
                                            </div>
                                        )}
                                        {product.designType && (
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Design Type</label>
                                                <p className="text-dark-900 dark:text-white font-medium">{product.designType}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-auto pt-8 border-t border-gray-200 dark:border-white/10">
                            <div className="flex items-end justify-between mb-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Price</p>
                                    <p className="text-4xl font-bold text-dark-900 dark:text-emerald-400">₹{product.price}</p>
                                </div>
                                <div className="flex gap-4">
                                    <button className="p-3 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                        <Heart size={24} />
                                    </button>
                                    <button className="p-3 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                                        <Share2 size={24} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Button
                                    size="lg"
                                    className="w-full flex items-center justify-center gap-2 text-lg py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleBuyNow}
                                    disabled={product.type === 'physical' && product.stock <= 0}
                                >
                                    <Zap size={20} />
                                    {product.type === 'physical' && product.stock <= 0 ? 'Out of Stock' : 'Buy Now'}
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full flex items-center justify-center gap-2 text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => currentUser ? addToCart(product, 1, { size: selectedSize, color: selectedColor, printLocation: selectedPrintLocation }) : alert('Please log in first')}
                                    disabled={product.type === 'physical' && product.stock <= 0}
                                >
                                    <ShoppingCart size={20} />
                                    Add to Cart
                                </Button>
                            </div>

                            {/* Buy Now Modal - Address & Confirm */}
                            {buyNowModalOpen && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                                    <div className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-md shadow-2xl border border-light-700 dark:border-white/10 overflow-hidden">
                                        <div className="p-6 border-b border-gray-200 dark:border-white/5 flex justify-between items-center">
                                            <h2 className="text-xl font-bold text-dark-900 dark:text-white">Buy Now</h2>
                                            <button onClick={() => setBuyNowModalOpen(false)} className="text-gray-400 hover:text-white p-1">
                                                <X size={24} />
                                            </button>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div className="flex justify-between text-lg">
                                                <span className="text-gray-600 dark:text-gray-400">Total</span>
                                                <span className="font-bold text-emerald-400">₹{product.price}</span>
                                            </div>

                                            {product.type === 'physical' && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 text-sm font-medium text-dark-900 dark:text-white">
                                                        <MapPin size={16} /> Shipping Address
                                                    </div>
                                                    {addresses.length > 0 && (
                                                        <div className="space-y-2 max-h-32 overflow-y-auto mb-3">
                                                            {addresses.map(addr => (
                                                                <button
                                                                    key={addr._id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedAddressId(addr._id);
                                                                        setShippingAddress({ street: addr.street || '', city: addr.city || '', state: addr.state || '', pincode: addr.pincode || '', phone: addr.phone || '' });
                                                                    }}
                                                                    className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm ${selectedAddressId === addr._id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'}`}
                                                                >
                                                                    {addr.label} · {addr.street}, {addr.city}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input type="text" placeholder="Street" value={shippingAddress.street} onChange={e => { setSelectedAddressId(null); setShippingAddress(s => ({ ...s, street: e.target.value })); }} className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 text-sm text-dark-900 dark:text-white" />
                                                        <input type="text" placeholder="City" value={shippingAddress.city} onChange={e => { setSelectedAddressId(null); setShippingAddress(s => ({ ...s, city: e.target.value })); }} className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 text-sm text-dark-900 dark:text-white" />
                                                        <input type="text" placeholder="State" value={shippingAddress.state} onChange={e => setShippingAddress(s => ({ ...s, state: e.target.value }))} className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 text-sm text-dark-900 dark:text-white" />
                                                        <input type="text" placeholder="Pincode" value={shippingAddress.pincode} onChange={e => setShippingAddress(s => ({ ...s, pincode: e.target.value }))} className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 text-sm text-dark-900 dark:text-white" />
                                                        <input type="tel" placeholder="Phone" value={shippingAddress.phone} onChange={e => setShippingAddress(s => ({ ...s, phone: e.target.value }))} className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 text-sm text-dark-900 dark:text-white col-span-2" />
                                                    </div>
                                                </div>
                                            )}

                                            <Button onClick={handleBuyNowCheckout} disabled={buyNowLoading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2">
                                                {buyNowLoading ? <Loader2 size={20} className="animate-spin" /> : <Zap size={18} />}
                                                {buyNowLoading ? 'Processing...' : `Pay ₹${product.price}`}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${product.type === 'physical' && product.stock <= 0 ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                {product.type === 'physical' && product.stock <= 0 ? 'Unavailable currently' : 'Secure checkout by Razorpay'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
