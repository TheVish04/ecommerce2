import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Heart, Share2, ArrowLeft, Loader2 } from 'lucide-react';
import Button from '../components/Button';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedPrintLocation, setSelectedPrintLocation] = useState('Front');
    const { addToCart } = useCart();
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`http://localhost:3001/api/products/${id}`);
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

                            <div className="flex gap-4">
                                <Button
                                    size="lg"
                                    className="flex-1 flex items-center justify-center gap-2 text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => currentUser ? addToCart(product, 1, { size: selectedSize, color: selectedColor, printLocation: selectedPrintLocation }) : alert('Please log in first')}
                                    disabled={product.type === 'physical' && product.stock <= 0}
                                >
                                    <ShoppingCart size={20} />
                                    {product.type === 'physical' && product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                </Button>
                                {/* <Button size="lg" variant="outline" className="flex-1 text-lg py-4">
                                    Buy Now
                                </Button> */}
                            </div>

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
