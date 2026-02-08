import { useState, useEffect } from 'react';
import { Loader2, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const AdminServices = () => {
    const [data, setData] = useState({ services: [], pagination: {} });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchServices();
    }, [page]);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/services?page=${page}&limit=20`);
            setData({ services: res.data.services, pagination: res.data.pagination });
        } catch (error) {
            toast.error('Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (service) => {
        try {
            await api.patch(`/admin/services/${service._id}`, { isActive: !service.isActive });
            setData(prev => ({
                ...prev,
                services: prev.services.map(s =>
                    s._id === service._id ? { ...s, isActive: !s.isActive } : s
                )
            }));
            toast.success(service.isActive ? 'Service disabled' : 'Service enabled');
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    if (loading && data.services.length === 0) return <div className="p-8 text-center text-gray-400"><Loader2 className="animate-spin inline" size={40} /></div>;

    const { services, pagination } = data;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Services</h2>

            {services.length === 0 ? (
                <div className="glass-card p-12 text-center text-gray-400">
                    <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No services found.</p>
                </div>
            ) : (
                <>
                    <div className="glass-card overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Cover</th>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Vendor</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Delivery</th>
                                    <th className="px-6 py-4">Active</th>
                                    <th className="px-6 py-4 text-right">Toggle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {services.map((service) => (
                                    <tr key={service._id} className="hover:bg-white/5">
                                        <td className="px-6 py-4">
                                            <div className="w-12 h-12 rounded-lg bg-gray-700 overflow-hidden">
                                                <img src={service.coverImage || ''} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-white max-w-[200px] truncate">{service.title}</td>
                                        <td className="px-6 py-4 text-gray-400">{service.vendor?.name || '-'}</td>
                                        <td className="px-6 py-4 font-mono text-emerald-400">₹{service.basePrice}</td>
                                        <td className="px-6 py-4 text-gray-400">{service.deliveryTime}</td>
                                        <td className="px-6 py-4">{service.isActive ? 'Yes' : 'No'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleToggle(service)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${service.isActive ? 'bg-blue-600' : 'bg-gray-700'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${service.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pagination?.pages > 1 && (
                        <div className="flex justify-center gap-2">
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg bg-white/5 disabled:opacity-50">
                                <ChevronLeft size={20} />
                            </button>
                            <span className="py-2 px-4 text-gray-400">Page {page} of {pagination.pages}</span>
                            <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg bg-white/5 disabled:opacity-50">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminServices;
