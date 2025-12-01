import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MockDb } from '../services/mockDb';
import { Order, Product, UserRole, OrderStatus } from '../types';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, ShoppingBag, Users, AlertCircle, Check } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!user || user.role !== UserRole.ADMIN) {
        navigate('/login');
        return;
    }
    setOrders(MockDb.getOrders());
    setProducts(MockDb.getProducts());
  }, [user, navigate]);

  const stats = [
      { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'bg-blue-500' },
      { label: 'Products', value: products.length, icon: Package, color: 'bg-emerald-500' },
      { label: 'Low Stock', value: products.filter(p => p.stock < 20).length, icon: AlertCircle, color: 'bg-amber-500' },
      { label: 'Customers', value: 142, icon: Users, color: 'bg-purple-500' } // Mock value
  ];

  // Prepare chart data
  const data = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  const handleStatusUpdate = (orderId: string, status: OrderStatus) => {
      MockDb.updateOrderStatus(orderId, status);
      setOrders(MockDb.getOrders()); // Refresh
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sales Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-lg mb-6">Weekly Sales Overview</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                        <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
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
                          {orders.length === 0 && (
                              <tr>
                                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">No orders yet</td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
    </div>
  );
};

export default AdminDashboard;