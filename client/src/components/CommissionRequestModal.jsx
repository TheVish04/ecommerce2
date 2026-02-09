import React, { useState } from 'react';
import { X, Upload, IndianRupee, Calendar } from 'lucide-react';
import Button from './Button';
import { uploadToCloudinary } from '../utils/upload';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const CommissionRequestModal = ({ service, onClose, isOpen }) => {
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState(service?.basePrice || 0);
    const [deadline, setDeadline] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen || !service) return null;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = '';
            if (image) {
                imageUrl = await uploadToCloudinary(image);
            }

            const payload = {
                serviceId: service._id,
                description,
                budget: Number(budget),
                deadline,
                referenceImages: imageUrl ? [imageUrl] : []
            };

            await api.post('/commissions', payload);

            toast.success('Commission request sent successfully!');
            onClose();
        } catch (error) {
            console.error('Request failed', error);
            toast.error(error.response?.data?.message || 'Failed to send request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-lg shadow-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-dark-900 dark:text-white">Request Commission</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Describe your requirements
                        </label>
                        <textarea
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-dark-900 dark:text-white placeholder-gray-400 resize-none h-32"
                            placeholder="I need a character design similar to..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Budget (INR)
                            </label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="number"
                                    required
                                    min={service.basePrice}
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 focus:border-purple-500 outline-none text-dark-900 dark:text-white"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Starting at ₹{service.basePrice}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Deadline
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="date"
                                    required
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 focus:border-purple-500 outline-none text-dark-900 dark:text-white [color-scheme:dark]"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Reference Image (Optional)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl p-6 text-center hover:border-purple-500 transition-colors cursor-pointer relative group">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400 group-hover:text-purple-400 transition-colors">
                                <Upload size={24} />
                                <span className="text-sm">{image ? image.name : "Click to upload reference"}</span>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-purple-500/20 flex justify-center items-center gap-2"
                    >
                        {loading ? 'Sending Request...' : 'Submit Request'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default CommissionRequestModal;
