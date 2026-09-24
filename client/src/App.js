import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import Home from './Components/Home';
import NotFound from './Components/NotFound';
import ProtectedRoute from './Components/ProtectedRoute';

// User (customer)
import Login from './User/Login';
import Signup from './User/Signup';
import ForgotPassword from './User/ForgotPassword';
import Uhome from './User/Uhome';
import Products from './User/Products';
import Uitem from './User/Uitem';
import Cart from './User/Cart';
import Checkout from './User/Checkout';
import MyOrders from './User/MyOrders';
import Wishlist from './User/Wishlist';
import Profile from './User/Profile';

// Seller
import Slogin from './Seller/Slogin';
import Ssignup from './Seller/Ssignup';
import Snavbar from './Seller/Snavbar';
import Shome from './Seller/Shome';
import Addbook from './Seller/Addbook';
import MyProducts from './Seller/MyProducts';
import SellerOrders from './Seller/Orders';
import SellerProfile from './Seller/Profile';

// Admin
import Alogin from './Admin/Alogin';
import Anavbar from './Admin/Anavbar';
import Ahome from './Admin/Ahome';
import Items from './Admin/items';
import SellerAdmin from './Admin/Seller';
import Users from './Admin/Users';
import AdminOrders from './Admin/Orders';
import Asignup from './Admin/Asignup';

import './App.css';

const SiteLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="main-content">{children}</main>
    <Footer />
  </>
);

const SellerLayout = ({ children }) => (
  <>
    <Snavbar />
    <main className="main-content">{children}</main>
    <Footer />
  </>
);

const AdminLayout = ({ children }) => (
  <>
    <Anavbar />
    <main className="main-content">{children}</main>
  </>
);

const HomeRoute = () => {
  const { isUser } = useAuth();
  return isUser ? <Uhome /> : <Home />;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* ---------- Public / User (customer) site ---------- */}
          <Route path="/" element={<SiteLayout><HomeRoute /></SiteLayout>} />
          <Route path="/books" element={<SiteLayout><Products /></SiteLayout>} />
          <Route path="/books/:id" element={<SiteLayout><Uitem /></SiteLayout>} />
          <Route path="/login" element={<SiteLayout><Login /></SiteLayout>} />
          <Route path="/register" element={<SiteLayout><Signup /></SiteLayout>} />
          <Route path="/forgot-password" element={<SiteLayout><ForgotPassword /></SiteLayout>} />

          <Route path="/cart" element={<SiteLayout><ProtectedRoute role="user"><Cart /></ProtectedRoute></SiteLayout>} />
          <Route path="/checkout" element={<SiteLayout><ProtectedRoute role="user"><Checkout /></ProtectedRoute></SiteLayout>} />
          <Route path="/my-orders" element={<SiteLayout><ProtectedRoute role="user"><MyOrders /></ProtectedRoute></SiteLayout>} />
          <Route path="/orders" element={<SiteLayout><ProtectedRoute role="user"><MyOrders /></ProtectedRoute></SiteLayout>} />
          <Route path="/wishlist" element={<SiteLayout><ProtectedRoute role="user"><Wishlist /></ProtectedRoute></SiteLayout>} />
          <Route path="/profile" element={<SiteLayout><ProtectedRoute role="user"><Profile /></ProtectedRoute></SiteLayout>} />

          {/* ---------- Seller portal ---------- */}
          <Route path="/seller/login" element={<Slogin />} />
          <Route path="/seller/register" element={<Ssignup />} />
          <Route path="/seller" element={<ProtectedRoute role="seller"><SellerLayout><Shome /></SellerLayout></ProtectedRoute>} />
          <Route path="/seller/add-book" element={<ProtectedRoute role="seller"><SellerLayout><Addbook /></SellerLayout></ProtectedRoute>} />
          <Route path="/seller/products" element={<ProtectedRoute role="seller"><SellerLayout><MyProducts /></SellerLayout></ProtectedRoute>} />
          <Route path="/seller/orders" element={<ProtectedRoute role="seller"><SellerLayout><SellerOrders /></SellerLayout></ProtectedRoute>} />
          <Route path="/seller/profile" element={<ProtectedRoute role="seller"><SellerLayout><SellerProfile /></SellerLayout></ProtectedRoute>} />

          {/* ---------- Admin portal ---------- */}
          <Route path="/admin/login" element={<Alogin />} />
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout><Ahome /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/books" element={<ProtectedRoute role="admin"><AdminLayout><Items /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/sellers" element={<ProtectedRoute role="admin"><AdminLayout><SellerAdmin /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminLayout><Users /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute role="admin"><AdminLayout><AdminOrders /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/create-admin" element={<ProtectedRoute role="admin"><AdminLayout><Asignup /></AdminLayout></ProtectedRoute>} />

          <Route path="*" element={<SiteLayout><NotFound /></SiteLayout>} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
