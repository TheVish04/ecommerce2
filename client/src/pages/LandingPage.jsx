import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import {
    ArrowRight, Layers, Layout, Lock, CheckCircle, Smartphone,
    PenTool, ShoppingBag, Star, TrendingUp, Zap, Globe, Shield
} from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

// --- Reusable Components ---

const SectionHeading = ({ children, subtitle, align = "center" }) => (
    <div className={`mb-16 ${align === "center" ? "text-center" : "text-left"} relative z-10`}>
        {subtitle && (
            <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block py-1 px-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold tracking-wider uppercase mb-4"
            >
                {subtitle}
            </motion.span>
        )}
        <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-bold text-dark-900 dark:text-white mb-6 leading-tight"
        >
            {children}
        </motion.h2>
        <div className={`h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full ${align === "center" ? "mx-auto" : ""}`} />
    </div>
);

const GlassCard = ({ children, className = "", hoverEffect = true }) => (
    <motion.div
        whileHover={hoverEffect ? { y: -10, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" } : {}}
        className={`
            relative overflow-hidden rounded-3xl 
            bg-white/70 dark:bg-white/5 
            backdrop-blur-xl border border-white/20 dark:border-white/10
            shadow-xl shadow-black/5 dark:shadow-black/20
            transition-all duration-500
            ${className}
        `}
    >
        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none transform -translate-x-full hover:translate-x-full" />
        {children}
    </motion.div>
);

const FeatureCard = ({ icon, title, description, delay = 0 }) => (
    <GlassCard className="p-8 h-full flex flex-col items-start gap-6 group hover:bg-white/80 dark:hover:bg-white/10">
        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-500 ring-1 ring-black/5 dark:ring-white/10">
            {icon}
        </div>
        <div>
            <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-3 group-hover:text-blue-500 transition-colors">
                {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                {description}
            </p>
        </div>
    </GlassCard>
);

const CategoryCard = ({ title, image, count, delay = 0, onClick }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        whileHover={{ y: -8 }}
        onClick={onClick}
        className={`group relative overflow-hidden rounded-3xl aspect-[3/4] ${onClick ? 'cursor-pointer' : ''}`}
    >
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent z-10 opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

        {/* Image with Parallax-like Zoom */}
        <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Content */}
        <div className="absolute bottom-0 left-0 p-8 z-20 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 block opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                {count} items
            </span>
            <h3 className="text-3xl font-bold text-white mb-2">{title}</h3>
            <div className="h-1 w-0 group-hover:w-full bg-blue-500 transition-all duration-500 rounded-full" />
            <div className="mt-4 flex items-center text-white/80 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                Explore Collection <ArrowRight size={16} className="ml-2" />
            </div>
        </div>
    </motion.div>
);

const ProductCard = ({ title, price, image, artist, onClick }) => (
    <GlassCard className="p-4 group">
        <div className="relative aspect-square rounded-2xl overflow-hidden mb-4">
            <img
                src={image}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10">
                {price}
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                <Button size="sm" className="bg-white text-dark-900 hover:bg-gray-100 rounded-full" onClick={onClick}>View</Button>
            </div>
        </div>
        <h3 className="text-lg font-bold text-dark-900 dark:text-white truncate">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">by {artist}</p>
    </GlassCard>
);

const TestimonialCard = ({ quote, author, role, avatar }) => (
    <GlassCard className="p-8 min-w-[320px] md:min-w-[400px] snap-center">
        <div className="flex gap-1 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={16} className="fill-amber-400 text-amber-400" />
            ))}
        </div>
        <p className="text-lg text-dark-900 dark:text-gray-200 italic mb-8 leading-relaxed">"{quote}"</p>
        <div className="flex items-center gap-4">
            <img src={avatar} alt={author} className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-white/10" />
            <div>
                <h4 className="font-bold text-dark-900 dark:text-white">{author}</h4>
                <p className="text-xs text-blue-500 font-bold uppercase tracking-wide">{role}</p>
            </div>
        </div>
    </GlassCard>
);

// --- Main Page Component ---

