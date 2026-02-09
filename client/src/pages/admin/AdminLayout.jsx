import { Link, useLocation, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    LogOut,
    MessageSquare,
    Users,
    Briefcase,
    Shield,
    Home,
    FolderTree
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
    const location = useLocation();
    const { logout } = useAuth();

    const sidebarResult = [
        { name: 'Home', icon: Home, path: '/' },
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
        { name: 'Vendors', icon: Shield, path: '/admin/vendors' },
        { name: 'Categories', icon: FolderTree, path: '/admin/categories' },
        { name: 'Products', icon: Package, path: '/admin/products' },
        { name: 'Services', icon: Briefcase, path: '/admin/services' },
        { name: 'Commissions', icon: MessageSquare, path: '/admin/commissions' },
        { name: 'Users', icon: Users, path: '/admin/users' },
    ];

    return (
        <div className="flex h-screen bg-[#0f1014] text-white overflow-hidden font-sans relative">
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse-slow" />
            </div>

            <aside className="w-72 glass-nav border-r border-white/5 h-full flex flex-col hidden md:flex z-20 relative">
                <div className="p-8 border-b border-white/5">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold font-display bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                Admin Panel
                            </h1>
                            <p className="text-xs text-gray-500">Manage Platform</p>
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
                                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-500/5'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white hover:pl-5'
                                    }`}
                            >
                                <item.icon size={20} className={`transition-colors ${isActive ? 'text-amber-400' : 'group-hover:text-white'}`} />
                                <span className="font-medium">{item.name}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
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

            <div className="md:hidden fixed bottom-0 left-0 right-0 glass-nav border-t border-white/5 z-50 px-4 py-3 flex justify-between items-center safe-area-bottom">
                {sidebarResult.slice(0, 5).map((item) => { // Limit items for mobile
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg ${isActive ? 'text-amber-400 bg-amber-500/10' : 'text-gray-500'}`}
                        >
                            <item.icon size={20} />
                        </Link>
                    );
                })}
                <button onClick={logout} className="flex flex-col items-center gap-1 text-red-400 p-2">
                    <LogOut size={20} />
                </button>
            </div>

            <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 scroll-smooth">
                <div className="max-w-7xl mx-auto pb-24 md:pb-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
