import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { useEffect } from 'react';

const AddService = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        basePrice: '',
        deliveryTime: '3-5 days'
    });
    const [coverImage, setCoverImage] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (isEditMode) {
            fetchServiceDetails();
        }
    }, [id]);

    const fetchServiceDetails = async () => {
        try {
            const { data } = await api.get(`/vendor/services/${id}`);

            setFormData({
                title: data.title || '',
                description: data.description || '',
                basePrice: data.basePrice || '',
                deliveryTime: data.deliveryTime || '3-5 days'
            });

            if (data.coverImage) {
                setPreview(data.coverImage);
            }
        } catch (error) {
            console.error("Error fetching service", error);
            alert("Failed to load service details");
        }
    };


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (coverImage) {
            data.append('coverImage', coverImage);
        }

        try {
            const url = isEditMode ? `/vendor/services/${id}` : '/vendor/services';
            const method = isEditMode ? 'put' : 'post';
            await api.request({
                method,
                url,
                data,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/vendor/services');
        } catch (error) {
            console.error('Error saving service:', error);
            alert('Failed to save service');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">{isEditMode ? 'Edit Service' : 'Create New Service'}</h2>

            <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
                <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-400">Cover Image</label>
                    <div className="flex items-center justify-center w-full">
                        {preview ? (
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden group">
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => { setPreview(null); setCoverImage(null); }}
                                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-10 h-10 text-gray-400 mb-3" />
                                    <p className="text-sm text-gray-500">Upload Cover Image</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} required={!isEditMode} />
                            </label>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Service Title</label>
                    <input
                        type="text"
                        name="title"
                        required
                        className="w-full bg-dark-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="e.g. Custom Digital Portrait"
                        value={formData.title}
                        onChange={handleChange}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Description</label>
                    <textarea
                        name="description"
                        required
                        rows="4"
                        className="w-full bg-dark-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="Describe what you offer..."
                        value={formData.description}
                        onChange={handleChange}
                    ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Base Price (₹ INR)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                            <input
                                type="number"
                                name="basePrice"
                                required
                                min="0"
                                className="w-full bg-dark-800 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                value={formData.basePrice}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Estimated Delivery</label>
                        <input
                            type="text"
                            name="deliveryTime"
                            required
                            className="w-full bg-dark-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="e.g. 5-7 days"
                            value={formData.deliveryTime}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] flex items-center gap-2"
                    >
                        {loading && <Loader2 className="animate-spin" size={20} />}
                        {loading ? 'Processing...' : (isEditMode ? 'Update Service' : 'Create Service')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddService;
