import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { ShoppingCart, User, LogOut, Menu, X, Activity, LayoutDashboard, Stethoscope } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, cart } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-emerald-700 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Activity className="h-8 w-8 text-emerald-300" />
            <span>AfyaBora</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="hover:text-emerald-200 transition">Home</Link>
            <Link to="/shop" className="hover:text-emerald-200 transition">Shop</Link>
            {user?.role === UserRole.ADMIN && (
              <Link to="/admin" className="flex items-center gap-1 hover:text-emerald-200 transition">
                <LayoutDashboard size={18} /> Admin
              </Link>
            )}
            <Link to="/ai-consult" className="flex items-center gap-1 hover:text-emerald-200 transition">
              <Stethoscope size={18} /> AI Pharmacist
            </Link>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/cart" className="relative group">
              <ShoppingCart size={24} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-emerald-200">{user.role}</span>
                </div>
                <button onClick={handleLogout} className="p-2 hover:bg-emerald-600 rounded-full transition" title="Logout">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-white text-emerald-700 px-5 py-2 rounded-full font-semibold hover:bg-emerald-50 transition shadow-sm">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-emerald-800 p-4 space-y-4">
            <Link to="/" className="block py-2 border-b border-emerald-700" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/shop" className="block py-2 border-b border-emerald-700" onClick={() => setIsMenuOpen(false)}>Shop</Link>
            <Link to="/ai-consult" className="block py-2 border-b border-emerald-700" onClick={() => setIsMenuOpen(false)}>AI Pharmacist</Link>
            <Link to="/cart" className="block py-2 border-b border-emerald-700" onClick={() => setIsMenuOpen(false)}>Cart ({cartItemCount})</Link>
            {user?.role === UserRole.ADMIN && (
              <Link to="/admin" className="block py-2 border-b border-emerald-700 text-yellow-300" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>
            )}
            {user ? (
              <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full text-left py-2 text-rose-300">Logout</button>
            ) : (
              <Link to="/login" className="block py-2 font-bold text-white" onClick={() => setIsMenuOpen(false)}>Login</Link>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              <Activity className="text-emerald-500" /> AfyaBora
            </h3>
            <p className="text-sm">Your trusted digital health partner in Kenya. Quality medicines, fast delivery.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop">Shop Medicine</Link></li>
              <li><Link to="/shop">Medical Equipment</Link></li>
              <li><Link to="/ai-consult">Consult Pharmacist</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Nairobi, Kenya</li>
              <li>+254 700 000 000</li>
              <li>support@afyabora.co.ke</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;