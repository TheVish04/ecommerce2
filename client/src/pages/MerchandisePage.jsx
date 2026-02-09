import React from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { Shirt, Coffee, Stamp, ShoppingBag, Smartphone, Frame } from 'lucide-react';

const categories = [
    { title: 'T-Shirts', icon: <Shirt size={40} />, path: '/merchandise/t-shirts', color: 'from-orange-400 to-red-500', desc: "Wear your art." },
    { title: 'Tote Bags', icon: <ShoppingBag size={40} />, path: '/shop?subCategory=Tote Bags', color: 'from-blue-400 to-indigo-500', desc: "Carry creativity." },
    { title: 'Mugs', icon: <Coffee size={40} />, path: '/shop?subCategory=Mugs', color: 'from-green-400 to-emerald-500', desc: "Sip in style." },
    { title: 'Phone Covers', icon: <Smartphone size={40} />, path: '/shop?subCategory=Phone Covers', color: 'from-purple-400 to-pink-500', desc: "Protect with art." },
    { title: 'Stickers', icon: <Stamp size={40} />, path: '/shop?subCategory=Stickers', color: 'from-yellow-400 to-orange-500', desc: "Stick everywhere." },
    { title: 'Home Décor', icon: <Frame size={40} />, path: '/shop?subCategory=Home Decor', color: 'from-teal-400 to-cyan-500', desc: "Transform your space." },
];

const MerchandisePage = () => {
    return (
        <div className="bg-light-900 dark:bg-dark-900 min-h-screen text-dark-900 dark:text-white transition-colors duration-300">
            <Navbar />

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20 pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold tracking-wider mb-4 animate-fade-in-up">
                        NEW ARRIVALS
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-dark-900 via-purple-800 to-dark-900 dark:from-white dark:via-purple-200 dark:to-white mb-6 animate-fade-in-up delay-100">
                        Art You Can Wear & Use
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200">
                        Discover unique merchandise designed by independent artists. From classic tees to custom home decor.
                    </p>
                    <Link to="/shop?category=merch" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-dark-900 dark:bg-white dark:text-dark-900 rounded-full hover:scale-105 hover:shadow-xl transition-all duration-300 animate-fade-in-up delay-300">
                        Shop All Merchandise
                    </Link>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <h2 className="text-3xl font-bold mb-12 text-center font-display">Shop by Category</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.map((cat, idx) => (
                        <Link
                            key={cat.title}
                            to={cat.path}
                            className="group relative overflow-hidden rounded-3xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-transparent transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                        >
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${cat.color} transition-opacity duration-500`} />

                            <div className="p-8 flex flex-col items-center text-center h-full relative z-10">
                                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${cat.color} text-white flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                    {cat.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-colors">
                                    {cat.title}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 group-hover:text-dark-900 dark:group-hover:text-white transition-colors">
                                    {cat.desc}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MerchandisePage;
