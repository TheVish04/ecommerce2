import { Link, useLocation, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Wallet,
    PlusCircle,
    LogOut,
    MessageSquare,
    User,
    Briefcase,
    Home
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const VendorLayout = () => {
    const location = useLocation();
    const { logout } = useAuth();

    const sidebarResult = [
        { name: 'Home', icon: Home, path: '/' },
        { name: 'Dashboard', icon: LayoutDashboard, path: '/vendor/dashboard' },
        { name: 'My Products', icon: Package, path: '/vendor/products' },
        { name: 'Add Product', icon: PlusCircle, path: '/vendor/add-product' },
        { name: 'Services', icon: Briefcase, path: '/vendor/services' },
        { name: 'Commissions', icon: MessageSquare, path: '/vendor/commissions' },
        { name: 'Orders', icon: ShoppingCart, path: '/vendor/orders' },
        { name: 'Payouts', icon: Wallet, path: '/vendor/payouts' },
        { name: 'Profile', icon: User, path: '/vendor/profile' },
    ];

    return (
        <div className="flex h-screen bg-[#0f1014] text-white overflow-hidden font-sans relative">
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse-slow" />
            </div>

            <aside className="w-72 glass-nav border-r border-white/5 h-full flex flex-col hidden md:flex z-20 relative">
                <div className="p-8 border-b border-white/5">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                            <Briefcase size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold font-display bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                                Vendor Panel
                            </h1>
                            <p className="text-xs text-gray-500">Manage Store</p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                    {sidebarResult.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive
                                    ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white hover:pl-5'
                                    }`}
                            >
                                <item.icon size={20} className={`transition-colors ${isActive ? 'text-blue-400' : 'group-hover:text-white'}`} />
                                <span className="font-medium">{item.name}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5 bg-black/20">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all hover:pl-5 group"
                    >
                        <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 glass-nav border-t border-white/5 z-50 px-4 py-3 flex justify-between items-center safe-area-bottom">
                {sidebarResult.slice(0, 5).map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg ${isActive ? 'text-blue-400 bg-blue-500/10' : 'text-gray-500'}`}
                        >
                            <item.icon size={20} />
                        </Link>
                    );
                })}
                <button
                    onClick={logout}
                    className="flex flex-col items-center gap-1 text-red-400 p-2"
                >
                    <LogOut size={20} />
                </button>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 scroll-smooth">
                <div className="max-w-7xl mx-auto pb-24 md:pb-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default VendorLayout;
