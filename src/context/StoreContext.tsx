import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, QuoteItem, Product } from '../types';

interface StoreContextType {
  cart: CartItem[];
  wishlist: string[]; // product IDs
  quotes: QuoteItem[];
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  addToQuote: (product: Product, quantity?: number) => void;
  removeFromQuote: (productId: string) => void;
  updateQuoteQuantity: (productId: string, quantity: number) => void;
  updateQuoteNotes: (productId: string, notes: string) => void;
  clearQuote: () => void;
  cartTotal: number;
  cartCount: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Initialize cart from localStorage with defensive parsing
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('di_cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item && (item.productId || item.product?.id) && item.product);
      }
      return [];
    } catch {
      return [];
    }
  });

  // Initialize wishlist from localStorage
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('di_wishlist');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Initialize quotes from localStorage
  const [quotes, setQuotes] = useState<QuoteItem[]>(() => {
    try {
      const saved = localStorage.getItem('di_quotes');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem('di_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Persist wishlist
  useEffect(() => {
    try {
      localStorage.setItem('di_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage', e);
    }
  }, [wishlist]);

  // Persist quotes
  useEffect(() => {
    try {
      localStorage.setItem('di_quotes', JSON.stringify(quotes));
    } catch (e) {
      console.error('Failed to save quotes to localStorage', e);
    }
  }, [quotes]);

  const openCartDrawer = () => setIsCartDrawerOpen(true);
  const closeCartDrawer = () => setIsCartDrawerOpen(false);

  // Add Item to Cart
  const addToCart = (product: Product, quantity = 1) => {
    if (!product) return;
    const targetId = String(product.id || '');
    if (!targetId) return;

    const validQty = Math.max(1, Math.floor(Number(quantity) || 1));

    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => String(item.productId || item.product?.id) === targetId
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        const existingItem = updated[existingIndex];
        updated[existingIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + validQty,
          product: { ...existingItem.product, ...product } // Refresh product payload
        };
        return updated;
      }

      return [...prev, { productId: targetId, product, quantity: validQty }];
    });

    // Open cart drawer immediately for visual confirmation
    setIsCartDrawerOpen(true);
  };

  // Remove Item from Cart
  const removeFromCart = (productId: string) => {
    const targetId = String(productId || '');
    setCart(prev => prev.filter(item => String(item.productId || item.product?.id) !== targetId));
  };

  // Update Cart Quantity
  const updateCartQuantity = (productId: string, quantity: number) => {
    const targetId = String(productId || '');
    const validQty = Math.floor(Number(quantity));

    if (isNaN(validQty) || validQty <= 0) {
      removeFromCart(targetId);
      return;
    }

    setCart(prev =>
      prev.map(item =>
        String(item.productId || item.product?.id) === targetId
          ? { ...item, quantity: validQty }
          : item
      )
    );
  };

  // Clear Cart
  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem('di_cart');
    } catch (e) {
      console.error('Failed to clear cart in localStorage', e);
    }
  };

  // Wishlist Logic
  const toggleWishlist = (productId: string) => {
    const targetId = String(productId || '');
    if (!targetId) return;
    setWishlist(prev => 
      prev.includes(targetId) 
        ? prev.filter(id => id !== targetId) 
        : [...prev, targetId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(String(productId || ''));

  // Quote Logic
  const addToQuote = (product: Product, quantity = 1) => {
    if (!product) return;
    const targetId = String(product.id || '');
    if (!targetId) return;

    const validQty = Math.max(1, Math.floor(Number(quantity) || 1));

    setQuotes(prev => {
      const existing = prev.find(item => String(item.productId || item.product?.id) === targetId);
      if (existing) {
        return prev.map(item => 
          String(item.productId || item.product?.id) === targetId
            ? { ...item, quantity: item.quantity + validQty, product: { ...item.product, ...product } }
            : item
        );
      }
      return [...prev, { productId: targetId, product, quantity: validQty }];
    });
  };

  const removeFromQuote = (productId: string) => {
    const targetId = String(productId || '');
    setQuotes(prev => prev.filter(item => String(item.productId || item.product?.id) !== targetId));
  };

  const updateQuoteQuantity = (productId: string, quantity: number) => {
    const targetId = String(productId || '');
    const validQty = Math.floor(Number(quantity));
    if (isNaN(validQty) || validQty <= 0) {
      removeFromQuote(targetId);
      return;
    }
    setQuotes(prev => prev.map(item => 
      String(item.productId || item.product?.id) === targetId ? { ...item, quantity: validQty } : item
    ));
  };

  const updateQuoteNotes = (productId: string, notes: string) => {
    const targetId = String(productId || '');
    setQuotes(prev => prev.map(item => 
      String(item.productId || item.product?.id) === targetId ? { ...item, notes } : item
    ));
  };

  const clearQuote = () => setQuotes([]);

  // Calculated Cart Aggregates
  const cartCount = cart.reduce((acc, item) => {
    const qty = typeof item?.quantity === 'number' && item.quantity > 0 ? item.quantity : 1;
    return acc + qty;
  }, 0);

  const cartTotal = cart.reduce((acc, item) => {
    if (!item || !item.product) return acc;
    const rawPrice = item.product.price;
    const price = typeof rawPrice === 'number' ? rawPrice : (parseFloat(rawPrice as any) || 0);
    const qty = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1;
    return acc + (price * qty);
  }, 0);

  return (
    <StoreContext.Provider value={{
      cart, wishlist, quotes,
      isCartDrawerOpen, setIsCartDrawerOpen, openCartDrawer, closeCartDrawer,
      addToCart, removeFromCart, updateCartQuantity, clearCart,
      toggleWishlist, isInWishlist,
      addToQuote, removeFromQuote, updateQuoteQuantity, updateQuoteNotes, clearQuote,
      cartTotal, cartCount
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};


