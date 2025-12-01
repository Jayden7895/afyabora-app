import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Trash2, AlertOctagon, Check } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { ProductCategory } from '../types';

const Cart = () => {
  const { cart, removeFromCart, cartTotal } = useApp();
  const [warnings, setWarnings] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Check for drug interactions when cart changes
    const checkSafety = async () => {
        const medicines = cart
            .filter(item => item.category === ProductCategory.MEDICINE)
            .map(item => item.name);
        
        if (medicines.length >= 2) {
            setChecking(true);
            const result = await GeminiService.checkInteractions(medicines);
            if (result.hasInteraction) {
                setWarnings(result.warnings);
            } else {
                setWarnings([]);
            }
            setChecking(false);
        } else {
            setWarnings([]);
        }
    };

    checkSafety();
  }, [cart]);

  if (cart.length === 0) {
    return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-slate-700 mb-4">Your cart is empty</h2>
            <Link to="/shop" className="text-emerald-600 hover:underline">Continue Shopping</Link>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Items List */}
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart ({cart.length})</h1>
        
        {/* Safety Warning Panel */}
        {checking && (
            <div className="bg-blue-50 p-4 rounded-lg flex gap-3 animate-pulse">
                <div className="h-5 w-5 bg-blue-200 rounded-full"></div>
                <span className="text-blue-800 text-sm">AI Pharmacist is checking for interactions...</span>
            </div>
        )}
        
        {!checking && warnings.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-lg mb-6">
                <h4 className="flex items-center gap-2 font-bold text-rose-800 mb-2">
                    <AlertOctagon size={18} /> Drug Interaction Warning
                </h4>
                <ul className="list-disc list-inside text-sm text-rose-700 space-y-1">
                    {warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
            </div>
        )}

        {cart.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-slate-100" />
                <div className="flex-grow">
                    <h3 className="font-bold text-slate-800">{item.name}</h3>
                    <p className="text-sm text-slate-500">{item.category}</p>
                    <div className="text-emerald-600 font-semibold mt-1">KSh {item.price} x {item.quantity}</div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-lg mb-2">KSh {item.price * item.quantity}</div>
                    <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-rose-500 hover:bg-rose-50 p-2 rounded-full transition"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        ))}
      </div>

      {/* Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 sticky top-24">
            <h3 className="text-lg font-bold mb-6">Order Summary</h3>
            <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>KSh {cartTotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                    <span>Delivery Fee</span>
                    <span>KSh 200</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-xl text-slate-900">
                    <span>Total</span>
                    <span>KSh {cartTotal + 200}</span>
                </div>
            </div>
            <Link 
                to="/checkout"
                className="block w-full bg-emerald-700 text-white text-center font-bold py-4 rounded-xl hover:bg-emerald-800 transition"
            >
                Proceed to Checkout
            </Link>
            <p className="text-xs text-center text-slate-400 mt-4">
                Secure checkout powered by M-Pesa
            </p>
        </div>
      </div>
    </div>
  );
};

export default Cart;