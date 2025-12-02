import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { MockDb } from '../services/mockDb';
import { Order, OrderStatus } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Calendar, Clock, CheckCircle, Truck, Loader2, XCircle, ArrowUpDown, FileText, X, ChevronRight, MessageSquareText } from 'lucide-react';

const OrderHistory = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewingPrescription, setViewingPrescription] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchOrders = async () => {
        setLoading(true);
        const userOrders = await MockDb.getOrdersByUserId(user.id);
        setOrders(userOrders);
        setLoading(false);
    };
    fetchOrders();
  }, [user, navigate]);

  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20';
      case OrderStatus.PROCESSING: return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20';
      case OrderStatus.SHIPPED: return 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20';
      case OrderStatus.DELIVERED: return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20';
      case OrderStatus.CANCELLED: return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20';
      default: return 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/20';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return <Clock size={14} />;
      case OrderStatus.PROCESSING: return <Loader2 size={14} className="animate-spin" />;
      case OrderStatus.SHIPPED: return <Truck size={14} />;
      case OrderStatus.DELIVERED: return <CheckCircle size={14} />;
      case OrderStatus.CANCELLED: return <XCircle size={14} />;
      default: return <Package size={14} />;
    }
  };

  const PROGRESS_STEPS = [
    { status: OrderStatus.PENDING, label: 'Placed' },
    { status: OrderStatus.PROCESSING, label: 'Processing' },
    { status: OrderStatus.SHIPPED, label: 'Shipped' },
    { status: OrderStatus.DELIVERED, label: 'Delivered' },
  ];

  const statusList = [
      OrderStatus.PENDING,
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED
  ];

  const getStepState = (currentStatus: OrderStatus, stepStatus: OrderStatus) => {
    if (currentStatus === OrderStatus.CANCELLED) return 'cancelled';
    
    const currentIndex = statusList.indexOf(currentStatus);
    const stepIndex = statusList.indexOf(stepStatus);

    if (currentIndex === -1) return 'pending'; // Fallback

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-GB', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-[50vh]">
              <Loader2 className="animate-spin text-emerald-600" size={32} />
          </div>
      );
  }

  if (orders.length === 0) {
      return (
          <div className="max-w-4xl mx-auto py-12 text-center">
              <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package size={40} className="text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">No orders yet</h2>
              <p className="text-slate-500 mb-8">Looks like you haven't placed any orders yet.</p>
              <Link to="/shop" className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-700 transition">
                  Start Shopping
              </Link>
          </div>
      );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">My Orders</h1>
          <button 
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm"
          >
              <ArrowUpDown size={16} />
              Sort by Date: {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
          </button>
      </div>

      <div className="space-y-6">
          {sortedOrders.map(order => {
              const currentStatusIndex = statusList.indexOf(order.status);
              const progressPercent = currentStatusIndex === -1 ? 0 : (currentStatusIndex / (statusList.length - 1)) * 100;

              return (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  {/* Order Header */}
                  <div className="p-6 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center bg-slate-50/50">
                      <div>
                          <div className="flex items-center gap-3 mb-1">
                              <span className="font-bold text-slate-900">Order #{order.id.slice(-6)}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                                  {getStatusIcon(order.status)}
                                  {order.status}
                              </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Calendar size={14} />
                              <span>Placed on {formatDate(order.date)}</span>
                          </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {(order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) && (
                            <Link 
                                to={`/tracking/${order.id}`}
                                className="flex items-center gap-1.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-full transition shadow-sm"
                            >
                                <Truck size={16} /> Track Package
                            </Link>
                        )}
                        <span className="font-bold text-lg text-slate-900">KSh {order.totalAmount}</span>
                      </div>
                  </div>

                  <div className="p-6 space-y-8">
                      {/* Status Stepper */}
                      {order.status !== OrderStatus.CANCELLED && (
                          <div className="relative px-4">
                              {/* Background Line */}
                              <div className="absolute top-4 left-0 w-full h-1 bg-slate-100 rounded-full -z-10"></div>
                              {/* Progress Line */}
                              <div 
                                className="absolute top-4 left-0 h-1 bg-emerald-500 rounded-full -z-10 transition-all duration-1000"
                                style={{ width: `${progressPercent}%` }}
                              ></div>

                              <div className="flex justify-between relative">
                                  {PROGRESS_STEPS.map((step, idx) => {
                                      const state = getStepState(order.status, step.status);
                                      return (
                                          <div key={idx} className="flex flex-col items-center gap-2">
                                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-500 bg-white ${
                                                  state === 'completed' || state === 'current'
                                                  ? 'border-emerald-500 text-emerald-600'
                                                  : 'border-slate-200 text-slate-300'
                                              }`}>
                                                  {state === 'completed' ? <CheckCircle size={16} className="fill-emerald-100" /> : 
                                                   state === 'current' ? <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" /> :
                                                   <div className="w-2 h-2 bg-slate-200 rounded-full" />
                                                  }
                                              </div>
                                              <span className={`text-xs font-medium ${state === 'pending' ? 'text-slate-400' : 'text-slate-700'}`}>
                                                  {step.label}
                                              </span>
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>
                      )}

                      {/* Order Items */}
                      <div>
                          <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                              <Package size={16} className="text-slate-400"/> Items Purchased
                          </h4>
                          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                              {order.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                      <div className="w-12 h-12 bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
                                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                      </div>
                                      <div className="flex-grow">
                                          <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                              <span>Qty: {item.quantity}</span>
                                              <span className="text-slate-300">×</span>
                                              <span className="text-emerald-600 font-medium">KSh {item.price}</span>
                                          </p>
                                      </div>
                                      <div className="text-right">
                                          <p className="font-bold text-slate-900 text-sm">KSh {item.price * item.quantity}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>

                      {/* Notes & Actions */}
                      <div className="flex flex-col sm:flex-row gap-6 pt-4 border-t border-slate-100">
                           {order.notes && (
                               <div className="flex-grow bg-amber-50 p-4 rounded-xl border border-amber-100">
                                   <h5 className="font-bold text-amber-800 text-xs uppercase mb-2 flex items-center gap-1.5">
                                       <MessageSquareText size={14} /> Delivery Instructions
                                   </h5>
                                   <p className="text-sm text-amber-900 italic">"{order.notes}"</p>
                               </div>
                           )}

                           <div className="flex flex-wrap gap-3 items-start ml-auto">
                               {order.prescriptionImage && (
                                   <button 
                                     onClick={() => setViewingPrescription(order.id)}
                                     className="flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 rounded-lg transition"
                                   >
                                       <FileText size={16} /> View Prescription
                                   </button>
                               )}
                               <Link 
                                 to={`/shop`}
                                 className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-lg transition"
                               >
                                   Buy Again <ChevronRight size={14} />
                               </Link>
                           </div>
                      </div>
                  </div>
              </div>
          )})}
      </div>

      {/* Prescription Modal */}
      {viewingPrescription && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <FileText size={20} className="text-emerald-600" /> Prescription
                      </h3>
                      <button 
                        onClick={() => setViewingPrescription(null)}
                        className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500"
                      >
                          <X size={20} />
                      </button>
                  </div>
                  <div className="p-8 flex flex-col items-center justify-center min-h-[300px] bg-slate-100">
                      <div className="w-full h-48 bg-white border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 mb-4">
                          <FileText size={48} className="opacity-20" />
                          <span className="sr-only">Prescription Image Placeholder</span>
                      </div>
                      <p className="text-sm text-slate-500 text-center">
                          This is a placeholder for the uploaded prescription image for Order #{viewingPrescription.slice(-6)}.
                      </p>
                  </div>
                  <div className="p-4 bg-slate-50 text-center">
                      <button 
                        onClick={() => setViewingPrescription(null)}
                        className="text-emerald-600 font-bold hover:underline"
                      >
                          Close Viewer
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default OrderHistory;