import { Order, Product, ProductCategory, User, UserRole, OrderStatus, CartItem } from '../types';

const API_URL = 'http://localhost:5000/api';
const LS_KEYS = {
  ORDERS: 'afyabora_db_orders',
  USERS: 'afyabora_db_users',
  CARTS: 'afyabora_db_carts',
  WISHLISTS: 'afyabora_db_wishlists',
  USER_SESSION: 'afyabora_user',
  TOKEN: 'afyabora_token'
};

// Initial Fallback Data
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Panadol Extra',
    category: ProductCategory.MEDICINE,
    price: 50,
    description: 'Effective relief from pain and fever. Contains Paracetamol.',
    imageUrl: 'https://picsum.photos/400/400?random=1',
    stock: 100,
    requiresPrescription: false,
    dosage: '2 tablets every 4-6 hours',
    sideEffects: 'Rare skin rash'
  },
  {
    id: 'p2',
    name: 'Omron M2 Basic Blood Pressure Monitor',
    category: ProductCategory.EQUIPMENT,
    price: 4500,
    description: 'Fully automatic upper arm blood pressure monitor. Easy to use.',
    imageUrl: 'https://picsum.photos/400/400?random=2',
    stock: 15,
    requiresPrescription: false,
    manufacturer: 'Omron'
  },
  {
    id: 'p3',
    name: 'Amoxicillin 500mg',
    category: ProductCategory.MEDICINE,
    price: 300,
    description: 'Antibiotic used to treat bacterial infections.',
    imageUrl: 'https://picsum.photos/400/400?random=3',
    stock: 50,
    requiresPrescription: true,
    dosage: '1 capsule every 8 hours',
    sideEffects: 'Nausea, diarrhea'
  },
  {
    id: 'p4',
    name: 'Accu-Chek Active Glucometer',
    category: ProductCategory.DIAGNOSTICS,
    price: 2800,
    description: 'For quantitative determination of blood glucose values.',
    imageUrl: 'https://picsum.photos/400/400?random=4',
    stock: 20,
    requiresPrescription: false
  },
  {
    id: 'p5',
    name: 'Vitamin C 1000mg + Zinc',
    category: ProductCategory.SUPPLEMENTS,
    price: 1200,
    description: 'Immunity booster effervescent tablets.',
    imageUrl: 'https://picsum.photos/400/400?random=5',
    stock: 200,
    requiresPrescription: false
  },
  {
    id: 'p6',
    name: 'Salbutamol Inhaler',
    category: ProductCategory.MEDICINE,
    price: 450,
    description: 'Reliever inhaler for asthma.',
    imageUrl: 'https://picsum.photos/400/400?random=6',
    stock: 30,
    requiresPrescription: true,
    dosage: '2 puffs when needed'
  }
];

// --- Helper Functions ---
const getLocalData = <T>(key: string, defaultVal: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
  } catch {
    return defaultVal;
  }
};

const setLocalData = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const getAuthHeaders = () => {
    const token = localStorage.getItem(LS_KEYS.TOKEN);
    return token 
        ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        : { 'Content-Type': 'application/json' };
};

