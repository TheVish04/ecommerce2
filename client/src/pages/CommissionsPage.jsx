import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { Loader2, Calendar, Clock, CheckCircle, XCircle, Package, Send } from 'lucide-react';

const CommissionsPage = () => {
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCommissions = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:3001/api/commissions?role=customer', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCommissions(res.data);
            } catch (error) {
                console.error("Error fetching commissions", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCommissions();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-yellow-500 bg-yellow-500/10';
            case 'accepted': return 'text-blue-500 bg-blue-500/10';
            case 'in_progress': return 'text-purple-500 bg-purple-500/10';
            case 'delivered': return 'text-orange-500 bg-orange-500/10';
            case 'completed': return 'text-green-500 bg-green-500/10';
            case 'rejected': return 'text-red-500 bg-red-500/10';
            case 'cancelled': return 'text-gray-500 bg-gray-500/10';
            default: return 'text-gray-500 bg-gray-500/10';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock size={16} />;
            case 'accepted': return <CheckCircle size={16} />;
            case 'in_progress': return <Loader2 size={16} className="animate-spin" />;
            case 'delivered': return <Package size={16} />;
            case 'completed': return <CheckCircle size={16} />;
            case 'rejected': return <XCircle size={16} />;
            default: return <Clock size={16} />;
        }
    };

    return (
        <div className="bg-light-900 dark:bg-dark-900 min-h-screen text-dark-900 dark:text-white transition-colors duration-300">
            <Navbar />

            <div className="pt-24 pb-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-display mb-2">My Commissions</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track your requests and ongoing projects</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-purple-500" size={40} />
                    </div>
                ) : commissions.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-white/5">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't requested any commissions yet.</p>
                        <a href="/services" className="text-purple-500 hover:text-purple-400 font-semibold">Browse Services</a>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {commissions.map(commission => (
                            <div key={commission._id} className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-purple-500/30 transition-all shadow-sm">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-1">
                                            {commission.service?.title || 'Custom Service'}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span>Artist: <span className="text-purple-500">{commission.vendor?.name}</span></span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {new Date(commission.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 w-fit ${getStatusColor(commission.status)}`}>
                                        {getStatusIcon(commission.status)}
                                        <span className="capitalize">{commission.status.replace('_', ' ')}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                    <div className="md:col-span-2">
                                        <p className="text-gray-500 uppercase text-xs font-bold mb-1">Requirements</p>
                                        <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-dark-900 p-3 rounded-lg border border-gray-100 dark:border-white/5">
                                            {commission.description}
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-gray-500 uppercase text-xs font-bold mb-1">Budget</p>
                                            <p className="text-lg font-bold dark:text-emerald-400">₹{commission.budget}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 uppercase text-xs font-bold mb-1">Deadline</p>
                                            <p className="font-mono">{new Date(commission.deadline).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {commission.deliveryFiles && commission.deliveryFiles.length > 0 && (
                                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5">
                                        <p className="text-gray-500 uppercase text-xs font-bold mb-2">Delivery Files</p>
                                        <div className="flex flex-wrap gap-2">
                                            {commission.deliveryFiles.map((file, idx) => (
                                                <a
                                                    key={idx}
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors border border-blue-200 dark:border-blue-500/20"
                                                >
                                                    <Package size={16} />
                                                    Download File {idx + 1}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommissionsPage;
