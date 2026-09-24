import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../Components/ConfirmModal';

const Snavbar = () => {
  const { actor, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/seller/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-top">
        <Link to="/seller" className="brand">📦 {actor?.businessName || 'Seller Portal'}</Link>
        <nav className="nav-links open">
          <Link to="/seller">Dashboard</Link>
          <Link to="/seller/add-book">Add Book</Link>
          <Link to="/seller/products">My Products</Link>
          <Link to="/seller/orders">Orders</Link>
          <Link to="/seller/profile">Profile</Link>
          <button className="link-btn" onClick={() => setShowLogoutConfirm(true)}>Logout</button>
        </nav>
      </div>

      {showLogoutConfirm && (
        <ConfirmModal
          title="Log out of Seller Portal?"
          message="You'll need to sign in again to manage your listings and orders."
          confirmText="Log out"
          tone="danger"
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </header>
  );
};

export default Snavbar;
