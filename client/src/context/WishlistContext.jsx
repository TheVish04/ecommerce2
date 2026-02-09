import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]); // Array of product IDs
    const [loading, setLoading] = useState(false);
    const { currentUser } = useAuth();

    // Fetch wishlist IDs on load
    useEffect(() => {
        if (currentUser) {
            fetchWishlist();
        } else {
            setWishlist([]);
        }
    }, [currentUser]);

    const fetchWishlist = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/wishlist', {
                withCredentials: true
            });
            // Extract just the IDs for easy checking
            if (res.data && res.data.products) {
                // Determine if populated or just IDs. Backend populates, so we map.
                setWishlist(res.data.products.map(p => p._id || p));
            }
        } catch (error) {
            console.error("Error fetching wishlist", error);
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.includes(productId);
    };

    const toggleWishlist = async (productId) => {
        if (!currentUser) {
            toast.error("Please login to use wishlist");
            return;
        }

        try {
            // Optimistic update
            const isAdded = !isInWishlist(productId);
            setWishlist(prev =>
                isAdded ? [...prev, productId] : prev.filter(id => id !== productId)
            );

            await axios.post(`http://localhost:3001/api/wishlist/${productId}`, {}, {
                withCredentials: true
            });

            toast.success(isAdded ? "Added to Wishlist" : "Removed from Wishlist");
        } catch (error) {
            // Revert on error
            console.error("Error toggling wishlist", error);
            fetchWishlist(); // Re-sync
            toast.error("Failed to update wishlist");
        }
    };

    const value = {
        wishlist,
        loading,
        isInWishlist,
        toggleWishlist,
        fetchWishlist
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};
