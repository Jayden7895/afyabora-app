import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import { UserRole } from './types';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import AiConsult from './pages/AiConsult';
import Login from './pages/Login';
import OrderHistory from './pages/OrderHistory';
import Tracking from './pages/Tracking';
import Wishlist from './pages/Wishlist';
import DeliveryDashboard from './pages/DeliveryDashboard';

const App = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/ai-consult" element={<AiConsult />} />
            <Route path="/login" element={<Login />} />

            {/* Customer Routes */}
            <Route element={<ProtectedRoute allowedRoles={[UserRole.CUSTOMER]} />}>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<OrderHistory />} />
              <Route path="/tracking/:orderId" element={<Tracking />} />
              <Route path="/wishlist" element={<Wishlist />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            {/* Delivery Agent Routes */}
            <Route element={<ProtectedRoute allowedRoles={[UserRole.DELIVERY_AGENT]} />}>
              <Route path="/delivery" element={<DeliveryDashboard />} />
            </Route>

          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
};

export default App;