import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../Components/ConfirmModal';

const Anavbar = () => {
  const { actor, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-top">
        <Link to="/admin" className="brand">🛠️ Admin — {actor?.fullName}</Link>
        <nav className="nav-links open">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/books">Books</Link>
          <Link to="/admin/sellers">Sellers</Link>
          <Link to="/admin/users">Users</Link>
          <Link to="/admin/orders">Orders</Link>
          {actor?.superAdmin && <Link to="/admin/create-admin">Create Admin</Link>}
          <button className="link-btn" onClick={() => setShowLogoutConfirm(true)}>Logout</button>
        </nav>
      </div>

      {showLogoutConfirm && (
        <ConfirmModal
          title="Log out of Admin Console?"
          message="You'll need to sign in again to manage the platform."
          confirmText="Log out"
          tone="danger"
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </header>
  );
};

export default Anavbar;
