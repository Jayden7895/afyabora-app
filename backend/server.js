require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { Product, User, Order, Transaction } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/afyabora';
const JWT_SECRET = process.env.JWT_SECRET || 'afyabora_secret_key_123';

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer Setup for File Uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '-'));
    }
});
const upload = multer({ storage: storage });

// JWT Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- Routes ---

// Health Check
app.get('/', (req, res) => {
    res.send('AfyaBora E-Pharmacy API is running');
});

// Seed Data
app.post('/api/seed', async (req, res) => {
  const products = req.body.products;
  // Prevent duplicate seeding if products already exist
  const count = await Product.countDocuments();
  if (count > 0) return res.json({ message: 'Database already seeded' });
  
  await Product.insertMany(products);
  res.json({ message: 'Database seeded successfully' });
});

// Public Product Routes
app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.get('/api/products/:id', async (req, res) => {
  const product = await Product.findOne({ id: req.params.id });
  res.json(product);
});

// Admin Product CRUD
app.post('/api/products', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    try {
        // Check if ID exists, if not generate one
        const productData = req.body;
        if (!productData.id) {
            productData.id = 'p' + Date.now();
        }
        const product = new Product(productData);
        await product.save();
        res.json(product);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/products/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    try {
        const updated = await Product.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    try {
        await Product.findOneAndDelete({ id: req.params.id });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  const { email, role } = req.body;
  
  try {
      let user = await User.findOne({ email });
      
      if (!user) {
        // Register mock user on the fly for demo
        user = new User({
          id: 'u_' + Math.random().toString(36).substr(2, 9),
          name: email.split('@')[0],
          email,
          role,
          cart: [],
          wishlist: []
        });
        await user.save();
      } else {
        // Update role if changed in demo login screen
        if (user.role !== role) {
            user.role = role;
            await user.save();
        }
      }

      // Generate Token
      const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role }, 
          JWT_SECRET, 
          { expiresIn: '24h' }
      );

      res.json({ user, token });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// File Upload
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

// Drug Interaction Rule Engine
app.post('/api/interactions', (req, res) => {
    const { medicines } = req.body;
    const warnings = [];
    const medsLower = medicines.map(m => m.toLowerCase());
    
    // Basic Rules (Demo)
    if (medsLower.some(m => m.includes('aspirin')) && medsLower.some(m => m.includes('warfarin'))) {
        warnings.push('Interaction: Aspirin increases bleeding risk when taken with Warfarin.');
    }
    if (medsLower.some(m => m.includes('sildenafil')) && medsLower.some(m => m.includes('nitrate'))) {
        warnings.push('Critical: Taking Sildenafil with Nitrates can cause a fatal drop in blood pressure.');
    }
    if (medsLower.some(m => m.includes('ibuprofen')) && medsLower.some(m => m.includes('aspirin'))) {
        warnings.push('Interaction: Ibuprofen may reduce the heart-protective effect of low-dose Aspirin.');
    }

    res.json({
        hasInteraction: warnings.length > 0,
        warnings: warnings,
        recommendation: warnings.length > 0 ? "Consult a pharmacist before proceeding." : "No common interactions found."
    });
});

// Protected User Routes
app.get('/api/user/:userId', authenticateToken, async (req, res) => {
    if (req.user.id !== req.params.userId && req.user.role !== 'ADMIN') return res.sendStatus(403);
    const user = await User.findOne({ id: req.params.userId });
    res.json(user || {});
});

app.post('/api/cart', authenticateToken, async (req, res) => {
    const { userId, cart } = req.body;
    if (req.user.id !== userId) return res.sendStatus(403);
    await User.findOneAndUpdate({ id: userId }, { cart }, { upsert: true });
    res.json({ success: true });
});

app.post('/api/wishlist/toggle', authenticateToken, async (req, res) => {
  const { userId, productId } = req.body;
  if (req.user.id !== userId) return res.sendStatus(403);
  
  const user = await User.findOne({ id: userId });
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  if (user.wishlist.includes(productId)) {
    user.wishlist = user.wishlist.filter(id => id !== productId);
  } else {
    user.wishlist.push(productId);
  }
  
  await user.save();
  res.json(user.wishlist);
});

// Protected Order Routes
app.get('/api/orders/:userId', authenticateToken, async (req, res) => {
  if (req.user.id !== req.params.userId && req.user.role !== 'ADMIN') return res.sendStatus(403);
  const orders = await Order.find({ userId: req.params.userId }).sort({ date: -1 });
  res.json(orders);
});

app.post('/api/orders', authenticateToken, async (req, res) => {
  const orderData = req.body;
  if (req.user.id !== orderData.userId) return res.sendStatus(403);
  
  const order = new Order(orderData);
  await order.save();
  res.json(order);
});

// Order Status Update (Shared by Admin and Delivery Agent)
app.patch('/api/orders/:id/status', authenticateToken, async (req, res) => {
    const allowed = req.user.role === 'ADMIN' || req.user.role === 'DELIVERY_AGENT';
    if (!allowed) return res.sendStatus(403);
    
    const { status } = req.body;
    await Order.findOneAndUpdate({ id: req.params.id }, { status });
    res.json({ success: true });
});

// Admin Only Routes
app.get('/api/admin/orders', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    const orders = await Order.find().sort({ date: -1 });
    res.json(orders);
});

app.get('/api/admin/agents', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    const agents = await User.find({ role: 'DELIVERY_AGENT' }, 'id name email phone');
    res.json(agents);
});

app.patch('/api/orders/:id/assign', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    const { agentId } = req.body;
    await Order.findOneAndUpdate({ id: req.params.id }, { deliveryAgentId: agentId });
    res.json({ success: true });
});

// Delivery Agent Routes
app.get('/api/delivery/orders', authenticateToken, async (req, res) => {
    if (req.user.role !== 'DELIVERY_AGENT' && req.user.role !== 'ADMIN') return res.sendStatus(403);
    
    // Only return orders assigned to this agent
    const orders = await Order.find({ 
        deliveryAgentId: req.user.id,
        status: { $in: ['Processing', 'Shipped', 'Delivered'] } 
    }).sort({ date: -1 });
    res.json(orders);
});

// --- M-Pesa Integration Simulation ---
// 1. Initiate STK Push
app.post('/api/mpesa/stkpush', authenticateToken, async (req, res) => {
    const { phoneNumber, amount } = req.body;
    const checkoutRequestId = 'ws_CO_' + Date.now() + Math.random().toString(36).substr(2, 5);

    try {
        // Create pending transaction
        const transaction = new Transaction({
            checkoutRequestId,
            phoneNumber,
            amount,
            status: 'PENDING'
        });
        await transaction.save();

        // Simulate user action (entering PIN) after 5 seconds
        setTimeout(async () => {
            try {
                // In a real app, this would be updated via callback URL
                await Transaction.findOneAndUpdate(
                    { checkoutRequestId },
                    { status: 'COMPLETED' }
                );
                console.log(`Simulated M-Pesa Payment Success for ${checkoutRequestId}`);
            } catch (err) {
                console.error("Error simulating M-Pesa completion", err);
            }
        }, 5000);

        res.json({ 
            success: true, 
            message: 'CustomerMpesaToBusiness STK Push initiated',
            checkoutRequestId 
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 2. Query Payment Status
app.get('/api/mpesa/status/:requestId', authenticateToken, async (req, res) => {
    try {
        const transaction = await Transaction.findOne({ checkoutRequestId: req.params.requestId });
        if (!transaction) return res.status(404).json({ status: 'NOT_FOUND' });
        res.json({ status: transaction.status });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));