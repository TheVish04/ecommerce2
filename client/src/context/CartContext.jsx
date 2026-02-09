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
            const optionsKey = JSON.stringify(options);
            const existingVariant = prev.find(item => item.itemType === 'product' && item._id === product._id && JSON.stringify(item.selectedOptions || {}) === optionsKey);

            const currentTotalQuantity = prev
                .filter(item => item.itemType === 'product' && item._id === product._id)
                .reduce((total, item) => total + item.quantity, 0);

            if (product.type === 'physical' && (currentTotalQuantity + quantity) > product.stock) {
                toast.error(`Only ${product.stock} items available in stock`);
                return prev;
            }

            if (existingVariant) {
                toast.success('Cart updated');
                return prev.map(item =>
                    (item.itemType === 'product' && item._id === product._id && JSON.stringify(item.selectedOptions || {}) === optionsKey)
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            toast.success('Added to cart');
            const cartItemId = `product-${product._id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            return [...prev, { ...product, itemType: 'product', quantity, selectedOptions: options, cartItemId }];
        });
    };

    const addServiceToCart = (service, customizations = '', scheduledDate = null) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.itemType === 'service' && item._id === service._id && item.customizations === customizations);
            if (existing) {
                toast.success('Service already in cart');
                return prev;
            }
            toast.success('Service added to cart');
            const cartItemId = `service-${service._id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            return [...prev, {
                ...service,
                itemType: 'service',
                quantity: 1,
                price: service.basePrice,
                images: service.coverImage ? [service.coverImage] : [],
                customizations: customizations || undefined,
                scheduledDate: scheduledDate || undefined,
                cartItemId
            }];
        });
    };

    const removeFromCart = (cartItemId) => {
        setCartItems(prev => prev.filter(item => (item.cartItemId || item._id) !== cartItemId));
    };

    const updateQuantity = (cartItemId, quantity) => {
        if (quantity < 1) return;
        setCartItems(prev => prev.map(item => {
            if ((item.cartItemId || item._id) !== cartItemId) return item;
            if (item.itemType === 'service') return item;
            return { ...item, quantity };
        }));
    };

    const clearCart = () => setCartItems([]);

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = item.price ?? item.basePrice ?? 0;
            const qty = item.quantity ?? 1;
            return total + (price * qty);
        }, 0);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            addServiceToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};
