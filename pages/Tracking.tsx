import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MockDb } from '../services/mockDb';
import { Order, OrderStatus } from '../types';
import { Truck, MapPin, CheckCircle, ArrowLeft, Package, Clock } from 'lucide-react';

const Tracking = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | undefined>(undefined);

  useEffect(() => {
    const fetchOrder = async () => {
        if (orderId) {
            const allOrders = await MockDb.getOrders();
            const found = allOrders.find(o => o.id === orderId);
            setOrder(found);
        }
    };
    fetchOrder();
  }, [orderId]);

  if (!order) {
    return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center">
            <Loader size={32} className="animate-spin text-emerald-600" />
            <p className="mt-4 text-slate-500">Loading tracking details...</p>
        </div>
    );
  }

  // Simulate tracking events based on order status and date
  const orderDate = new Date(order.date).getTime();
  const events = [
    { 
        time: new Date(orderDate).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' }), 
        status: 'Order Placed', 
        location: 'AfyaBora Online', 
        icon: Package, 
        completed: true,
        description: 'Your order has been received.'
    },
    { 
        time: new Date(orderDate + 3600000).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' }), 
        status: 'Order Processed', 
        location: 'Warehouse', 
        icon: CheckCircle, 
        completed: true,
        description: 'Items have been packed and ready for dispatch.'
    },
  ];

  if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
      events.push({ 
          time: new Date(orderDate + 7200000).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' }), 
          status: 'Picked up by Courier', 
          location: 'Nairobi Distribution Hub', 
          icon: Truck, 
          completed: true,
          description: 'Package is on the way to the sorting facility.'
      });
      events.push({ 
          time: new Date(orderDate + 10800000).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' }), 
          status: 'In Transit', 
          location: 'On the way to ' + order.shippingAddress, 
          icon: MapPin, 
          completed: order.status === OrderStatus.DELIVERED || order.status === OrderStatus.SHIPPED,
          description: 'Rider is currently en route.'
      });
  }

  if (order.status === OrderStatus.DELIVERED) {
       events.push({ 
           time: new Date(orderDate + 14400000).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' }), 
           status: 'Delivered', 
           location: order.shippingAddress, 
           icon: CheckCircle, 
           completed: true,
           description: 'Package delivered successfully.'
       });
  }

  // Reverse events to show newest first
  const displayEvents = [...events].reverse();

  return (
      <div className="max-w-2xl mx-auto py-8">
          <Link to="/orders" className="inline-flex items-center text-slate-500 hover:text-emerald-600 mb-6 transition font-medium">
              <ArrowLeft size={20} className="mr-2"/> Back to Orders
          </Link>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              <div className="bg-emerald-700 p-8 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <Truck size={28} className="text-emerald-200"/> 
                        Tracking Order #{order.id.slice(-6)}
                    </h1>
                    <p className="text-emerald-100 mt-2 opacity-90">
                        Estimated Delivery: {new Date(orderDate + 172800000).toLocaleDateString('en-KE', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  {/* Decorative background pattern */}
                  <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 transform skew-x-12 bg-white"></div>
              </div>

              <div className="p-0">
                   {/* Simulated Map */}
                   <div className="bg-slate-100 h-64 w-full relative group">
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-200/50 backdrop-blur-[1px]">
                            <div className="text-center">
                                <MapPin size={48} className="mx-auto mb-3 text-emerald-600 drop-shadow-md animate-bounce" />
                                <p className="text-slate-600 font-bold">Live Tracking Map</p>
                                <p className="text-xs text-slate-500 mt-1">Simulated View • Nairobi, KE</p>
                            </div>
                        </div>
                        {/* Map Grid Pattern */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                   </div>

                   <div className="p-8">
                       <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                           <Clock size={20} className="text-slate-400" /> Shipment Updates
                       </h3>
                       
                       <div className="relative pl-2">
                           {/* Vertical Line */}
                           <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-slate-100"></div>
                           
                           <div className="space-y-8">
                               {displayEvents.map((event, idx) => (
                                   <div key={idx} className="relative flex gap-6 group">
                                       <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ring-4 ring-white ${event.completed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                           <event.icon size={12} strokeWidth={3} />
                                        </div>
                                        <div className="flex-grow pb-2">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                                                <h4 className={`font-bold text-sm ${idx === 0 ? 'text-emerald-700' : 'text-slate-700'}`}>
                                                    {event.status}
                                                </h4>
                                                <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                                    {event.time}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600">{event.description}</p>
                                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                                <MapPin size={10} /> {event.location}
                                            </p>
                                        </div>
                                   </div>
                               ))}
                           </div>
                       </div>
                   </div>
              </div>
          </div>
      </div>
  )
};

const Loader = ({ size, className }: { size?: number, className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size || 24} 
        height={size || 24} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

export default Tracking;