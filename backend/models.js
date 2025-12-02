const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  id: String,
  name: String,
  category: String,
  price: Number,
  description: String,
  imageUrl: String,
  stock: Number,
  requiresPrescription: Boolean,
  dosage: String,
  sideEffects: String,
  manufacturer: String
});

// Schema for items inside an order (Snapshot of product)
const OrderItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  quantity: Number,
  imageUrl: String,
  category: String
});

// Schema for items in user's cart (Reference only)
const CartItemRefSchema = new mongoose.Schema({
  productId: String,
  quantity: Number
});

const UserSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: { type: String, unique: true },
  role: String,
  phone: String,
  cart: [CartItemRefSchema],
  wishlist: [String] // Array of Product IDs
});

const OrderSchema = new mongoose.Schema({
  id: String,
  userId: String,
  items: [OrderItemSchema], 
  totalAmount: Number,
  status: { type: String, default: 'Pending' },
  date: Date,
  paymentMethod: String,
  shippingAddress: String,
  prescriptionImage: String,
  notes: String,
  deliveryAgentId: String
});

const TransactionSchema = new mongoose.Schema({
  checkoutRequestId: String,
  phoneNumber: String,
  amount: Number,
  status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
  date: { type: Date, default: Date.now }
});

module.exports = {
  Product: mongoose.model('Product', ProductSchema),
  User: mongoose.model('User', UserSchema),
  Order: mongoose.model('Order', OrderSchema),
  Transaction: mongoose.model('Transaction', TransactionSchema)
};