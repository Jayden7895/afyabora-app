export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  DELIVERY_AGENT = 'DELIVERY_AGENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export enum ProductCategory {
  MEDICINE = 'Medicine',
  EQUIPMENT = 'Medical Equipment',
  SUPPLEMENTS = 'Supplements',
  DIAGNOSTICS = 'Diagnostics',
  PERSONAL_CARE = 'Personal Care'
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
  imageUrl: string;
  stock: number;
  requiresPrescription: boolean;
  dosage?: string;
  sideEffects?: string;
  manufacturer?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export enum OrderStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  date: string;
  paymentMethod: 'MPESA' | 'CASH';
  shippingAddress: string;
  prescriptionImage?: string; // Base64 or URL
}

export interface InteractionResult {
  hasInteraction: boolean;
  warnings: string[];
  recommendation: string;
}