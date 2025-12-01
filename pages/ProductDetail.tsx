import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MockDb } from '../services/mockDb';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { ShoppingCart, AlertTriangle, CheckCircle } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useApp();
  const [product, setProduct] = useState<Product | undefined>(undefined);

  useEffect(() => {
    if (id) {
        const p = MockDb.getProductById(id);
        setProduct(p);
    }
  }, [id]);

  if (!product) {
      return <div>Loading...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="bg-slate-50 p-8 flex items-center justify-center">
            <img src={product.imageUrl} alt={product.name} className="max-w-full rounded-xl shadow-lg" />
        </div>
        <div className="p-8 md:p-12 space-y-6">
            <div>
                <span className="text-emerald-600 font-semibold tracking-wide text-sm uppercase">{product.category}</span>
                <h1 className="text-3xl font-bold text-slate-900 mt-2">{product.name}</h1>
                <div className="mt-2 text-2xl font-bold text-emerald-700">KSh {product.price}</div>
            </div>

            <p className="text-slate-600 leading-relaxed">
                {product.description}
            </p>

            {product.requiresPrescription && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                    <AlertTriangle className="text-amber-600 flex-shrink-0" />
                    <div>
                        <h4 className="font-bold text-amber-800">Prescription Required</h4>
                        <p className="text-sm text-amber-700 mt-1">
                            You will need to upload a valid prescription during checkout for this item.
                        </p>
                    </div>
                </div>
            )}

            <div className="space-y-4 pt-4 border-t border-slate-100">
                {product.dosage && (
                    <div className="grid grid-cols-3 gap-4">
                        <span className="font-semibold text-slate-900">Dosage</span>
                        <span className="col-span-2 text-slate-600">{product.dosage}</span>
                    </div>
                )}
                {product.sideEffects && (
                    <div className="grid grid-cols-3 gap-4">
                        <span className="font-semibold text-slate-900">Side Effects</span>
                        <span className="col-span-2 text-slate-600">{product.sideEffects}</span>
                    </div>
                )}
                <div className="grid grid-cols-3 gap-4">
                    <span className="font-semibold text-slate-900">Availability</span>
                    <span className="col-span-2 text-emerald-600 flex items-center gap-1">
                        <CheckCircle size={16} /> In Stock ({product.stock} units)
                    </span>
                </div>
            </div>

            <div className="pt-8">
                <button 
                    onClick={() => {
                        addToCart(product, 1);
                        // Optional feedback toast could go here
                    }}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition"
                >
                    <ShoppingCart size={20} /> Add to Cart
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;