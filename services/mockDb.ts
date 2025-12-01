import { Order, Product, ProductCategory, User, UserRole, OrderStatus } from '../types';

// Initial Mock Data
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

const STORAGE_KEYS = {
  PRODUCTS: 'afyabora_products',
  ORDERS: 'afyabora_orders',
  USER: 'afyabora_user'
};

export const MockDb = {
  getProducts: (): Product[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(stored);
  },

  getProductById: (id: string): Product | undefined => {
    const products = MockDb.getProducts();
    return products.find(p => p.id === id);
  },

  saveOrder: (order: Order): void => {
    const orders = MockDb.getOrders();
    orders.unshift(order); // Add to top
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  getOrders: (): Order[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return stored ? JSON.parse(stored) : [];
  },

  updateOrderStatus: (orderId: string, status: OrderStatus): void => {
    const orders = MockDb.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].status = status;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    }
  },

  login: (email: string, role: UserRole): User => {
    const user: User = {
      id: 'u_' + Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email,
      role
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
};