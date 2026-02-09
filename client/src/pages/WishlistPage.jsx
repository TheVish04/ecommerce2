import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Trash2, ShoppingCart, Loader2 } from 'lucide-react';
import axios from 'axios';
import { Link, Navigate } from 'react-router-dom';

const WishlistPage = () => {
    const [wishlistProducts, setWishlistProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();
    const { addToCart } = useCart();
    const { toggleWishlist, wishlist } = useWishlist();

    useEffect(() => {
        const fetchWishlistDetails = async () => {
            setLoading(true);
            try {
                const res = await axios.get('http://localhost:3001/api/wishlist', {
                    withCredentials: true
                });
                if (res.data && res.data.products) {
                    setWishlistProducts(res.data.products);
                }
            } catch (error) {
                console.error("Error fetching wishlist", error);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchWishlistDetails();
        }
    }, [currentUser, wishlist]); // Refetch if wishlist IDs change (e.g. removed from another tab)

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="bg-light-900 dark:bg-dark-900 min-h-screen text-dark-900 dark:text-white transition-colors duration-300">
            <Navbar />

            <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold font-display mb-8">My Wishlist</h1>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-blue-500" size={40} />
                    </div>
                ) : wishlistProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-dark-800 rounded-2xl border border-light-700 dark:border-white/5">
                        <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 mb-6">Explore our collection and find something you love!</p>
                        <Link to="/shop" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                            Explore Artworks
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {wishlistProducts.map(product => (
                            <div key={product._id} className="group bg-white dark:bg-dark-800 rounded-2xl overflow-hidden border border-light-700 dark:border-white/5 hover:shadow-xl transition-all duration-300 flex flex-col relative">
                                {/* Remove Button */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleWishlist(product._id);
                                    }}
                                    className="absolute top-2 right-2 z-10 p-2 bg-white/80 dark:bg-black/80 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                    title="Remove from Wishlist"
                                >
                                    <Trash2 size={18} />
                                </button>

                                {/* Image */}
                                <div className="aspect-[4/5] relative overflow-hidden bg-gray-100 dark:bg-dark-900">
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
                                            onClick={() => addToCart(product)}
                                            className="w-full py-2 bg-white text-dark-900 font-bold rounded-lg hover:bg-gray-100 flex items-center justify-center gap-2"
                                            disabled={product.type === 'physical' && product.stock <= 0}
                                        >
                                            <ShoppingCart size={16} />
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="font-bold text-dark-900 dark:text-white truncate mb-1">
                                        <Link to={`/products/${product._id}`}>{product.title}</Link>
                                    </h3>

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

export default WishlistPage;
