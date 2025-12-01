import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Truck, Clock } from 'lucide-react';
import { ProductCategory } from '../types';

const Home = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-emerald-900 text-white py-20 px-8 flex items-center">
        <div className="absolute inset-0 opacity-20">
            <img src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80" alt="Pharmacy" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-6">
          <span className="bg-emerald-500/30 text-emerald-100 px-4 py-1 rounded-full text-sm font-semibold backdrop-blur-sm border border-emerald-500/30">
            #1 E-Pharmacy in Kenya
          </span>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Healthcare at Your Fingertips
          </h1>
          <p className="text-lg text-emerald-100">
            Order authentic medicines, supplements, and medical equipment. Delivered to your doorstep in Nairobi and across Kenya.
          </p>
          <div className="flex gap-4 pt-4">
            <Link to="/shop" className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-full font-bold transition shadow-lg shadow-emerald-900/50">
              Shop Now
            </Link>
            <Link to="/ai-consult" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-3 rounded-full font-bold transition border border-white/30">
              Ask Pharmacist
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
            { icon: ShieldCheck, title: "Authentic Products", desc: "100% Genuine Medicines" },
            { icon: Truck, title: "Fast Delivery", desc: "Same day in Nairobi" },
            { icon: Search, title: "Smart Search", desc: "Find drugs easily" },
            { icon: Clock, title: "24/7 Support", desc: "Always here for you" }
        ].map((f, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition">
                <f.icon className="h-12 w-12 text-emerald-600 mb-4" />
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm">{f.desc}</p>
            </div>
        ))}
      </section>

      {/* Categories */}
      <section>
        <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold text-slate-800">Shop by Category</h2>
            <Link to="/shop" className="text-emerald-600 font-semibold hover:underline">View All</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.values(ProductCategory).map((cat) => (
                <Link to={`/shop?category=${cat}`} key={cat} className="group bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:border-emerald-500 transition text-center">
                    <div className="h-24 bg-slate-100 rounded-lg mb-4 group-hover:bg-emerald-50 transition flex items-center justify-center">
                         {/* Placeholder for category icon/image */}
                         <span className="text-2xl">💊</span>
                    </div>
                    <h3 className="font-medium text-slate-700 group-hover:text-emerald-700">{cat}</h3>
                </Link>
            ))}
        </div>
      </section>
    </div>
  );
};

export default Home;