import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, CartItem, Product, UserRole } from '../types';
import { MockDb } from '../services/mockDb';

interface AppContextType {
  user: User | null;
  login: (email: string, role: UserRole) => Promise<void>;
  logout: () => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  isLoading: boolean;
  wishlist: string[];
  toggleWishlist: (productId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session and data on load
  useEffect(() => {
    const initApp = async () => {
        const currentUser = MockDb.getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
            try {
                const [serverWishlist, serverCart] = await Promise.all([
                    MockDb.getWishlist(currentUser.id),
                    MockDb.getUserCart(currentUser.id)
                ]);
                setWishlist(serverWishlist);
                setCart(serverCart);
            } catch (e) {
                console.error("Failed to load user data", e);
            }
        } else {
            // Seed DB just in case for demo purposes
            await MockDb.seedDb().catch(() => {});
        }
        setIsLoading(false);
    };
    initApp();
  }, []);

  // Save cart to DB whenever it changes (if user is logged in)
  useEffect(() => {
      if (user && !isLoading) {
          MockDb.saveUserCart(user.id, cart).catch(console.error);
      }
  }, [cart, user, isLoading]);

  const login = async (email: string, role: UserRole) => {
    setIsLoading(true);
    try {
        const newUser = await MockDb.login(email, role);
        
        // Retrieve the user's previously saved cart
        const savedCart = await MockDb.getUserCart(newUser.id);
        const savedWishlist = await MockDb.getWishlist(newUser.id);
        
        // Merge current guest cart with saved cart
        const mergedCart = [...savedCart];
        
        cart.forEach(guestItem => {
            const existingItemIndex = mergedCart.findIndex(i => i.id === guestItem.id);
            if (existingItemIndex > -1) {
                mergedCart[existingItemIndex].quantity += guestItem.quantity;
            } else {
                mergedCart.push(guestItem);
            }
        });

        setUser(newUser);
        setWishlist(savedWishlist);
        setCart(mergedCart); 
    } catch (error) {
        console.error("Login failed", error);
        alert("Could not connect to backend server. Make sure `node server.js` is running.");
    } finally {
        setIsLoading(false);
    }
  };

  const logout = () => {
    MockDb.logout();
    setUser(null);
    setCart([]); // Clear cart locally on logout
    setWishlist([]);
  };

  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = async (productId: string) => {
    if (!user) return; 
    
    // Optimistic update
    const isAdding = !wishlist.includes(productId);
    const newList = isAdding ? [...wishlist, productId] : wishlist.filter(id => id !== productId);
    setWishlist(newList);

    try {
        await MockDb.toggleWishlist(user.id, productId);
    } catch (e) {
        // Revert on error
        setWishlist(wishlist);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <AppContext.Provider value={{
      user,
      login,
      logout,
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      cartTotal,
      isLoading,
      wishlist,
      toggleWishlist
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};