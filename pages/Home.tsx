import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShieldCheck, Truck, Clock, Sparkles, ArrowRight, ShoppingCart, Heart } from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { MockDb } from '../services/mockDb';
import { CookieService } from '../services/cookieService';
import { useApp } from '../context/AppContext';

const Home = () => {
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [topCategory, setTopCategory] = useState<string | null>(null);
  const { addToCart, wishlist, toggleWishlist, user } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const loadRecommendations = async () => {
        const category = CookieService.getTopCategory();
        if (category) {
            setTopCategory(category);
            const allProducts = await MockDb.getProducts();
            const filtered = allProducts
                .filter(p => p.category === category)
                .sort(() => 0.5 - Math.random())
                .slice(0, 4);
            setRecommendedProducts(filtered);
        }
    };
    loadRecommendations();
  }, []);

  const handleWishlistToggle = (productId: string) => {
    if (!user) {
        navigate('/login');
        return;
    }
    toggleWishlist(productId);
  };

  const features = [
      { icon: ShieldCheck, title: "Genuine Medicine", desc: "100% authentic pharmaceuticals sourced directly from manufacturers." },
      { icon: Truck, title: "Fast Delivery", desc: "Delivery within 2 hours in Nairobi and 24 hours countrywide." },
      { icon: Clock, title: "24/7 Support", desc: "Talk to our qualified pharmacists anytime, day or night." },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="bg-emerald-700 rounded-3xl p-8 md:p-16 text-white relative overflow-hidden shadow-xl mx-auto">
          <div className="relative z-10 max-w-2xl">
              <span className="bg-emerald-600 text-emerald-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                  #1 Online Pharmacy in Kenya
              </span>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  Healthcare at your <br/>
                  <span className="text-emerald-300">fingertips.</span>
              </h1>
              <p className="text-emerald-100 text-lg mb-8 max-w-lg leading-relaxed">
                  Order medicines, medical equipment, and diagnostics online. 
                  Consult with our AI Pharmacist for instant advice.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/shop" className="bg-white text-emerald-800 px-8 py-4 rounded-full font-bold hover:bg-emerald-50 transition shadow-lg flex items-center justify-center gap-2">
                      <ShoppingCart size={20} /> Shop Now
                  </Link>
                  <Link to="/ai-consult" className="bg-emerald-800 text-white px-8 py-4 rounded-full font-bold hover:bg-emerald-900 transition border border-emerald-600 flex items-center justify-center gap-2">
                      <Sparkles size={20} /> AI Consult
                  </Link>
              </div>
          </div>
          
          <div className="absolute top-0 right-0 w-1/2 h-full hidden md:block">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500 rounded-full blur-[100px] opacity-50"></div>
          </div>
      </section>

      {/* Recommended for You Section */}
      {recommendedProducts.length > 0 && (
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-2 mb-8">
                <Sparkles className="text-amber-400 fill-amber-400" size={24} />
                <h2 className="text-2xl font-bold text-slate-800">Recommended for You</h2>
                <span className="text-sm bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-100 font-medium">
                    Because you viewed {topCategory}
                </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendedProducts.map(product => {
                    const isInWishlist = wishlist.includes(product.id);
                    return (
                        <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition flex flex-col group relative">
                            <div className="aspect-square bg-slate-100 relative overflow-hidden">
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                                <button 
                                    onClick={() => handleWishlistToggle(product.id)}
                                    className={`absolute top-2 right-2 p-2 rounded-full transition shadow-sm z-10 ${
                                        isInWishlist 
                                        ? 'bg-rose-50 text-rose-500' 
                                        : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white'
                                    }`}
                                >
                                    <Heart size={18} fill={isInWishlist ? "currentColor" : "none"} />
                                </button>
                            </div>
                            <div className="p-4 flex-grow flex flex-col">
                                <Link to={`/product/${product.id}`} className="font-bold text-slate-800 mb-1 hover:text-emerald-600 line-clamp-1 block">
                                    {product.name}
                                </Link>
                                <span className="text-xs text-slate-400 mb-3 block">{product.category}</span>
                                <div className="mt-auto flex items-center justify-between">
                                    <span className="font-bold text-emerald-700">KSh {product.price}</span>
                                    <button 
                                        onClick={() => addToCart(product, 1)}
                                        className="bg-emerald-50 text-emerald-600 p-2 rounded-lg hover:bg-emerald-600 hover:text-white transition"
                                    >
                                        <ShoppingCart size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-1 transition duration-300">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                      <feature.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed">
                      {feature.desc}
                  </p>
              </div>
          ))}
      </section>

      {/* Categories */}
      <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Shop by Category</h2>
            <Link to="/shop" className="text-emerald-600 font-semibold hover:underline flex items-center gap-1">
                View All <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.values(ProductCategory).map((cat, idx) => (
                  <Link 
                    key={idx} 
                    to={`/shop?category=${cat}`}
                    className="bg-white p-6 rounded-xl border border-slate-100 text-center hover:border-emerald-500 hover:shadow-md transition group"
                  >
                      <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition">
                          <Search size={20} />
                      </div>
                      <span className="font-semibold text-slate-700 group-hover:text-emerald-700">{cat}</span>
                  </Link>
              ))}
          </div>
      </section>
    </div>
  );
};

export default Home;