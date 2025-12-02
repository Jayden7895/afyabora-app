import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { MockDb } from '../services/mockDb';
import { Order, OrderStatus } from '../types';
import { Truck, MapPin, CheckCircle, Package, Clock, Phone, Loader2 } from 'lucide-react';

const DeliveryDashboard = () => {
  const { user } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await MockDb.getDeliveryOrders();
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch delivery orders", error);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
      if (window.confirm(`Are you sure you want to mark this order as ${newStatus}?`)) {
          await MockDb.updateOrderStatus(orderId, newStatus);
          await fetchOrders();
      }
  };

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-[50vh]">
              <Loader2 className="animate-spin text-emerald-600" size={32} />
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Truck className="text-emerald-600" /> Delivery Agent Portal
            </h1>
            <p className="text-slate-500">Manage your assigned deliveries</p>
          </div>
          <div className="bg-emerald-50 text-emerald-800 px-4 py-2 rounded-lg font-bold">
              {orders.length} Active Tasks
          </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
          {orders.length === 0 ? (
              <div className="bg-white p-12 rounded-xl text-center border border-slate-200">
                  <CheckCircle size={48} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-bold text-slate-700">No Pending Deliveries</h3>
                  <p className="text-slate-500">You're all caught up! Check back later.</p>
              </div>
          ) : (
              orders.map(order => (
                  <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition">
                      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                          <span className="font-bold text-slate-700">Order #{order.id.slice(-6)}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              order.status === OrderStatus.PROCESSING ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                              {order.status}
                          </span>
                      </div>
                      
                      <div className="p-6 grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                              <div className="flex items-start gap-3">
                                  <MapPin className="text-slate-400 mt-1" size={18} />
                                  <div>
                                      <p className="text-xs text-slate-500 uppercase font-bold">Delivery Address</p>
                                      <p className="text-slate-800 font-medium">{order.shippingAddress}</p>
                                  </div>
                              </div>
                              <div className="flex items-start gap-3">
                                  <Phone className="text-slate-400 mt-1" size={18} />
                                  <div>
                                      <p className="text-xs text-slate-500 uppercase font-bold">Contact Info</p>
                                      <p className="text-slate-800 font-medium">Customer (ID: {order.userId.slice(0,5)})</p>
                                  </div>
                              </div>
                              {order.notes && (
                                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-sm text-amber-900">
                                      <span className="font-bold block text-xs uppercase mb-1">Note:</span>
                                      "{order.notes}"
                                  </div>
                              )}
                          </div>

                          <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 pt-4 md:pt-0">
                              <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold mb-2">Order Summary</p>
                                  <div className="flex items-center gap-2 mb-4">
                                      <Package size={16} className="text-slate-400" />
                                      <span className="text-sm text-slate-700">{order.items.length} Items</span>
                                      <span className="text-slate-300">|</span>
                                      <span className="font-bold text-slate-900">KSh {order.totalAmount}</span>
                                  </div>
                              </div>

                              <div className="mt-4">
                                  {order.status === OrderStatus.PROCESSING && (
                                      <button 
                                        onClick={() => handleStatusUpdate(order.id, OrderStatus.SHIPPED)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                                      >
                                          <Truck size={18} /> Mark as Picked Up
                                      </button>
                                  )}
                                  {order.status === OrderStatus.SHIPPED && (
                                      <button 
                                        onClick={() => handleStatusUpdate(order.id, OrderStatus.DELIVERED)}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                                      >
                                          <CheckCircle size={18} /> Confirm Delivery
                                      </button>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>
              ))
          )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;