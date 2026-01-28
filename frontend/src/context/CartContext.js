import React, { createContext, useState, useContext, useEffect } from 'react';

const InquiryContext = createContext();

export const useInquiry = () => useContext(InquiryContext);

export const InquiryProvider = ({ children }) => {
    const [inquiryItems, setInquiryItems] = useState(() => {
        // Persist inquiry list in local storage
        const saved = localStorage.getItem('inquiryList');
        return saved ? JSON.parse(saved) : [];
    });

    const [isInquiryOpen, setIsInquiryOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('inquiryList', JSON.stringify(inquiryItems));
    }, [inquiryItems]);

    // Multi-select toggle logic
    const toggleItem = (product) => {
        setInquiryItems(prevItems => {
            const exists = prevItems.find(item => item._id === product._id);
            if (exists) {
                return prevItems.filter(item => item._id !== product._id);
            }
            return [...prevItems, product];
        });
        // Optionally auto-open or just show notification (keeping silent for multi-select flow)
    };

    const removeItem = (productId) => {
        setInquiryItems(prevItems => prevItems.filter(item => item._id !== productId));
    };

    const clearInquiry = () => setInquiryItems([]);

    const toggleInquiryDrawer = () => setIsInquiryOpen(!isInquiryOpen);

    const inquiryCount = inquiryItems.length;

    // Helper to check if item is selected
    const isSelected = (productId) => inquiryItems.some(item => item._id === productId);

    return (
        <InquiryContext.Provider value={{
            inquiryItems,
            isInquiryOpen,
            toggleItem,
            removeItem,
            clearInquiry,
            toggleInquiryDrawer,
            inquiryCount,
            isSelected,
            setIsInquiryOpen
        }}>
            {children}
        </InquiryContext.Provider>
    );
};
// Backward compatibility exports if needed, but better to update consumers
export const CartProvider = InquiryProvider;
export const useCart = () => {
    const context = useInquiry();
    return {
        ...context,
        cart: context.inquiryItems,
        isCartOpen: context.isInquiryOpen,
        addToCart: context.toggleItem, // Map addToCart to toggle
        removeFromCart: context.removeItem,
        clearCart: context.clearInquiry,
        toggleCart: context.toggleInquiryDrawer,
        cartCount: context.inquiryCount,
        cartTotal: 0 // No price
    };
};
