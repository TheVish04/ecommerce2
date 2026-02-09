import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Loader2, User } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const ArtistsPage = () => {
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArtists = async () => {
            try {
                const res = await api.get('/users/artists');
                setArtists(res.data);
            } catch (error) {
                console.error("Error fetching artists", error);
            } finally {
                setLoading(false);
            }
        };

        fetchArtists();
    }, []);

    return (
        <div className="bg-light-900 dark:bg-dark-900 min-h-screen text-dark-900 dark:text-white transition-colors duration-300">
            <Navbar />

            <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 text-center md:text-left">
                    <h1 className="text-3xl font-bold font-display mb-2">Our Artists</h1>
                    <p className="text-gray-500 dark:text-gray-400">Discover the creators behind the art</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-blue-500" size={40} />
                    </div>
                ) : artists.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        No artists found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {artists.map(artist => (
                            <Link key={artist._id} to={`/artist/${artist._id}`} className="group block">
                                <div className="glass-card bg-white dark:bg-dark-800 p-6 rounded-2xl border border-light-700 dark:border-white/10 hover:shadow-xl transition-all flex flex-col items-center text-center h-full relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-white/10 shadow-lg mb-4 relative z-10 bg-gray-200 dark:bg-gray-700">
                                        {artist.vendorProfile?.profileImage ? (
                                            <img src={artist.vendorProfile.profileImage} alt={artist.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <User size={40} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative z-10 w-full">
                                        <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-1 group-hover:text-blue-500 transition-colors truncate">
                                            {artist.vendorProfile?.storeName || artist.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 h-10">
                                            {artist.vendorProfile?.bio || "No bio available."}
                                        </p>

                                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 py-1 px-3 rounded-full inline-block">
                                            View Profile
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArtistsPage;
