import React from 'react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { ArrowRight, Layers, Layout, Lock, CheckCircle, Smartphone, PenTool, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon, title, description }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="glass-card bg-white/50 dark:bg-white/5 p-6 flex flex-col items-start gap-4 hover:shadow-2xl transition-all duration-300 border border-light-700 dark:border-white/10"
    >
        <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-dark-900 dark:text-white">
            {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
            {description}
        </p>
    </motion.div>
);

const CategoryCard = ({ title, image, color }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative group overflow-hidden rounded-2xl aspect-[4/5] cursor-pointer shadow-lg"
    >
        <div className={`absolute inset-0 bg-gradient-to-t ${color} to-transparent z-10 opacity-80 group-hover:opacity-90 transition-opacity`} />
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
            <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
            <span className="inline-flex items-center text-sm font-medium text-white/80 group-hover:translate-x-2 transition-transform">
                Explore <ArrowRight size={16} className="ml-2" />
            </span>
        </div>
    </motion.div>
);

const LandingPage = () => {
    return (
        <div className="bg-light-900 dark:bg-dark-900 text-dark-900 dark:text-white min-h-screen transition-colors duration-300">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[90vh] flex items-center">
                {/* Background Blobs - Different for Light/Dark? */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-600/20 rounded-full blur-[120px]" />
                </div>

                <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center lg:text-left z-10"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10 rounded-full border border-blue-200 dark:border-blue-500/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Waitlist Early Access Now Open
                        </div>

                        <h1 className="text-5xl sm:text-7xl font-display font-extrabold tracking-tight mb-8 leading-[1.1]">
                            Original Art. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500">
                                Creative Souls.
                            </span> <br />
                            One Platform.
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                            The premium marketplace to buy unique artworks, commission custom services, and sell your creations to the world.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Button size="lg" className="bg-dark-900 dark:bg-white text-white dark:text-dark-900 hover:opacity-90 shadow-xl shadow-blue-500/20">
                                Explore Artworks
                            </Button>
                            <Button size="lg" variant="outline" className="border-gray-300 dark:border-white/20 text-dark-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10">
                                Start Selling
                            </Button>
                        </div>

                        <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 opacity-70 grayscale hover:grayscale-0 transition-all">
                            {/* Dummy logos */}
                            <span className="text-xl font-bold text-gray-400">ARTSTATION</span>
                            <span className="text-xl font-bold text-gray-400">BEHANCE</span>
                            <span className="text-xl font-bold text-gray-400">DRIBBBLE</span>
                        </div>
                    </motion.div>

                    {/* Right Side Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                        <div className="relative z-10 grid grid-cols-2 gap-4">
                            <div className="space-y-4 pt-12">
                                <img src="https://images.unsplash.com/photo-1579783902614-a3fb39279c0f?auto=format&fit=crop&q=80&w=600" className="rounded-2xl shadow-2xl object-cover h-64 w-full" alt="Art 1" />
                                <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600" className="rounded-2xl shadow-2xl object-cover h-48 w-full" alt="Art 2" />
                            </div>
                            <div className="space-y-4">
                                <img src="https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80&w=600" className="rounded-2xl shadow-2xl object-cover h-48 w-full" alt="Art 3" />
                                <img src="https://images.unsplash.com/photo-1633510006326-0e31899e03d3?auto=format&fit=crop&q=80&w=600" className="rounded-2xl shadow-2xl object-cover h-64 w-full" alt="Art 4" />
                            </div>
                        </div>
                        {/* Decorative Circle */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-dashed border-gray-300 dark:border-white/10 rounded-full animate-spin-slow z-0" />
                    </motion.div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-24 bg-white dark:bg-black/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-dark-900 dark:text-white mb-2">Shop by Category</h2>
                            <p className="text-gray-500 dark:text-gray-400">Curated collections just for you</p>
                        </div>
                        <a href="/shop" className="text-blue-500 font-medium hover:underline hidden sm:block">View All Categories &rarr;</a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <CategoryCard
                            title="Physical Art"
                            image="https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=600"
                            color="from-pink-900"
                        />
                        <CategoryCard
                            title="Digital Assets"
                            image="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=600"
                            color="from-purple-900"
                        />
                        <CategoryCard
                            title="Merchandise"
                            image="https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=600"
                            color="from-blue-900"
                        />
                        <CategoryCard
                            title="Commissions"
                            image="https://images.unsplash.com/photo-1515462277126-2dd0c162007a?auto=format&fit=crop&q=80&w=600"
                            color="from-emerald-900"
                        />
                    </div>
                </div>
            </section>

            {/* How it Works / Features */}
            <section id="features" className="py-24 bg-light-800 dark:bg-dark-800 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4 text-dark-900 dark:text-white">The KalaVPP Experience</h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                            A seamless platform connecting visionaries with creators.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<ShoppingBag size={24} />}
                            title="Shop Unique Finds"
                            description="Discover millions of original designs on high-quality products. From t-shirts to canvas prints."
                        />
                        <FeatureCard
                            icon={<PenTool size={24} />}
                            title="Hire Top Talent"
                            description="Commission custom artwork, logos, and digital services directly from verified professional artists."
                        />
                        <FeatureCard
                            icon={<CheckCircle size={24} />}
                            title="Secure & Reliable"
                            description="Every transaction is protected. We hold payments until you are 100% satisfied with the work."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-dark-900 dark:bg-blue-600 text-white transition-colors duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10 px-6">
                    <h2 className="text-4xl font-bold mb-6">Ready to start your creative journey?</h2>
                    <p className="text-xl text-gray-300 md:mb-10 mb-8 max-w-2xl mx-auto">
                        Join thousands of artists and collectors building the future of digital creativity.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="bg-white text-dark-900 hover:bg-gray-100">
                            Sign Up for Free
                        </Button>
                        <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                            Browse Marketplace
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-light-700 dark:border-white/5 bg-light-900 dark:bg-[#0a0a0c] transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-1">
                        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 mb-4">
                            KalaVPP
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            The premier marketplace for digital and physical art. Connecting creators with collectors worldwide.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-dark-900 dark:text-white mb-4">Marketplace</h4>
                        <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                            <li><a href="#" className="hover:text-blue-500">Physical Art</a></li>
                            <li><a href="#" className="hover:text-blue-500">Digital Assets</a></li>
                            <li><a href="#" className="hover:text-blue-500">Commissions</a></li>
                            <li><a href="#" className="hover:text-blue-500">Merchandise</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-dark-900 dark:text-white mb-4">For Artists</h4>
                        <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                            <li><a href="#" className="hover:text-blue-500">Become a Seller</a></li>
                            <li><a href="#" className="hover:text-blue-500">Artist Dashboard</a></li>
                            <li><a href="#" className="hover:text-blue-500">Seller Handbook</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-dark-900 dark:text-white mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                            <li><a href="#" className="hover:text-blue-500">Help Center</a></li>
                            <li><a href="#" className="hover:text-blue-500">Trust & Safety</a></li>
                            <li><a href="#" className="hover:text-blue-500">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-blue-500">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-light-700 dark:border-white/5 text-center text-gray-400 text-sm">
                    © 2026 KalaVPP Inc. All rights reserved. Made with ❤️ in India.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
