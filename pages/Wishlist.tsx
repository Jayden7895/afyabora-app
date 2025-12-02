import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MockDb } from '../services/mockDb';
import { Product } from '../types';
import { Heart, ShoppingCart, Trash2, ArrowLeft, Package, Loader2 } from 'lucide-react';

const Wishlist = () => {
  const { user, wishlist, toggleWishlist, addToCart } = useApp();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
        navigate('/login');
        return;
    }
    const fetchWishlistProducts = async () => {
        setLoading(true);
        const allProducts = await MockDb.getProducts();
        const wishlistProducts = allProducts.filter(p => wishlist.includes(p.id));
        setProducts(wishlistProducts);
        setLoading(false);
    };
    fetchWishlistProducts();
  }, [user, wishlist, navigate]);

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
          <Heart className="text-rose-500 fill-rose-500" size={32} />
          <h1 className="text-3xl font-bold text-slate-800">My Wishlist</h1>
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-semibold">
              {wishlist.length} items
          </span>
      </div>

      {products.length > 0 && (
        <div className="mb-6">
            <Link to="/shop" className="inline-flex items-center text-emerald-600 hover:underline font-medium">
                <ArrowLeft size={16} className="mr-1" /> Continue Shopping
            </Link>
        </div>
      )}

      {loading ? (
          <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-emerald-600" size={32} />
          </div>
      ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-16 text-center">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-300">
                  <Heart size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Your wishlist is empty</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                  Keep track of medicines and equipment you want to buy later by adding them to your wishlist.
              </p>
              <Link to="/shop" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full transition shadow-lg shadow-emerald-600/20">
                  Browse Products
              </Link>
          </div>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(product => (
                  <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition flex flex-col group">
                      <div className="aspect-square bg-slate-100 relative overflow-hidden">
                           <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                           <button 
                                onClick={() => toggleWishlist(product.id)}
                                className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full text-rose-500 hover:bg-white transition shadow-sm"
                                title="Remove from Wishlist"
                           >
                               <Trash2 size={18} />
                           </button>
                      </div>
                      <div className="p-4 flex-grow flex flex-col">
                          <span className="text-xs text-slate-400 mb-1">{product.category}</span>
                          <Link to={`/product/${product.id}`} className="font-bold text-slate-800 mb-2 hover:text-emerald-600 line-clamp-1">
                              {product.name}
                          </Link>
                          <div className="mt-auto pt-4 flex items-center justify-between">
                              <span className="font-bold text-emerald-700">KSh {product.price}</span>
                              <button 
                                  onClick={() => addToCart(product, 1)}
                                  className="bg-emerald-100 text-emerald-700 p-2 rounded-lg hover:bg-emerald-200 transition"
                                  title="Add to Cart"
                              >
                                  <ShoppingCart size={18} />
                              </button>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default Wishlist;