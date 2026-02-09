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
        <div className="flex h-screen bg-[#0f1014] text-white overflow-hidden">
            <aside className="w-64 glass-nav border-r border-white/5 h-full flex flex-col hidden md:flex">
                <div className="p-6 border-b border-white/5">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                        Admin Panel
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {sidebarResult.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                                    ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0f1014]/90 backdrop-blur-lg border-t border-white/5 z-50 px-4 py-3 flex justify-between items-center">
                {sidebarResult.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center gap-1 ${isActive ? 'text-amber-400' : 'text-gray-500'}`}
                        >
                            <item.icon size={20} />
                        </Link>
                    );
                })}
                <button onClick={logout} className="flex flex-col items-center gap-1 text-red-400">
                    <LogOut size={20} />
                </button>
            </div>

            <main className="flex-1 overflow-y-auto p-4 md:p-8 relative pb-24 md:pb-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
