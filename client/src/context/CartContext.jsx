import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity = 1, options = {}) => {
        // Stock Check
        if (product.type === 'physical' && product.stock <= 0) {
            toast.error('Product is out of stock');
            return;
        }

        setCartItems(prev => {
            // Find if this exact variant exists (Same ID + Same Options)
            const optionsKey = JSON.stringify(options);
            const existingVariant = prev.find(item => item._id === product._id && JSON.stringify(item.selectedOptions || {}) === optionsKey);

            // Calculate total quantity of this product currently in cart (across all variants)
            const currentTotalQuantity = prev
                .filter(item => item._id === product._id)
                .reduce((total, item) => total + item.quantity, 0);

            // Check if adding more exceeds stock
            if (product.type === 'physical' && (currentTotalQuantity + quantity) > product.stock) {
                toast.error(`Only ${product.stock} items available in stock`);
                return prev;
            }

            if (existingVariant) {
                toast.success('Cart updated');
                return prev.map(item =>
                    (item._id === product._id && JSON.stringify(item.selectedOptions || {}) === optionsKey)
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            toast.success('Added to cart');
            const cartItemId = `${product._id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            return [...prev, { ...product, quantity, selectedOptions: options, cartItemId }];
        });
    };

    const removeFromCart = (cartItemId) => {
        setCartItems(prev => prev.filter(item => (item.cartItemId || item._id) !== cartItemId));
    };

    const updateQuantity = (cartItemId, quantity) => {
        if (quantity < 1) return;
        setCartItems(prev => prev.map(item =>
            (item.cartItemId || item._id) === cartItemId ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => setCartItems([]);

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};
