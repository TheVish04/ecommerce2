import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import {
    Search, ShoppingCart, User, LogOut, Menu, X, Rocket,
    Sun, Moon, Heart, LayoutDashboard, Shield, Download
} from 'lucide-react';
import Button from './Button';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const { cartItems } = useCart();
    const { wishlist } = useWishlist();
    const { theme, toggleTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setSearchQuery(params.get('search') || '');
    }, [location.pathname, location.search]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const q = searchQuery.trim();
        if (q) {
            navigate(`/shop?search=${encodeURIComponent(q)}`);
        } else {
            navigate('/shop');
        }
    };

    const navLinks = [
        { name: 'Explore', path: '/shop' },
        { name: 'Art Products', path: '/shop?category=art' },
        { name: 'Merchandise', path: '/merchandise' },
        { name: 'Services', path: '/services' }, // Or /commissions/browse if we separate
        { name: 'Artists', path: '/artists' },
    ];

    return (
        <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}>
            {/* Top Bar - Glassmorphism */}
            <div className="bg-light-900/90 dark:bg-dark-900/90 backdrop-blur-md border-b border-light-700 dark:border-white/5 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                            <Rocket size={16} fill="currentColor" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-dark-900 to-gray-600 dark:from-white dark:to-gray-400 font-display hidden sm:block">
                            KalaVPP
                        </span>
                    </Link>

                    {/* Search Bar - Center */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:block">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search artworks, services, artists..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-light-800 dark:bg-dark-800 border-none rounded-full py-2 pl-10 pr-4 text-sm text-dark-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                            />
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" />
                        </div>
                    </form>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition-colors"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden p-2 text-gray-600 dark:text-gray-300"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>

                        {/* Desktop Auth Actions */}
                        <div className="hidden md:flex items-center gap-4">
                            {currentUser ? (
                                <>
                                    {currentUser.role === 'admin' && (
                                        <Link to="/admin/dashboard" className="hidden lg:block text-sm font-medium text-amber-500 hover:text-amber-400">
                                            Admin
                                        </Link>
                                    )}
                                    {currentUser.role !== 'admin' && (
                                        <Link to={currentUser.role === 'vendor' ? '/vendor/dashboard' : '/dashboard'} className="hidden lg:block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-500">
                                            Dashboard
                                        </Link>
                                    )}
                                    <Link to="/commissions" className="hidden lg:block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-500">
                                        Commissions
                                    </Link>
                                    <Link to="/orders" className="hidden lg:block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-500">
                                        Orders
                                    </Link>
                                    {currentUser.role === 'customer' && (
                                        <>
                                            <Link to="/downloads" className="hidden lg:block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-purple-500">
                                                Downloads
                                            </Link>
                                            <Link to="/profile" className="hidden lg:block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-500">
                                                Profile
                                            </Link>
                                        </>
                                    )}

                                    <div className="h-6 w-px bg-gray-300 dark:bg-white/10 mx-1"></div>

                                    <Link to="/wishlist" className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-pink-500 transition-colors">
                                        <Heart size={20} className={wishlist.length > 0 ? "fill-pink-500 text-pink-500" : ""} />
                                        {wishlist.length > 0 && (
                                            <span className="absolute top-0 right-0 w-4 h-4 bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                                                {wishlist.length}
                                            </span>
                                        )}
                                    </Link>

                                    <Link to="/cart" className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors">
                                        <ShoppingCart size={20} />
                                        {cartItems.length > 0 && (
                                            <span className="absolute top-0 right-0 w-4 h-4 bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                                                {cartItems.reduce((total, item) => total + item.quantity, 0)}
                                            </span>
                                        )}
                                    </Link>

                                    {/* User Dropdown Preview (Simplification) */}
                                    <div className="flex items-center gap-2 pl-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-[2px]">
                                            <img
                                                src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${currentUser.name}&background=random`}
                                                alt="User"
                                                className="w-full h-full rounded-full object-cover border-2 border-white dark:border-dark-900"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-dark-900 dark:text-white leading-tight">{currentUser?.name?.split(' ')[0] || 'User'}</span>
                                            <button onClick={handleLogout} className="text-[10px] text-gray-500 hover:text-red-400 text-left">Logout</button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-sm font-medium text-dark-900 dark:text-white hover:text-blue-500 transition-colors">
                                        Log In
                                    </Link>
                                    <Link to="/signup">
                                        <Button size="sm" className="bg-dark-900 dark:bg-white text-white dark:text-dark-900 hover:opacity-90">
                                            Sign Up
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar - Categories (Desktop) */}
            <div className="bg-light-800/80 dark:bg-dark-800/80 backdrop-blur-sm border-b border-light-700 dark:border-white/5 hidden md:block transition-colors duration-300 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ul className="flex items-center justify-center gap-8 h-10">
                        <li key="Explore">
                            <Link to="/shop" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:border-b-2 border-transparent hover:border-black dark:hover:border-white transition-all py-2.5 block">Explore</Link>
                        </li>
                        <li key="Art">
                            <Link to="/shop?category=art" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:border-b-2 border-transparent hover:border-black dark:hover:border-white transition-all py-2.5 block">Art Products</Link>
                        </li>

                        {/* Merchandise Mega Menu */}
                        <li key="Merch">
                            <Link to="/merchandise" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:border-b-2 border-transparent hover:border-black dark:hover:border-white transition-all py-2.5 block">Merchandise</Link>
                        </li>

                        <li key="Services">
                            <Link to="/services" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:border-b-2 border-transparent hover:border-black dark:hover:border-white transition-all py-2.5 block">Services</Link>
                        </li>
                        <li key="Artists">
                            <Link to="/artists" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:border-b-2 border-transparent hover:border-black dark:hover:border-white transition-all py-2.5 block">Artists</Link>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-light-900 dark:bg-dark-900 border-b border-gray-200 dark:border-white/5 p-4 flex flex-col gap-4 shadow-xl">
                    <form onSubmit={(e) => { handleSearch(e); setIsOpen(false); }} className="relative">
                        <input
                            type="text"
                            placeholder="Search artworks, services..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-light-800 dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-lg py-2 pl-10 pr-4 text-dark-900 dark:text-white"
                        />
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </form>

                    <nav className="flex flex-col gap-2">
                        {navLinks.map(link => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="border-t border-gray-200 dark:border-white/10 pt-4 flex flex-col gap-3">
                        {currentUser ? (
                            <>
                                {currentUser.role === 'admin' && (
                                    <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-2 text-amber-500" onClick={() => setIsOpen(false)}>
                                        <Shield size={18} /> Admin
                                    </Link>
                                )}
                                {currentUser.role !== 'admin' && (
                                    <Link to={currentUser.role === 'vendor' ? '/vendor/dashboard' : '/dashboard'} className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300" onClick={() => setIsOpen(false)}>
                                        <LayoutDashboard size={18} /> Dashboard
                                    </Link>
                                )}
                                {currentUser.role === 'customer' && (
                                    <>
                                        <Link to="/downloads" className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300" onClick={() => setIsOpen(false)}>
                                            <Download size={18} /> Downloads
                                        </Link>
                                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300" onClick={() => setIsOpen(false)}>
                                            <User size={18} /> Profile
                                        </Link>
                                    </>
                                )}
                                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                                    <LogOut size={18} /> Logout
                                </button>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <Link to="/login" onClick={() => setIsOpen(false)}>
                                    <Button variant="secondary" className="w-full justify-center">Log In</Button>
                                </Link>
                                <Link to="/signup" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full justify-center bg-dark-900 dark:bg-white text-white dark:text-dark-900">Sign Up</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