const LandingPage = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
    const navigate = useNavigate();

    return (
        <div ref={containerRef} className="bg-light-900 dark:bg-dark-900 min-h-screen overflow-x-hidden selection:bg-blue-500/30 selection:text-blue-500 transition-colors duration-300">
            <Navbar />

            {/* --- Hero Section --- */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
                {/* Dynamic Background */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-dark-900 to-dark-900 opacity-50 dark:opacity-100" />

                    {/* Animated Blobs */}
                    <motion.div
                        animate={{
                            x: [0, 100, 0],
                            y: [0, -50, 0],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen"
                    />
                    <motion.div
                        animate={{
                            x: [0, -100, 0],
                            y: [0, 100, 0],
                            scale: [1, 1.5, 1]
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
                        className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen"
                    />
                </div>

                <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center z-10 w-full">
                    <div className="text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-lg shadow-black/5">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <span className="text-sm font-medium bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                    Now Live: Creator Marketplace 2.0
                                </span>
                            </div>

                            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-display font-extrabold tracking-tight mb-8 leading-[1.05] text-dark-900 dark:text-white">
                                Art Beyond <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-gradient-x">
                                    Boundaries.
                                </span>
                            </h1>

                            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
                                The premium ecosystem for digital creators. Buy unique assets, commission masterpieces, and sell your vision to the world.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                                <Button
                                    size="lg"
                                    className="bg-white dark:text-dark-900 text-dark-900 hover:scale-105 transition-transform shadow-xl shadow-blue-500/10"
                                    onClick={() => navigate('/shop')}
                                >
                                    Explore Marketplace
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-gray-300 dark:border-white/20 hover:scale-105 transition-transform backdrop-blur-sm"
                                    onClick={() => navigate('/signup')}
                                >
                                    Start Selling
                                </Button>
                            </div>

                            <div className="mt-12 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-light-900 dark:border-dark-900 bg-gray-300 overflow-hidden">
                                            <img src={`https://ui-avatars.com/api/?name=${i}&background=random`} alt="User" />
                                        </div>
                                    ))}
                                </div>
                                <p><span className="font-bold text-dark-900 dark:text-white">10k+</span> creators joined this week</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Floating Hero Visuals */}
                    <div className="relative hidden lg:block h-[600px] w-full perspective-1000">
                        <motion.div
                            style={{ y }}
                            className="relative w-full h-full"
                        >
                            {/* Glass Card 1 - Main */}
                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-[10%] left-[10%] w-[70%] z-20 cursor-pointer"
                                onClick={() => navigate('/shop')}
                            >
                                <GlassCard className="p-2 !rounded-[2rem] shadow-2xl shadow-blue-900/20">
                                    <div className="aspect-[4/3] rounded-[1.5rem] overflow-hidden">
                                        <img src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Digital Art" />
                                    </div>
                                    <div className="p-4 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-dark-900 dark:text-white">Cyber Abstract #88</h3>
                                            <p className="text-sm text-gray-500">@neon_dreamer</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400">Current Bid</p>
                                            <p className="font-bold text-blue-500">2.4 ETH</p>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>

                            {/* Glass Card 2 - Floating Detail */}
                            <motion.div
                                animate={{ y: [0, 30, 0], x: [0, -10, 0] }}
                                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute top-[50%] right-[0%] w-[45%] z-30"
                            >
                                <GlassCard className="p-4 !rounded-2xl bg-white/90 dark:bg-dark-800/90 backdrop-blur-xl border border-white/20 shadow-2xl">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-purple-500/20 rounded-xl text-purple-500">
                                            <TrendingUp size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-dark-900 dark:text-white">Trending</h4>
                                            <p className="text-xs text-green-500">+124% this week</p>
                                        </div>
                                    </div>
                                    <div className="h-16 flex items-end gap-1">
                                        {[40, 70, 50, 90, 60, 80, 95].map((h, i) => (
                                            <div key={i} className="flex-1 bg-gradient-to-t from-purple-500 to-indigo-500 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${h}%` }} />
                                        ))}
                                    </div>
                                </GlassCard>
                            </motion.div>

                            {/* Background Elements */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-dashed border-white/5 rounded-full animate-spin-slow pointer-events-none opacity-20" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- Featured Categories (Horizontal Scroll on Mobile) --- */}
            <section className="py-24 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <SectionHeading subtitle="Curated Collections">Browse by Category</SectionHeading>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <CategoryCard
                            title="Fine Art"
                            count="2.4k"
                            image="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=600"
                            delay={0}
                            onClick={() => navigate('/shop')}
                        />
                        <CategoryCard
                            title="3D Models"
                            count="850"
                            image="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600"
                            delay={0.1}
                            onClick={() => navigate('/shop')}
                        />
                        <CategoryCard
                            title="Merchandise"
                            count="5k+"
                            image="https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=600"
                            delay={0.2}
                            onClick={() => navigate('/merchandise')}
                        />
                        <CategoryCard
                            title="Commissions"
                            count="Active"
                            image="https://images.unsplash.com/photo-1515462277126-2dd0c162007a?auto=format&fit=crop&q=80&w=600"
                            delay={0.3}
                            onClick={() => navigate('/services')}
                        />
                    </div>
                </div>
            </section>

            {/* --- Featured Products (Glass Grid) --- */}
            <section className="py-24 bg-light-800/50 dark:bg-black/20 backdrop-blur-sm relative border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-end mb-12">
                        <div className="max-w-xl">
                            <motion.span className="text-blue-500 font-bold uppercase tracking-wider text-sm mb-2 block">Weekly Highlights</motion.span>
                            <h2 className="text-4xl font-display font-bold text-dark-900 dark:text-white">Featured Artworks</h2>
                        </div>
                        <Button
                            variant="outline"
                            className="hidden sm:flex border-gray-300 dark:border-white/20"
                            onClick={() => navigate('/shop')}
                        >
                            View All
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { title: "Neon Genesis", price: "$120", artist: "Alex Doe", image: "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?auto=format&fit=crop&q=80&w=400" },
                            { title: "Abstract Flow", price: "$85", artist: "Sarah Smith", image: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=400" },
                            { title: "Cyber Skull", price: "$200", artist: "Ronin", image: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=80&w=400" },
                            { title: "Ethereal Landscape", price: "$350", artist: "Davinci AI", image: "https://images.unsplash.com/photo-1618172193763-c511deb635ca?auto=format&fit=crop&q=80&w=400" },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <ProductCard {...item} onClick={() => navigate('/shop')} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Why Choose Us (Features) --- */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <SectionHeading subtitle="The KalaVPP Advantage">Why Creators Choose Us</SectionHeading>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Shield size={32} />}
                            title="Secure IP Protection"
                            description="We use advanced watermarking and blockchain-backed verification to ensure your art remains yours until sold."
                        />
                        <FeatureCard
                            icon={<Zap size={32} />}
                            title="Instant Payouts"
                            description="No more waiting months. Get paid instantly when you make a sale or complete a commission."
                        />
                        <FeatureCard
                            icon={<Globe size={32} />}
                            title="Global Reach"
                            description="Your profile is automatically translated and optimized for collectors in over 140 countries."
                        />
                    </div>
                </div>
            </section>

            {/* --- Testimonials --- */}
            <section className="py-24 bg-white dark:bg-[#050505] overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 mb-16">
                    <SectionHeading subtitle="Community Love">Trusted by 50,000+ Artists</SectionHeading>
                </div>

                {/* Marquee Effect */}
                <div className="relative w-full">
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white dark:from-[#050505] to-transparent z-10" />
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white dark:from-[#050505] to-transparent z-10" />

                    <div className="flex gap-8 animate-scroll whitespace-nowrap px-8">
                        {[
                            { q: "The best platform for selling digital art. Period.", a: "Jessica M.", r: "3D Artist" },
                            { q: "I doubled my commission income in just two months.", a: "David K.", r: "Illustrator" },
                            { q: "Finally, a marketplace that respects artist rights.", a: "Elena R.", r: "Fine Artist" },
                            { q: "The interface is beautiful and so easy to use.", a: "Mark T.", r: "Collector" },
                            { q: "Customer support is actually helpful here!", a: "Sarah L.", r: "Digital Painter" },
                            // Duplicates for seamless scroll
                            { q: "The best platform for selling digital art. Period.", a: "Jessica M.", r: "3D Artist" },
                            { q: "I doubled my commission income in just two months.", a: "David K.", r: "Illustrator" },
                            { q: "Finally, a marketplace that respects artist rights.", a: "Elena R.", r: "Fine Artist" },
                            { q: "The interface is beautiful and so easy to use.", a: "Mark T.", r: "Collector" },
                            { q: "Customer support is actually helpful here!", a: "Sarah L.", r: "Digital Painter" },
                        ].map((t, i) => (
                            <TestimonialCard
                                key={i}
                                quote={t.q}
                                author={t.a}
                                role={t.r}
                                avatar={`https://ui-avatars.com/api/?name=${t.a}&background=random`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* --- CTA Section --- */}
            <section className="py-32 relative overflow-hidden flex items-center justify-center">
                {/* Aurora Background */}
                <div className="absolute inset-0 bg-dark-900">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/80 z-10" />
                    <div className="absolute -top-[50%] -left-[20%] w-[150%] h-[150%] bg-gradient-to-br from-blue-600/30 via-purple-600/30 to-pink-600/30 blur-[100px] animate-pulse-slow" />
                </div>

                <div className="relative z-20 max-w-4xl mx-auto text-center px-6">
                    <h2 className="text-5xl md:text-7xl font-display font-bold text-white mb-8 tracking-tight">
                        Create. Collect. <br /> Connect.
                    </h2>
                    <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                        Join the fastest growing community of digital artists and collectors. Your journey starts today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Button
                            size="lg"
                            className="bg-white text-dark-900 hover:bg-gray-100 min-w-[200px] text-lg font-bold shadow-2xl shadow-white/20"
                            onClick={() => navigate('/signup')}
                        >
                            Join for Free
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-white/30 text-white hover:bg-white/10 min-w-[200px] text-lg backdrop-blur-md"
                            onClick={() => navigate('/shop')}
                        >
                            Browse Gallery
                        </Button>
                    </div>
                </div>
            </section>

            {/* --- Footer --- */}
            <footer className="pt-24 pb-12 bg-light-900 dark:bg-[#020202] border-t border-light-700 dark:border-white/5 font-sans relative z-10">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
                    <div className="col-span-2 lg:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <Layout size={20} />
                            </div>
                            <span className="text-2xl font-bold text-dark-900 dark:text-white font-display">KalaVPP</span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs mb-8">
                            A next-generation marketplace empowering creators through technology, community, and fair value.
                        </p>
                        <div className="flex gap-4">
                            {['twitter', 'instagram', 'linkedin', 'github'].map(social => (
                                <a key={social} href="#" className="w-10 h-10 rounded-full bg-light-800 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-blue-500 transition-all">
                                    <span className="sr-only">{social}</span>
                                    <Globe size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-dark-900 dark:text-white mb-6">Marketplace</h4>
                        <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
                            <li><Link to="/shop" className="hover:text-blue-500 transition-colors">Digital Art</Link></li>
                            <li><Link to="/shop" className="hover:text-blue-500 transition-colors">Photography</Link></li>
                            <li><Link to="/shop" className="hover:text-blue-500 transition-colors">Music & Audio</Link></li>
                            <li><Link to="/merchandise" className="hover:text-blue-500 transition-colors">Collectibles</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-dark-900 dark:text-white mb-6">Company</h4>
                        <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
                            <li><Link to="/" className="hover:text-blue-500 transition-colors">About Us</Link></li>
                            <li><Link to="/" className="hover:text-blue-500 transition-colors">Careers</Link></li>
                            <li><Link to="/" className="hover:text-blue-500 transition-colors">Support</Link></li>
                            <li><Link to="/" className="hover:text-blue-500 transition-colors">Press Kit</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-dark-900 dark:text-white mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
                            <li><Link to="/" className="hover:text-blue-500 transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/" className="hover:text-blue-500 transition-colors">Terms of Service</Link></li>
                            <li><Link to="/" className="hover:text-blue-500 transition-colors">Copyright</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-light-700 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-600">
                    <p>© 2026 KalaVPP Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <span>Made with design by Antigravity</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
