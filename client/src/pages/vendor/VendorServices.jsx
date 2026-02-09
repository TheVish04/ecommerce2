import { useState, useEffect } from 'react';
import { Plus, Edit, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const VendorServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await api.get('/vendor/services');
            setServices(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Loading Services...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">My Services</h2>
                <Link
                    to="/vendor/add-service"
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                    <Plus size={18} />
                    Add Service
                </Link>
            </div>

            {services.length === 0 ? (
                <div className="glass-card p-12 text-center text-gray-400 flex flex-col items-center">
                    <Briefcase size={48} className="mb-4 opacity-50" />
                    <p className="text-lg">No services offered yet.</p>
                    <p className="text-sm">Start accepting commissions today!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <div key={service._id} className="glass-card p-4 hover:border-purple-500/30 transition-all group">
                            <div className="aspect-video bg-gray-800 rounded-lg mb-4 overflow-hidden relative">
                                <img
                                    src={service.coverImage || 'https://via.placeholder.com/300'}
                                    alt={service.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${service.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                                        }`}>
                                        {service.isActive ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{service.title}</h3>
                            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{service.description}</p>
                            <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                <span className="text-xl font-bold text-emerald-400">₹{service.basePrice}</span>
                                <span className="text-xs text-gray-500">{service.deliveryTime}</span>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Link to={`/vendor/edit-service/${service._id}`} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors text-center">
                                    Edit
                                </Link>
                                <button
                                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors"
                                    onClick={async () => {
                                        // Toggle logic same as products
                                        try {
                                            await api.patch(`/vendor/services/${service._id}/toggle`);
                                            setServices(services.map(s =>
                                                s._id === service._id ? { ...s, isActive: !s.isActive } : s
                                            ));
                                        } catch (err) { console.error(err); }
                                    }}
                                >
                                    {service.isActive ? 'Disable' : 'Enable'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VendorServices;