export const MockDb = {
  getProducts: async (): Promise<Product[]> => {
    try {
        const res = await fetch(`${API_URL}/products`);
        if (!res.ok) throw new Error('Failed to fetch');
        return await res.json();
    } catch (e) {
        console.warn('Backend unavailable, using mock data');
        return INITIAL_PRODUCTS;
    }
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    try {
        const res = await fetch(`${API_URL}/products/${id}`);
        if (!res.ok) throw new Error('Failed to fetch');
        return await res.json();
    } catch (e) {
        return INITIAL_PRODUCTS.find(p => p.id === id);
    }
  },

  addProduct: async (product: Omit<Product, 'id'>): Promise<void> => {
    try {
        const res = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(product)
        });
        if (!res.ok) throw new Error('Failed to add product');
    } catch (e) {
        console.warn('Backend unavailable, mock add');
    }
  },

  updateProduct: async (product: Product): Promise<void> => {
    try {
        const res = await fetch(`${API_URL}/products/${product.id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(product)
        });
        if (!res.ok) throw new Error('Failed to update product');
    } catch (e) {
        console.warn('Backend unavailable, mock update');
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    try {
        const res = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete product');
    } catch (e) {
        console.warn('Backend unavailable, mock delete');
    }
  },

  uploadPrescription: async (file: File): Promise<string> => {
      try {
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch(`${API_URL}/upload`, {
              method: 'POST',
              body: formData
          });
          if (!res.ok) throw new Error('Upload failed');
          const data = await res.json();
          return data.url;
      } catch (e) {
          console.warn('Backend upload failed, using placeholder');
          // Return a fake URL if backend is down
          return URL.createObjectURL(file); 
      }
  },

  initiateMpesaPayment: async (phoneNumber: string, amount: number): Promise<string> => {
      try {
          const res = await fetch(`${API_URL}/mpesa/stkpush`, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify({ phoneNumber, amount })
          });
          if (!res.ok) throw new Error('Payment initiation failed');
          const data = await res.json();
          return data.checkoutRequestId;
      } catch (e) {
          console.warn('Backend payment failed, simulating locally');
          return 'req_' + Date.now();
      }
  },

  checkPaymentStatus: async (requestId: string): Promise<'PENDING' | 'COMPLETED' | 'FAILED'> => {
      try {
          const res = await fetch(`${API_URL}/mpesa/status/${requestId}`, {
              headers: getAuthHeaders()
          });
          if (!res.ok) throw new Error('Status check failed');
          const data = await res.json();
          return data.status;
      } catch (e) {
          // Local fallback simulation
          return 'COMPLETED'; 
      }
  },

  saveOrder: async (order: Order): Promise<void> => {
    try {
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(order)
        });
        if (!res.ok) throw new Error('Failed to save order');
    } catch (e) {
        console.warn('Backend unavailable, saving order locally');
        const orders = getLocalData<Order[]>(LS_KEYS.ORDERS, []);
        orders.push(order);
        setLocalData(LS_KEYS.ORDERS, orders);
    }
  },

  getOrders: async (): Promise<Order[]> => {
    try {
        const res = await fetch(`${API_URL}/admin/orders`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch orders');
        return await res.json();
    } catch (e) {
        return getLocalData<Order[]>(LS_KEYS.ORDERS, []);
    }
  },

  // Get users who are delivery agents
  getDeliveryAgents: async (): Promise<User[]> => {
      try {
          const res = await fetch(`${API_URL}/admin/agents`, {
              headers: getAuthHeaders()
          });
          if (!res.ok) throw new Error('Failed to fetch agents');
          return await res.json();
      } catch (e) {
          const users = getLocalData<User[]>(LS_KEYS.USERS, []);
          const agents = users.filter(u => u.role === UserRole.DELIVERY_AGENT);
          // Return dummy agents if none found in local storage for demo purposes
          if (agents.length === 0) {
              return [
                  { id: 'da1', name: 'John Rider', email: 'john@delivery.com', role: UserRole.DELIVERY_AGENT },
                  { id: 'da2', name: 'Jane Courier', email: 'jane@delivery.com', role: UserRole.DELIVERY_AGENT }
              ];
          }
          return agents;
      }
  },

  assignDeliveryAgent: async (orderId: string, agentId: string): Promise<void> => {
      try {
          const res = await fetch(`${API_URL}/orders/${orderId}/assign`, {
              method: 'PATCH',
              headers: getAuthHeaders(),
              body: JSON.stringify({ agentId })
          });
          if (!res.ok) throw new Error('Failed to assign agent');
      } catch (e) {
          const orders = getLocalData<Order[]>(LS_KEYS.ORDERS, []);
          const updated = orders.map(o => o.id === orderId ? { ...o, deliveryAgentId: agentId } : o);
          setLocalData(LS_KEYS.ORDERS, updated);
      }
  },

  getDeliveryOrders: async (): Promise<Order[]> => {
    try {
        const res = await fetch(`${API_URL}/delivery/orders`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch delivery orders');
        return await res.json();
    } catch (e) {
        // Fallback: return all orders for demo if backend down
        return getLocalData<Order[]>(LS_KEYS.ORDERS, []);
    }
  },

  getOrdersByUserId: async (userId: string): Promise<Order[]> => {
    try {
        const res = await fetch(`${API_URL}/orders/${userId}`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch user orders');
        return await res.json();
    } catch (e) {
        const allOrders = getLocalData<Order[]>(LS_KEYS.ORDERS, []);
        return allOrders.filter(o => o.userId === userId);
    }
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<void> => {
    try {
        // Generalized endpoint for both Admin and Delivery Agent
        const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
        });
        if (!res.ok) throw new Error('Failed to update status');
    } catch (e) {
        const orders = getLocalData<Order[]>(LS_KEYS.ORDERS, []);
        const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
        setLocalData(LS_KEYS.ORDERS, updated);
    }
  },

  login: async (email: string, role: UserRole): Promise<User> => {
    try {
        // Attempt backend login
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, role })
        });
        if (!res.ok) throw new Error('Backend login failed');
        const data = await res.json();
        
        localStorage.setItem(LS_KEYS.USER_SESSION, JSON.stringify(data.user));
        localStorage.setItem(LS_KEYS.TOKEN, data.token); // Save JWT
        
        return data.user;
    } catch (e) {
        console.warn('Backend unavailable, using local mock login');
        // ... (Local fallback logic) ...
        const users = getLocalData<User[]>(LS_KEYS.USERS, []);
        let user = users.find(u => u.email === email);
        if (!user) {
            user = { id: 'u_' + Math.random().toString(36).substr(2, 9), name: email.split('@')[0], email, role };
            users.push(user);
            setLocalData(LS_KEYS.USERS, users);
        } else {
            user.role = role;
            const idx = users.findIndex(u => u.id === user!.id);
            users[idx] = user;
            setLocalData(LS_KEYS.USERS, users);
        }
        localStorage.setItem(LS_KEYS.USER_SESSION, JSON.stringify(user));
        return user;
    }
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(LS_KEYS.USER_SESSION);
    return stored ? JSON.parse(stored) : null;
  },

  logout: () => {
    localStorage.removeItem(LS_KEYS.USER_SESSION);
    localStorage.removeItem(LS_KEYS.TOKEN);
  },

  getWishlist: async (userId: string): Promise<string[]> => {
    try {
        const res = await fetch(`${API_URL}/user/${userId}`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch wishlist');
        const user = await res.json();
        return user.wishlist || [];
    } catch (e) {
        const wishlists = getLocalData<Record<string, string[]>>(LS_KEYS.WISHLISTS, {});
        return wishlists[userId] || [];
    }
  },

  toggleWishlist: async (userId: string, productId: string): Promise<string[]> => {
    try {
        const res = await fetch(`${API_URL}/wishlist/toggle`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ userId, productId })
        });
        if (!res.ok) throw new Error('Failed to toggle wishlist');
        return await res.json();
    } catch (e) {
        const wishlists = getLocalData<Record<string, string[]>>(LS_KEYS.WISHLISTS, {});
        const userList = wishlists[userId] || [];
        const newList = userList.includes(productId) ? userList.filter(id => id !== productId) : [...userList, productId];
        wishlists[userId] = newList;
        setLocalData(LS_KEYS.WISHLISTS, wishlists);
        return newList;
    }
  },

  getUserCart: async (userId: string): Promise<CartItem[]> => {
    try {
        const res = await fetch(`${API_URL}/user/${userId}`, {
             headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch cart');
        const user = await res.json();
        const cartItems = user.cart || [];
        const allProducts = await MockDb.getProducts();
        return cartItems.map((item: any) => {
            const p = allProducts.find(p => p.id === item.productId);
            return p ? { ...p, quantity: item.quantity } : null;
        }).filter(Boolean) as CartItem[];
    } catch (e) {
        const carts = getLocalData<Record<string, CartItem[]>>(LS_KEYS.CARTS, {});
        return carts[userId] || [];
    }
  },

  saveUserCart: async (userId: string, cart: CartItem[]): Promise<void> => {
    try {
        const cartPayload = cart.map(item => ({ productId: item.id, quantity: item.quantity }));
        const res = await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ userId, cart: cartPayload })
        });
        if (!res.ok) throw new Error('Failed to save cart');
    } catch (e) {
        const carts = getLocalData<Record<string, CartItem[]>>(LS_KEYS.CARTS, {});
        carts[userId] = cart;
        setLocalData(LS_KEYS.CARTS, carts);
    }
  },
  
  seedDb: async () => {
    try {
      await fetch(`${API_URL}/seed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: INITIAL_PRODUCTS })
      });
    } catch (e) {}
  }
};