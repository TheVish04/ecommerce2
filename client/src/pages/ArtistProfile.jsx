import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { User, Instagram, Twitter, Globe, MapPin, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ArtistProfile = () => {
    const { id } = useParams();
    const [artist, setArtist] = useState(null);
    const [products, setProducts] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { currentUser } = useAuth();


    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Artist Info
                const artistRes = await api.get(`/users/artist/${id}`);
                setArtist(artistRes.data);

                // Fetch Artist Products (Public)
                const productsRes = await api.get(`/users/artist/${id}/products`);
                setProducts(productsRes.data);

                // Fetch Artist Services (Public)
                const servicesRes = await api.get(`/users/artist/${id}/services`);
                setServices(servicesRes.data);

            } catch (error) {
                console.error("Error fetching artist data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="min-h-screen bg-light-900 dark:bg-dark-900 text-dark-900 dark:text-white flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> Loading Artist...</div>;
    if (!artist) return <div className="min-h-screen bg-light-900 dark:bg-dark-900 text-dark-900 dark:text-white flex items-center justify-center">Artist Not Found</div>;

    const { vendorProfile } = artist;
    const socialLinks = vendorProfile?.socialLinks || {};

    return (
        <div className="bg-light-900 dark:bg-dark-900 text-dark-900 dark:text-white min-h-screen transition-colors duration-300">
            <Navbar />

            <div className="pt-24 pb-12 px-4 md:px-8">
                {/* Header / Banner */}
                <div className="max-w-6xl mx-auto mb-12">
                    <div className="glass-card bg-white dark:bg-white/5 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 text-center md:text-left border border-light-700 dark:border-white/10 shadow-lg">
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white dark:border-white/10 shrink-0 bg-gray-200 dark:bg-gray-800 shadow-xl">
                            {vendorProfile?.profileImage ? (
                                <img src={vendorProfile.profileImage} alt={artist.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User size={64} className="text-gray-400 dark:text-gray-600" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 space-y-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent mb-2 font-display">
                                    {vendorProfile?.storeName || artist.name}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto md:mx-0">
                                    {vendorProfile?.bio || "No bio available."}
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                {socialLinks.instagram && (
                                    <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors text-pink-600 dark:text-pink-400 font-medium">
                                        <Instagram size={18} />
                                        <span>Instagram</span>
                                    </a>
                                )}
                                {socialLinks.twitter && (
                                    <a href={socialLinks.twitter} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors text-blue-500 dark:text-blue-400 font-medium">
                                        <Twitter size={18} />
                                        <span>Twitter</span>
                                    </a>
                                )}
                                {socialLinks.portfolio && (
                                    <a href={socialLinks.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors text-emerald-600 dark:text-emerald-400 font-medium">
                                        <Globe size={18} />
                                        <span>Portfolio</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto space-y-16">
                    {/* Active Products Section */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <span className="w-1.5 h-8 bg-blue-500 rounded-full"></span>
                            Shop Collections
                        </h2>
                        {products.length === 0 ? (
                            <div className="text-gray-500 text-center py-12 glass-card bg-white dark:bg-white/5 border border-light-700 dark:border-white/10">
                                No active products found.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map(product => (
                                    <div key={product._id} className="group bg-white dark:bg-dark-800 rounded-2xl overflow-hidden border border-light-700 dark:border-white/5 hover:shadow-xl transition-all duration-300">
                                        <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                                            <img
                                                src={product.images?.[0] || 'https://via.placeholder.com/300'}
                                                alt={product.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            {/* Quick Add Overlay */}
                                            {!(product.type === 'physical' && product.stock <= 0) && (
                                                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/80 to-transparent">
                                                    <button
                                                        onClick={() => currentUser ? addToCart(product) : alert('Please log in to add to cart')}
                                                        className="w-full py-2 bg-white text-dark-900 font-bold rounded-lg hover:bg-gray-100 flex items-center justify-center gap-2"
                                                    >
                                                        Add to Cart
                                                    </button>
                                                </div>
                                            )}
                                            {/* Out of Stock Badge */}
                                            {product.type === 'physical' && product.stock <= 0 && (
                                                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-md z-10">
                                                    Out of Stock
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-bold text-dark-900 dark:text-white mb-2 truncate text-lg pr-2">{product.title}</h3>
                                            <div className="flex justify-between items-center">
                                                <span className="text-dark-900 dark:text-emerald-400 font-mono text-xl font-bold">₹{product.price}</span>
                                                <span className="text-xs text-gray-500 uppercase tracking-wide font-bold bg-gray-100 dark:bg-white/10 px-2 py-1 rounded">{product.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Available Services Section */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <span className="w-1.5 h-8 bg-purple-500 rounded-full"></span>
                            Commission Services
                        </h2>
                        {services.length === 0 ? (
                            <div className="text-gray-500 text-center py-12 glass-card bg-white dark:bg-white/5 border border-light-700 dark:border-white/10">
                                No active services available.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {services.map(service => (
                                    <div key={service._id} className="glass-card bg-white dark:bg-dark-800 p-6 hover:shadow-xl transition-all flex flex-col h-full border border-light-700 dark:border-white/10 rounded-2xl">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-xl font-bold text-dark-900 dark:text-white pr-4">{service.title}</h3>
                                            <span className="bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                                                {service.deliveryTime}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-grow whitespace-pre-line leading-relaxed">{service.description}</p>
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5 mt-auto">
                                            <span className="text-sm text-gray-500 font-medium">Starting Price</span>
                                            <span className="text-xl font-bold text-dark-900 dark:text-emerald-400">₹{service.basePrice}</span>
                                        </div>
                                        <button className="w-full mt-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all font-bold shadow-lg shadow-purple-500/20">
                                            Request Service
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ArtistProfile;
