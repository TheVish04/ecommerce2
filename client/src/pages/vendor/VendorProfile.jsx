import { useState, useEffect } from 'react';
import { Upload, Save, Loader2, User, Mail, Globe, Instagram, Twitter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const VendorProfile = () => {
    const { currentUser, login } = useAuth(); // login to update context if needed
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        storeName: '',
        bio: '',
        instagram: '',
        twitter: '',
        portfolio: ''
    });

    const [profileImage, setProfileImage] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        // Fetch fresh profile data
        const fetchProfile = async () => {
            try {
                const res = await api.get('/auth/me');
                const user = res.data;
                const vp = user.vendorProfile || {};
                const sl = vp.socialLinks || {};

                setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    storeName: vp.storeName || '',
                    bio: vp.bio || '',
                    instagram: sl.instagram || '',
                    twitter: sl.twitter || '',
                    portfolio: sl.portfolio || ''
                });

                if (vp.profileImage) {
                    setPreview(vp.profileImage);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setInitialLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('storeName', formData.storeName);
        data.append('bio', formData.bio);
        data.append('socialLinks[instagram]', formData.instagram);
        data.append('socialLinks[twitter]', formData.twitter);
        data.append('socialLinks[portfolio]', formData.portfolio);

        if (profileImage) {
            data.append('profileImage', profileImage);
        }

        try {
            const res = await api.put('/vendor/profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Should update auth context with new user data if possible
            // Re-login logic is complex without full re-auth, but we can assume success
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <div className="p-8 text-center text-gray-400">Loading Profile...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold text-white">Edit Vendor Profile</h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Basic Info */}
                <div className="md:col-span-1 space-y-6">
                    <div className="glass-card p-6 text-center space-y-4">
                        <div className="relative mx-auto w-32 h-32 rounded-full overflow-hidden border-2 border-white/10 group">
                            {preview ? (
                                <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                    <User size={48} className="text-gray-500" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <label className="cursor-pointer text-white text-xs font-semibold flex flex-col items-center">
                                    <Upload size={20} className="mb-1" />
                                    Change Photo
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                        </div>
                        <div>
                            <p className="text-white font-medium">{formData.name}</p>
                            <p className="text-sm text-gray-500">{formData.email}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Edit Form */}
                <div className="md:col-span-2 space-y-6">
                    <div className="glass-card p-8 space-y-6">
                        <h3 className="text-lg font-semibold text-white border-b border-white/5 pb-4">Public Info</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-dark-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Store / Artist Name</label>
                                <input
                                    type="text"
                                    name="storeName"
                                    value={formData.storeName}
                                    onChange={handleChange}
                                    placeholder="e.g. Pixel Art Studio"
                                    className="w-full bg-dark-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Bio / About Me</label>
                            <textarea
                                name="bio"
                                rows="4"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Tell us about yourself..."
                                className="w-full bg-dark-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            ></textarea>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Email Address</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full bg-dark-900/50 border border-white/5 rounded-lg pl-10 pr-4 py-3 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-8 space-y-6">
                        <h3 className="text-lg font-semibold text-white border-b border-white/5 pb-4">Social Links</h3>

                        <div className="space-y-4">
                            <div className="relative">
                                <Instagram size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500" />
                                <input
                                    type="text"
                                    name="instagram"
                                    value={formData.instagram}
                                    onChange={handleChange}
                                    placeholder="Instagram Username or URL"
                                    className="w-full bg-dark-800 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>
                            <div className="relative">
                                <Twitter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
                                <input
                                    type="text"
                                    name="twitter"
                                    value={formData.twitter}
                                    onChange={handleChange}
                                    placeholder="Twitter Username or URL"
                                    className="w-full bg-dark-800 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>
                            <div className="relative">
                                <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" />
                                <input
                                    type="text"
                                    name="portfolio"
                                    value={formData.portfolio}
                                    onChange={handleChange}
                                    placeholder="Portfolio / Website URL"
                                    className="w-full bg-dark-800 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] flex items-center gap-2"
                        >
                            {loading && <Loader2 className="animate-spin" size={20} />}
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default VendorProfile;
