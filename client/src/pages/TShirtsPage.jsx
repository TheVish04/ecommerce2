import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Filter, Search, ShoppingCart, Loader2, Heart, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { Link, useSearchParams } from 'react-router-dom';

const TShirtsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const { addToCart } = useCart();
    const { currentUser } = useAuth();

    // Default filters: no style/gender so all merchandise apparel (T-shirts) show
    const [style, setStyle] = useState('');
    const [gender, setGender] = useState('');

    const styles = [
        { id: '', label: 'All Styles' },
        { id: 'Classic', label: 'Classic T-Shirts' },
        { id: 'Essential', label: 'Essential T-Shirts' },
        { id: 'Oversized', label: 'Oversized T-Shirts', isNew: true },
        { id: 'Boxy', label: 'Boxy T-Shirts', isNew: true },
        { id: 'Tri-blend', label: 'Tri-blend T-Shirts' },
        { id: 'Graphic', label: 'Graphic T-Shirts' }
    ];

    const genders = [
        { id: 'Women', label: "Women's T-Shirts", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
        { id: 'Men', label: "Men's T-Shirts", img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
        { id: 'Unisex', label: "Unisex T-Shirts", img: "https://images.unsplash.com/photo-1562157873-818bc0726f68?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
        { id: 'Kids', label: "Kid's T-Shirts", img: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" }
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const query = new URLSearchParams();
                query.append('category', 'merchandise');
                query.append('subCategory', 'T-Shirts');
                if (style && style.trim()) query.append('style', style);
                if (gender && gender.trim()) query.append('gender', gender);

                const res = await api.get(`/products?${query.toString()}`);
                setProducts(res.data);
            } catch (error) {
                console.error("Error fetching products", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [style, gender]);

    return (
        <div className="bg-light-900 dark:bg-dark-900 min-h-screen text-dark-900 dark:text-white transition-colors duration-300">
            <Navbar />

            <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold font-display mb-2">{gender ? `${gender}'s ` : ''}{style ? `${style} ` : 'All '}T-Shirts</h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
                        Uncommon t-shirts designed by artists and fit for every kind of human.
                        Featuring original designs on high-quality fabrics.
                    </p>
                </div>

                {/* Style Tabs */}
                <div className="flex overflow-x-auto pb-4 gap-2 mb-8 no-scrollbar">
                    {styles.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => setStyle(s.id)}
                            className={`whitespace-nowrap px-6 py-3 rounded-lg border font-medium transition-all duration-300 relative
                                ${style === s.id
                                    ? 'bg-dark-900 dark:bg-white text-white dark:text-dark-900 border-transparent shadow-lg transform scale-105'
                                    : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10'
                                }
                            `}
                        >
                            {s.isNew && (
                                <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                                    NEW
                                </span>
                            )}
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Gender Tiles (Only show if no gender selected) */}
                {!gender && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {genders.map((g) => (
                            <button
                                key={g.id}
                                onClick={() => setGender(g.id)}
                                className="group relative overflow-hidden rounded-2xl aspect-[4/5] text-left"
                            >
                                <img
                                    src={g.img}
                                    alt={g.label}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                                    <h3 className="text-xl font-bold text-white mb-1 group-hover:translate-x-2 transition-transform duration-300">
                                        {g.label}
                                    </h3>
                                    <span className="text-sm text-gray-300 group-hover:text-white flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-300 delay-75">
                                        Shop Now <ArrowRight size={16} />
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Filters Reset if Gender Selected */}
                {gender && (
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-sm text-gray-500">Filtering by: <span className="font-bold text-dark-900 dark:text-white">{gender}</span></span>
                        <button
                            onClick={() => setGender('')}
                            className="text-xs text-red-500 hover:underline"
                        >
                            Clear Filter
                        </button>
                    </div>
                )}

                {/* Product Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-blue-500" size={40} />
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-300 dark:border-white/10">
                        <div className="text-6xl mb-4">👕</div>
                        <h3 className="text-xl font-bold mb-2">No Matching T-Shirts Found</h3>
                        <p className="text-gray-500 mb-6">Try selecting a different style or gender category.</p>
                        <button
                            onClick={() => { setStyle(''); setGender(''); }}
                            className="text-blue-500 font-bold hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                        {products.map(product => (
                            <div key={product._id} className="group relative">
                                {/* Discount Badge */}
                                {product.compareAtPrice && product.compareAtPrice > product.price && (
                                    <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                        -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                                    </span>
                                )}

                                {/* Wishlist Button */}
                                <button className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-300">
                                    <Heart size={18} />
                                </button>

                                {/* Image */}
                                <div className="aspect-[4/5] bg-gray-100 dark:bg-white/5 rounded-lg overflow-hidden mb-4 relative">
                                    <Link to={`/products/${product._id}`}>
                                        <img
                                            src={product.images?.[0] || 'https://via.placeholder.com/400'}
                                            alt={product.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        {/* Hover Image (if 2nd image exists) */}
                                        {product.images?.[1] && (
                                            <img
                                                src={product.images[1]}
                                                alt={product.title}
                                                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                                            />
                                        )}
                                    </Link>
                                </div>

                                {/* Info */}
                                <div>
                                    <Link to={`/products/${product._id}`}>
                                        <h3 className="font-bold text-lg text-dark-900 dark:text-white mb-1 group-hover:text-blue-500 transition-colors">
                                            {product.title}
                                        </h3>
                                    </Link>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-200">
                                            <img src={product.vendor?.vendorProfile?.profileImage || `https://ui-avatars.com/api/?name=${product.vendor?.name}&background=random`} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                            {product.vendor?.vendorProfile?.storeName || product.vendor?.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-dark-900 dark:text-emerald-400">₹{product.price}</span>
                                        {product.compareAtPrice && (
                                            <span className="text-sm text-gray-400 line-through">₹{product.compareAtPrice}</span>
                                        )}
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

export default TShirtsPage;
