import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import Button from '../components/Button';
import { Link } from 'react-router-dom';
import CommissionRequestModal from '../components/CommissionRequestModal';

const ServicesPage = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await axios.get('http://localhost:3001/api/services');
                setServices(res.data);
            } catch (error) {
                console.error("Error fetching services", error);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    const [selectedService, setSelectedService] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleRequest = (service) => {
        setSelectedService(service);
        setIsModalOpen(true);
    };

    return (
        <div className="bg-light-900 dark:bg-dark-900 min-h-screen text-dark-900 dark:text-white transition-colors duration-300">
            <Navbar />
            <CommissionRequestModal
                service={selectedService}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 text-center md:text-left">
                    <h1 className="text-3xl font-bold font-display mb-2">Commission Services</h1>
                    <p className="text-gray-500 dark:text-gray-400">Hire talented artists for custom work</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-blue-500" size={40} />
                    </div>
                ) : services.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        No services available at the moment.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map(service => (
                            <div key={service._id} className="glass-card bg-white dark:bg-dark-800 p-6 hover:shadow-xl transition-all flex flex-col h-full border border-light-700 dark:border-white/10 rounded-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <div className="w-24 h-24 bg-purple-500 rounded-full blur-2xl"></div>
                                </div>

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <h3 className="text-xl font-bold text-dark-900 dark:text-white pr-4">{service.title}</h3>
                                    <span className="bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                                        {service.deliveryTime}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="font-semibold">By:</span>
                                    <Link to={`/artist/${service.vendor?._id}`} className="text-blue-500 hover:underline">
                                        {service.vendor?.vendorProfile?.storeName || service.vendor?.name || 'Unknown Artist'}
                                    </Link>
                                </div>

                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-grow whitespace-pre-line leading-relaxed line-clamp-4">
                                    {service.description}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5 mt-auto relative z-10">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Starting at</p>
                                        <span className="text-2xl font-bold text-dark-900 dark:text-emerald-400">₹{service.basePrice}</span>
                                    </div>
                                    <Button
                                        onClick={() => handleRequest(service)}
                                        className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20"
                                    >
                                        Request
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServicesPage;
