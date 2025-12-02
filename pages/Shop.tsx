import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { MockDb } from '../services/mockDb';
import { GeminiService } from '../services/geminiService';
import { Product, ProductCategory } from '../types';
import { useApp } from '../context/AppContext';
import { Search, Filter, ShoppingCart, Heart, Loader2, Sparkles, X } from 'lucide-react';

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiSearching, setAiSearching] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart, wishlist, toggleWishlist, user } = useApp();
  const navigate = useNavigate();
  
  const categoryFilter = searchParams.get('category');
  const searchQuery = searchParams.get('q') || '';
  
  // Local state for search input to prevent API spam
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            let allProducts = await MockDb.getProducts();
            
            // Filter by Category first
            if (categoryFilter) {
              allProducts = allProducts.filter(p => p.category === categoryFilter);
            }
            
            if (searchQuery) {
              setAiSearching(true);
              
              // Try AI Smart Search
              const matchedIds = await GeminiService.smartSearch(searchQuery, allProducts);
              
              if (matchedIds.length > 0) {
                // If AI found matches, filter and sort by them
                const aiMatches = allProducts.filter(p => matchedIds.includes(p.id));
                // Sort by relevance (order returned by AI)
                aiMatches.sort((a, b) => matchedIds.indexOf(a.id) - matchedIds.indexOf(b.id));
                allProducts = aiMatches;
              } else {
                // Fallback to text search if AI returns nothing
                const q = searchQuery.toLowerCase();
                allProducts = allProducts.filter(p => 
                    p.name.toLowerCase().includes(q) || 
                    p.description.toLowerCase().includes(q)
                );
              }
              setAiSearching(false);
            }

            setProducts(allProducts);
        } catch (e) {
            console.error("Failed to load products");
        } finally {
            setIsLoading(false);
            setAiSearching(false);
        }
    };
    fetchProducts();
  }, [categoryFilter, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setSearchParams(prev => {
          if (localSearch.trim()) {
              prev.set('q', localSearch);
          } else {
              prev.delete('q');
          }
          return prev;
      });
  };

  const clearSearch = () => {
      setLocalSearch('');
      setSearchParams(prev => {
          prev.delete('q');
          return prev;
      });
  };

  const handleWishlistClick = (productId: string) => {
    if (!user) {
        navigate('/login');
        return;
    }
    toggleWishlist(productId);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Filter size={20} /> Filters
            </h3>
            
            <div className="space-y-4">
                <div>
                    <h4 className="font-medium text-sm text-slate-500 mb-2 uppercase">Categories</h4>
                    <div className="space-y-2">
                        <button 
                            onClick={() => setSearchParams({})}
                            className={`block text-sm w-full text-left ${!categoryFilter ? 'font-bold text-emerald-600' : 'text-slate-600'}`}
                        >
                            All Products
                        </button>
                        {Object.values(ProductCategory).map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSearchParams({ category: cat })}
                                className={`block text-sm w-full text-left ${categoryFilter === cat ? 'font-bold text-emerald-600' : 'text-slate-600'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Grid */}
      <div className="flex-grow">
        <form onSubmit={handleSearchSubmit} className="mb-6">
            <div className="relative flex-grow group">
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition ${aiSearching ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {aiSearching ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                </div>
                <input 
                    type="text" 
                    placeholder="Describe symptoms (e.g., 'bad headache') or search products..." 
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                />
                <div className="absolute right-2 top-2 flex items-center gap-1">
                    {localSearch && (
                        <button 
                            type="button" 
                            onClick={clearSearch}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        >
                            <X size={16} />
                        </button>
                    )}
                    <button 
                        type="submit" 
                        className="bg-emerald-100 p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-200 transition"
                        title="AI Smart Search"
                    >
                        <Sparkles size={18} />
                    </button>
                </div>
            </div>
            {searchQuery && (
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                    <Sparkles size={12} className="text-emerald-500" />
                    <span>AI-powered search active for "{searchQuery}"</span>
                </div>
            )}
        </form>

        {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="animate-spin text-emerald-600" size={32} />
                <p className="text-slate-500 animate-pulse">Finding the best matches...</p>
            </div>
        ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl">
                <p className="text-slate-500 text-lg">No products found matching your criteria.</p>
                <button 
                    onClick={clearSearch}
                    className="mt-4 text-emerald-600 font-bold hover:underline"
                >
                    Clear Search
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => {
                    const isInWishlist = wishlist.includes(product.id);
                    return (
                        <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition flex flex-col group relative">
                            <div className="aspect-square bg-slate-100 relative">
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                {product.requiresPrescription && (
                                    <span className="absolute top-2 left-2 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">
                                        Rx Required
                                    </span>
                                )}
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleWishlistClick(product.id);
                                    }}
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
                                <span className="text-xs text-slate-400 mb-1">{product.category}</span>
                                <Link to={`/product/${product.id}`} className="font-bold text-slate-800 text-lg mb-2 hover:text-emerald-600 block">
                                    {product.name}
                                </Link>
                                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                                
                                <div className="mt-auto flex items-center justify-between">
                                    <span className="text-xl font-bold text-slate-900">KSh {product.price}</span>
                                    <button 
                                        onClick={() => addToCart(product, 1)}
                                        className="bg-emerald-100 text-emerald-700 p-2 rounded-lg hover:bg-emerald-600 hover:text-white transition"
                                    >
                                        <ShoppingCart size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
};

export default Shop;