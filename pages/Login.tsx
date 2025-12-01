import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Activity } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      login(email, role);
      if (role === UserRole.ADMIN) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md">
        <div className="text-center mb-8">
            <Activity className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-slate-500">Sign in to AfyaBora</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                    type="email" 
                    required
                    className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Role (Demo)</label>
                <select 
                    className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                >
                    <option value={UserRole.CUSTOMER}>Customer</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                    <option value={UserRole.DELIVERY_AGENT}>Delivery Agent</option>
                </select>
            </div>

            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition">
                Sign In
            </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
            For demo purposes, any email works. No password required.
        </div>
      </div>
    </div>
  );
};

export default Login;