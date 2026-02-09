import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { Filter, Search, ShoppingCart, Loader2, Heart } from 'lucide-react';
import api from '../services/api';
import { Link, useSearchParams } from 'react-router-dom';
import Button from '../components/Button';

const ShopPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { currentUser } = useAuth();

    // Filters
    const category = searchParams.get('category') || '';
    const type = searchParams.get('type') || '';
    const search = searchParams.get('search') || '';

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const query = new URLSearchParams();
                if (category) query.append('category', category);
                if (type) query.append('type', type);
                if (search) query.append('search', search);

                const res = await api.get(`/products?${query.toString()}`);
                setProducts(res.data);
            } catch (error) {
                console.error("Error fetching products", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [category, type, search]);

    const handleFilterChange = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        setSearchParams(newParams);
    };

    return (
        <div className="bg-light-900 dark:bg-dark-900 min-h-screen text-dark-900 dark:text-white transition-colors duration-300">
            <Navbar />

            <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header & Filters */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-display">Explore Artworks</h1>
                        <p className="text-gray-500 dark:text-gray-400">Find unique pieces for your collection</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <select
                            className="bg-light-800 dark:bg-dark-800 border border-light-700 dark:border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                            value={category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                        >
                            <option value="">All Categories</option>
                            <option value="art">Art</option>
                            <option value="merch">Merchandise</option>
                            <option value="digital">Digital Assets</option>
                        </select>

                        <select
                            className="bg-light-800 dark:bg-dark-800 border border-light-700 dark:border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                            value={type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="physical">Physical</option>
                            <option value="digital">Digital</option>
                        </select>
                    </div>
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-blue-500" size={40} />
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        No products found matching your criteria.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map(product => (
                            <div key={product._id} className="group bg-white dark:bg-dark-800 rounded-2xl overflow-hidden border border-light-700 dark:border-white/5 hover:shadow-xl transition-all duration-300 flex flex-col">
                                {/* Image */}
                                <div className="aspect-[4/5] relative overflow-hidden bg-gray-100 dark:bg-dark-900">
                                    <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleWishlist(product._id);
                                            }}
                                            className="p-2 bg-white/80 dark:bg-black/80 rounded-full text-gray-600 dark:text-gray-300 hover:text-pink-500 hover:bg-white dark:hover:bg-dark-700 transition-colors"
                                        >
                                            <Heart size={18} className={isInWishlist(product._id) ? "fill-pink-500 text-pink-500" : ""} />
                                        </button>
                                    </div>
                                    <Link to={`/products/${product._id}`}>
                                        <img
                                            src={product.images?.[0] || 'https://via.placeholder.com/400'}
                                            alt={product.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </Link>

                                    {/* Quick Add Overlay */}
                                    <div className={`absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/80 to-transparent ${product.type === 'physical' && product.stock <= 0 ? 'hidden' : ''}`}>
                                        <button
                                            onClick={() => currentUser ? addToCart(product) : alert('Please log in to add to cart')}
                                            className="w-full py-2 bg-white text-dark-900 font-bold rounded-lg hover:bg-gray-100 flex items-center justify-center gap-2"
                                            disabled={product.type === 'physical' && product.stock <= 0}
                                        >
                                            <ShoppingCart size={16} />
                                            Add to Cart
                                        </button>
                                    </div>

                                    {/* Out of Stock Badge */}
                                    {product.type === 'physical' && product.stock <= 0 && (
                                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                            Out of Stock
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="p-4 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-dark-900 dark:text-white truncate pr-2" title={product.title}>
                                            <Link to={`/products/${product._id}`}>{product.title}</Link>
                                        </h3>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 truncate">
                                        by <Link to={`/artist/${product.vendor?._id}`} className="hover:text-blue-500 underline decoration-dotted">{product.vendor?.vendorProfile?.storeName || product.vendor?.name || 'Unknown Artist'}</Link>
                                    </p>

                                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
                                        <span className="text-lg font-bold text-dark-900 dark:text-emerald-400">₹{product.price}</span>
                                        <span className="text-xs uppercase font-bold text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">
                                            {product.type}
                                        </span>
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

export default ShopPage;
