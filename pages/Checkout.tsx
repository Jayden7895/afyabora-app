import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MockDb } from '../services/mockDb';
import { Order, OrderStatus } from '../types';
import { CreditCard, Upload, CheckCircle, Loader2 } from 'lucide-react';

const Checkout = () => {
  const { cart, cartTotal, clearCart, user } = useApp();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const needsPrescription = cart.some(item => item.requiresPrescription);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate M-Pesa STK Push delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Create Order
    const newOrder: Order = {
        id: `ord_${Math.random().toString(36).substr(2, 9)}`,
        userId: user?.id || 'guest',
        items: cart,
        totalAmount: cartTotal + 200,
        status: OrderStatus.PENDING,
        date: new Date().toISOString(),
        paymentMethod: 'MPESA',
        shippingAddress: address,
        prescriptionImage: prescriptionFile ? 'simulated_url_to_image' : undefined
    };

    MockDb.saveOrder(newOrder);
    clearCart();
    setIsProcessing(false);
    setStep(3); // Success
  };

  if (cart.length === 0 && step !== 3) {
      navigate('/shop');
      return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 flex justify-center items-center gap-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
          <div className="w-12 h-1 bg-slate-200">
              <div className={`h-full bg-emerald-600 transition-all ${step >= 2 ? 'w-full' : 'w-0'}`}></div>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
          <div className="w-12 h-1 bg-slate-200">
              <div className={`h-full bg-emerald-600 transition-all ${step >= 3 ? 'w-full' : 'w-0'}`}></div>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>3</div>
      </div>

      {step === 1 && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">Delivery Details</h2>
              
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">M-Pesa Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="07XXXXXXXX" 
                    className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                  <p className="text-xs text-slate-500 mt-1">We'll send an M-Pesa STK push to this number.</p>
              </div>

              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Address</label>
                  <textarea 
                    rows={3}
                    placeholder="Street, Building, Apartment No..." 
                    className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
              </div>

              {needsPrescription && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                      <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                          <Upload size={18} /> Prescription Upload Required
                      </h4>
                      <p className="text-sm text-amber-700 mb-4">
                          One or more items in your cart require a doctor's prescription.
                      </p>
                      <input 
                        type="file" 
                        accept="image/*,.pdf"
                        onChange={(e) => setPrescriptionFile(e.target.files ? e.target.files[0] : null)}
                        className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-amber-100 file:text-amber-700
                        hover:file:bg-amber-200
                      "/>
                  </div>
              )}

              <button 
                disabled={!address || !phone || (needsPrescription && !prescriptionFile)}
                onClick={() => setStep(2)}
                className="w-full bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition"
              >
                Continue to Payment
              </button>
          </div>
      )}

      {step === 2 && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-8 text-center">
              <h2 className="text-2xl font-bold text-slate-800">Payment</h2>
              
              <div className="bg-slate-50 p-6 rounded-xl inline-block">
                <p className="text-sm text-slate-500 uppercase tracking-wide mb-2">Total Amount</p>
                <p className="text-4xl font-bold text-slate-900">KSh {cartTotal + 200}</p>
              </div>

              <div className="space-y-4">
                  <p className="text-slate-600">
                      We have sent a payment request to <strong className="text-slate-900">{phone}</strong>. 
                      Please enter your M-Pesa PIN on your phone to complete the transaction.
                  </p>
                  
                  {isProcessing ? (
                      <div className="flex flex-col items-center justify-center py-8">
                          <Loader2 className="animate-spin text-emerald-600 mb-4" size={48} />
                          <p className="font-medium text-emerald-700">Waiting for M-Pesa confirmation...</p>
                      </div>
                  ) : (
                      <button 
                        onClick={handlePayment}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition"
                      >
                          <CreditCard size={20} /> Simulate Payment Success
                      </button>
                  )}
              </div>
              <button onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-600 text-sm">Go Back</button>
          </div>
      )}

      {step === 3 && (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle size={40} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Order Confirmed!</h2>
              <p className="text-slate-600">
                  Thank you for your purchase. Your order has been received and will be processed shortly.
                  You will receive an SMS confirmation on {phone}.
              </p>
              <div className="pt-4">
                  <button onClick={() => navigate('/')} className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-800 transition">
                      Back to Home
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default Checkout;