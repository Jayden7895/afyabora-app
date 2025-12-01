import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MockDb } from '../services/mockDb';
import { Product, ProductCategory } from '../types';
import { useApp } from '../context/AppContext';
import { Search, Filter, Plus } from 'lucide-react';

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useApp();
  
  const categoryFilter = searchParams.get('category');
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    let allProducts = MockDb.getProducts();
    
    if (categoryFilter) {
      allProducts = allProducts.filter(p => p.category === categoryFilter);
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      allProducts = allProducts.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }

    setProducts(allProducts);
  }, [categoryFilter, searchQuery]);

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
        <div className="mb-6 flex gap-4">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Search medicines, equipment..." 
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={searchQuery}
                    onChange={(e) => setSearchParams(prev => {
                        prev.set('q', e.target.value);
                        return prev;
                    })}
                />
            </div>
        </div>

        {products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl">
                <p className="text-slate-500 text-lg">No products found matching your criteria.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition flex flex-col">
                        <div className="aspect-square bg-slate-100 relative">
                             <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                             {product.requiresPrescription && (
                                 <span className="absolute top-2 right-2 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">
                                     Rx Required
                                 </span>
                             )}
                        </div>
                        <div className="p-4 flex-grow flex flex-col">
                            <span className="text-xs text-slate-400 mb-1">{product.category}</span>
                            <Link to={`/product/${product.id}`} className="font-bold text-slate-800 text-lg mb-2 hover:text-emerald-600">
                                {product.name}
                            </Link>
                            <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-grow">
                                {product.description}
                            </p>
                            <div className="flex items-center justify-between mt-auto">
                                <span className="font-bold text-emerald-700 text-xl">KSh {product.price}</span>
                                <button 
                                    onClick={() => addToCart(product, 1)}
                                    className="bg-emerald-100 text-emerald-700 p-2 rounded-lg hover:bg-emerald-200 transition"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Shop;