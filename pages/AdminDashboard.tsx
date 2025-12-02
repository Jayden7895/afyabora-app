import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MockDb } from '../services/mockDb';
import { Order, Product, UserRole, OrderStatus, ProductCategory, User } from '../types';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';
import { Package, ShoppingBag, Users, AlertCircle, Check, Loader2, TrendingUp, BarChart2, Plus, Edit, Trash2, X, Search, Image as ImageIcon, Truck } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'products'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Product Management State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
      name: '', category: ProductCategory.MEDICINE, price: 0, stock: 0, description: '', imageUrl: '', requiresPrescription: false
  });
  const [productSearch, setProductSearch] = useState('');

  const refreshData = async () => {
      const [o, p, a] = await Promise.all([
          MockDb.getOrders(),
          MockDb.getProducts(),
          MockDb.getDeliveryAgents()
      ]);
      setOrders(o);
      setProducts(p);
      setAgents(a);
  };

  useEffect(() => {
    if (!user || user.role !== UserRole.ADMIN) {
        navigate('/login');
        return;
    }
    const fetchData = async () => {
        setLoading(true);
        await refreshData();
        setLoading(false);
    };
    fetchData();
  }, [user, navigate]);

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
      await MockDb.updateOrderStatus(orderId, status);
      const updated = await MockDb.getOrders();
      setOrders(updated);
  };

  const handleAssignAgent = async (orderId: string, agentId: string) => {
      await MockDb.assignDeliveryAgent(orderId, agentId);
      const updated = await MockDb.getOrders();
      setOrders(updated);
  };

  // Product Actions
  const handleOpenProductModal = (product?: Product) => {
      if (product) {
          setEditingProduct(product);
          setProductForm(product);
      } else {
          setEditingProduct(null);
          setProductForm({
              name: '', category: ProductCategory.MEDICINE, price: 0, stock: 0, description: '', imageUrl: 'https://picsum.photos/400/400', requiresPrescription: false
          });
      }
      setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          if (editingProduct) {
              await MockDb.updateProduct({ ...productForm, id: editingProduct.id } as Product);
          } else {
              await MockDb.addProduct(productForm as Product);
          }
          await refreshData();
          setIsProductModalOpen(false);
      } catch (error) {
          console.error("Failed to save product", error);
          alert("Failed to save product. Please try again.");
      }
  };

  const handleDeleteProduct = async (id: string) => {
      if (window.confirm('Are you sure you want to delete this product?')) {
          await MockDb.deleteProduct(id);
          await refreshData();
      }
  };

  // Derived Data
  const stats = [
      { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'bg-blue-500' },
      { label: 'Products', value: products.length, icon: Package, color: 'bg-emerald-500' },
      { label: 'Low Stock', value: products.filter(p => p.stock < 20).length, icon: AlertCircle, color: 'bg-amber-500' },
      { label: 'Customers', value: 142, icon: Users, color: 'bg-purple-500' }
  ];

  const salesData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  const userGrowthData = [
    { month: 'Jan', users: 65 },
    { month: 'Feb', users: 78 },
    { month: 'Mar', users: 90 },
    { month: 'Apr', users: 105 },
    { month: 'May', users: 125 },
    { month: 'Jun', users: 142 },
  ];

  const topProductsData = [
    { name: 'Panadol Extra', sales: 124 },
    { name: 'Amoxicillin', sales: 98 },
    { name: 'Omron BP Monitor', sales: 45 },
    { name: 'Vitamin C', sales: 86 },
    { name: 'Salbutamol', sales: 32 },
  ];

  if (loading) {
      return (
          <div className="flex items-center justify-center h-[50vh]">
              <Loader2 className="animate-spin text-emerald-600" size={32} />
          </div>
      );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 md:min-h-full">
            <h2 className="text-xl font-bold text-slate-800 mb-6 px-4">Admin Panel</h2>
            <nav className="space-y-2">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                        activeTab === 'overview' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <BarChart2 size={20} /> Overview
                </button>
                <button 
                    onClick={() => setActiveTab('products')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                        activeTab === 'products' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <Package size={20} /> Products
                </button>
            </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow p-4 md:p-8 overflow-x-hidden">
            {activeTab === 'overview' ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
                        <div className="text-sm text-slate-500">Welcome back, {user?.name}</div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                                <div className={`${stat.color} text-white p-3 rounded-lg`}>
                                    <stat.icon size={24} />
                                </div>
                                <div>
                                    <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Analytics Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-slate-800 border-b border-slate-200 pb-2">
                            <TrendingUp size={20} className="text-emerald-600" />
                            <h2 className="text-xl font-bold">Analytics</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                    <BarChart2 size={18} className="text-emerald-500"/> Daily Sales (KES)
                                </h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={salesData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                                            <Tooltip 
                                                cursor={{fill: '#f1f5f9'}} 
                                                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                                                formatter={(value) => [`KSh ${value}`, 'Sales']}
                                            />
                                            <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                    <Users size={18} className="text-blue-500"/> User Growth
                                </h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={userGrowthData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                            <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
                                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                    <Package size={18} className="text-purple-500"/> Top Selling Products
                                </h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={topProductsData} layout="vertical" margin={{ left: 40 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} tick={{fill: '#475569', fontSize: 12, fontWeight: 500}} />
                                            <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none'}} />
                                            <Bar dataKey="sales" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <h3 className="font-bold text-lg mb-6">Recent Orders</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3">Order ID</th>
                                        <th className="px-4 py-3">Customer</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Assigned Agent</th>
                                        <th className="px-4 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {orders.slice(0, 5).map(order => (
                                        <tr key={order.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-emerald-600">#{order.id.slice(-6)}</td>
                                            <td className="px-4 py-3">Guest</td>
                                            <td className="px-4 py-3">KSh {order.totalAmount}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    order.status === OrderStatus.PENDING ? 'bg-amber-100 text-amber-700' :
                                                    order.status === OrderStatus.DELIVERED ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {(order.status === OrderStatus.PROCESSING || order.status === OrderStatus.SHIPPED) ? (
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            className="p-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-500 bg-white"
                                                            value={order.deliveryAgentId || ''}
                                                            onChange={(e) => handleAssignAgent(order.id, e.target.value)}
                                                        >
                                                            <option value="">Select Agent...</option>
                                                            {agents.map(agent => (
                                                                <option key={agent.id} value={agent.id}>{agent.name}</option>
                                                            ))}
                                                        </select>
                                                        {order.deliveryAgentId && (
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500" title="Assigned"></div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {order.status === OrderStatus.PENDING && (
                                                    <button 
                                                        onClick={() => handleStatusUpdate(order.id, OrderStatus.PROCESSING)}
                                                        className="text-emerald-600 hover:text-emerald-800"
                                                        title="Approve"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <h1 className="text-2xl font-bold text-slate-800">Product Management</h1>
                        <button 
                            onClick={() => handleOpenProductModal()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition"
                        >
                            <Plus size={20} /> Add Product
                        </button>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
                        <Search className="text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            className="flex-grow outline-none text-slate-700"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                        />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3">Image</th>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Category</th>
                                        <th className="px-4 py-3">Price</th>
                                        <th className="px-4 py-3">Stock</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).map(product => (
                                        <tr key={product.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded object-cover bg-slate-100" />
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-900">{product.name}</td>
                                            <td className="px-4 py-3 text-slate-500">{product.category}</td>
                                            <td className="px-4 py-3">KSh {product.price}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock < 10 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleOpenProductModal(product)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </main>

        {/* Product Modal */}
        {isProductModalOpen && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="text-xl font-bold text-slate-800">
                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </h3>
                        <button 
                            onClick={() => setIsProductModalOpen(false)}
                            className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    value={productForm.name}
                                    onChange={e => setProductForm({...productForm, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <select 
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    value={productForm.category}
                                    onChange={e => setProductForm({...productForm, category: e.target.value as ProductCategory})}
                                >
                                    {Object.values(ProductCategory).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Price (KSh)</label>
                                <input 
                                    type="number" 
                                    required 
                                    min="0"
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    value={productForm.price}
                                    onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity</label>
                                <input 
                                    type="number" 
                                    required 
                                    min="0"
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    value={productForm.stock}
                                    onChange={e => setProductForm({...productForm, stock: parseInt(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea 
                                required 
                                rows={3}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                value={productForm.description}
                                onChange={e => setProductForm({...productForm, description: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                            <div className="flex gap-2">
                                <input 
                                    type="url" 
                                    required 
                                    className="flex-grow p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    value={productForm.imageUrl}
                                    onChange={e => setProductForm({...productForm, imageUrl: e.target.value})}
                                />
                                <div className="w-10 h-10 bg-slate-100 rounded border border-slate-200 overflow-hidden flex-shrink-0">
                                    {productForm.imageUrl ? (
                                        <img src={productForm.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                    ) : (
                                        <ImageIcon className="w-full h-full p-2 text-slate-400" />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                id="prescription"
                                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                                checked={productForm.requiresPrescription}
                                onChange={e => setProductForm({...productForm, requiresPrescription: e.target.checked})}
                            />
                            <label htmlFor="prescription" className="text-sm text-slate-700 font-medium">Requires Doctor's Prescription</label>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button 
                                type="button"
                                onClick={() => setIsProductModalOpen(false)}
                                className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20"
                            >
                                {editingProduct ? 'Save Changes' : 'Create Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default AdminDashboard;