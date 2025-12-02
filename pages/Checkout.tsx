import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MockDb } from '../services/mockDb';
import { Order, OrderStatus, UserRole } from '../types';
import { CreditCard, Upload, CheckCircle, Loader2, Smartphone } from 'lucide-react';

const Checkout = () => {
  const { cart, cartTotal, clearCart, user, isLoading } = useApp();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>('');

  // Redirect if not logged in or if user is not a customer
  useEffect(() => {
    if (!isLoading) {
        if (!user) {
            navigate('/login');
        } else if (user.role !== UserRole.CUSTOMER) {
            // Admins and Delivery Agents cannot checkout
            navigate('/'); 
        }
    }
  }, [user, isLoading, navigate]);

  const needsPrescription = cart.some(item => item.requiresPrescription);

  const handlePayment = async () => {
    if (!user) return; // Safety check

    setIsProcessing(true);
    setPaymentStatus('Initiating M-Pesa Request...');
    
    try {
        // 1. Initiate STK Push
        const requestId = await MockDb.initiateMpesaPayment(phone, cartTotal + 200);
        setPaymentStatus('Request Sent. Please check your phone and enter PIN.');

        // 2. Poll for Status
        const pollInterval = setInterval(async () => {
            const status = await MockDb.checkPaymentStatus(requestId);
            
            if (status === 'COMPLETED') {
                clearInterval(pollInterval);
                setPaymentStatus('Payment Confirmed. Finalizing Order...');
                await finalizeOrder();
            } else if (status === 'FAILED') {
                clearInterval(pollInterval);
                setIsProcessing(false);
                setPaymentStatus('');
                alert("Payment Failed or Cancelled. Please try again.");
            }
        }, 2000); // Check every 2 seconds

        // Timeout after 60 seconds
        setTimeout(() => {
            clearInterval(pollInterval);
            if (isProcessing) {
                setIsProcessing(false);
                setPaymentStatus('');
                alert("Payment timed out. Did you receive the STK push?");
            }
        }, 60000);

    } catch (e) {
        setIsProcessing(false);
        alert("Failed to initiate payment. Ensure backend is running.");
    }
  };

  const finalizeOrder = async () => {
      // Upload prescription if exists
      let prescriptionUrl = undefined;
      if (prescriptionFile) {
          prescriptionUrl = await MockDb.uploadPrescription(prescriptionFile);
      }

      // Create Order
      const newOrder: Order = {
          id: `ord_${Math.random().toString(36).substr(2, 9)}`,
          userId: user!.id,
          items: cart,
          totalAmount: cartTotal + 200,
          status: OrderStatus.PENDING,
          date: new Date().toISOString(),
          paymentMethod: 'MPESA',
          shippingAddress: address,
          prescriptionImage: prescriptionUrl,
          notes: notes.trim() || undefined
      };

      try {
          await MockDb.saveOrder(newOrder);
          clearCart();
          setIsProcessing(false);
          setStep(3); // Success
      } catch (e) {
          alert("Error saving order to backend");
          setIsProcessing(false);
      }
  };

  if (isLoading) {
      return (
          <div className="flex items-center justify-center min-h-[50vh]">
              <Loader2 className="animate-spin text-emerald-600" size={32} />
          </div>
      );
  }

  if (cart.length === 0 && step !== 3) {
      navigate('/shop');
      return null;
  }

  // Prevent flash of content if user is null or not customer
  if (!user || user.role !== UserRole.CUSTOMER) return null; 

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

              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Instructions (Optional)</label>
                  <textarea 
                    rows={2}
                    placeholder="e.g. Leave at gate, call upon arrival, specific landmark..." 
                    className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
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
                      Click below to pay via M-Pesa. A request will be sent to <strong className="text-slate-900">{phone}</strong>.
                  </p>
                  
                  {isProcessing ? (
                      <div className="flex flex-col items-center justify-center py-8 bg-emerald-50 rounded-xl border border-emerald-100">
                          <div className="relative">
                            <Smartphone size={48} className="text-emerald-800 mb-4" />
                            <Loader2 className="animate-spin text-emerald-600 absolute -top-1 -right-1" size={24} />
                          </div>
                          <p className="font-bold text-emerald-800 animate-pulse">{paymentStatus}</p>
                          <p className="text-sm text-emerald-600 mt-2">Please enter your PIN on your phone.</p>
                      </div>
                  ) : (
                      <button 
                        onClick={handlePayment}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20"
                      >
                          <CreditCard size={20} /> Pay Now (M-Pesa)
                      </button>
                  )}
              </div>
              {!isProcessing && (
                  <button onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-600 text-sm">Go Back</button>
              )}
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
