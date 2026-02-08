import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Upload, X, Check, XCircle, Play, CheckCircle } from 'lucide-react';
import Button from '../../components/Button';
import { uploadToCloudinary } from '../../utils/upload';

const VendorCommissions = () => {
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadingId, setUploadingId] = useState(null);
    const [deliveryFile, setDeliveryFile] = useState(null);

    useEffect(() => {
        const fetchCommissions = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:3001/api/commissions?role=vendor', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Client-side filter to be safe if backend returns all
                // Assuming backend creates commissions with `vendor` field matching current user
                setCommissions(res.data);
            } catch (error) {
                console.error("Fetch error", error);
                toast.error("Failed to load commissions");
            } finally {
                setLoading(false);
            }
        };
        fetchCommissions();
    }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3001/api/commissions/${id}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCommissions(commissions.map(c =>
                c._id === id ? { ...c, status: newStatus } : c
            ));
            toast.success(`Marked as ${newStatus}`);
        } catch (error) {
            console.error("Status update failed", error);
            toast.error("Failed to update status");
        }
    };

    const handleDeliveryUpload = async (id) => {
        if (!deliveryFile) return toast.error("Please select a file");

        const toastId = toast.loading("Uploading delivery...");
        try {
            const url = await uploadToCloudinary(deliveryFile);
            const token = localStorage.getItem('token');

            await axios.put(`http://localhost:3001/api/commissions/${id}/delivery`, {
                deliveryFiles: [{ url, name: deliveryFile.name }]
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state
            setCommissions(commissions.map(c => {
                if (c._id === id) {
                    return {
                        ...c,
                        status: 'delivered',
                        deliveryFiles: [...(c.deliveryFiles || []), { url, name: deliveryFile.name }]
                    };
                }
                return c;
            }));

            toast.success("Delivery uploaded successfully!", { id: toastId });
            setUploadingId(null);
            setDeliveryFile(null);
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("Failed to upload delivery", { id: toastId });
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            pending: 'bg-yellow-500/10 text-yellow-500',
            accepted: 'bg-blue-500/10 text-blue-500',
            rejected: 'bg-red-500/10 text-red-500',
            in_progress: 'bg-purple-500/10 text-purple-500',
            delivered: 'bg-orange-500/10 text-orange-500',
            completed: 'bg-green-500/10 text-green-500',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${colors[status] || 'bg-gray-500/10 text-gray-500'}`}>
                {status.replace('_', ' ')}
            </span>
        );
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Loading Commissions...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Commission Management</h2>

            <div className="bg-dark-800 rounded-xl border border-white/5 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400 text-xs uppercase font-bold">
                        <tr>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Service</th>
                            <th className="px-6 py-4">Budget</th>
                            <th className="px-6 py-4">Deadline</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                        {commissions.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    No commissions found.
                                </td>
                            </tr>
                        ) : (
                            commissions.map(commission => (
                                <tr key={commission._id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{commission.customer?.name}</div>
                                        <div className="text-xs text-gray-500">{commission.customer?.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium">{commission.service?.title}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{commission.description}</div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-emerald-400">₹{commission.budget}</td>
                                    <td className="px-6 py-4">{new Date(commission.deadline).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{getStatusBadge(commission.status)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {commission.status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleStatusUpdate(commission._id, 'accepted')} className="p-1.5 bg-green-500/10 text-green-500 rounded hover:bg-green-500/20" title="Accept">
                                                        <Check size={16} />
                                                    </button>
                                                    <button onClick={() => handleStatusUpdate(commission._id, 'rejected')} className="p-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20" title="Reject">
                                                        <X size={16} />
                                                    </button>
                                                </>
                                            )}
                                            {commission.status === 'accepted' && (
                                                <button onClick={() => handleStatusUpdate(commission._id, 'in_progress')} className="p-1.5 bg-blue-500/10 text-blue-500 rounded hover:bg-blue-500/20 flex items-center gap-1" title="Start Work">
                                                    <Play size={16} /> Start
                                                </button>
                                            )}
                                            {commission.status === 'in_progress' && (
                                                <div className="flex items-center gap-2">
                                                    {uploadingId === commission._id ? (
                                                        <div className="flex items-center gap-1 bg-dark-900 border border-white/10 rounded px-2 py-1">
                                                            <input
                                                                type="file"
                                                                onChange={(e) => setDeliveryFile(e.target.files[0])}
                                                                className="text-xs w-32"
                                                            />
                                                            <button onClick={() => handleDeliveryUpload(commission._id)} className="text-xs bg-purple-600 px-2 py-0.5 rounded text-white">Up</button>
                                                            <button onClick={() => setUploadingId(null)} className="text-xs text-gray-400"><X size={12} /></button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => setUploadingId(commission._id)} className="p-1.5 bg-purple-500/10 text-purple-500 rounded hover:bg-purple-500/20" title="Upload Delivery">
                                                            <Upload size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            {['delivered', 'in_progress'].includes(commission.status) && (
                                                <button onClick={() => handleStatusUpdate(commission._id, 'completed')} className="p-1.5 bg-green-500/10 text-green-500 rounded hover:bg-green-500/20" title="Mark Completed">
                                                    <CheckCircle size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VendorCommissions;
