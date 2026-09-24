import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ConfirmModal from './ConfirmModal';

// The shared public/customer-facing header. Sellers and Admins get their
// own dedicated nav bars (Seller/Snavbar.jsx, Admin/Anavbar.jsx) once
// signed in to their respective portals.
const Navbar = () => {
  const { actor, isUser, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/books?search=${encodeURIComponent(search)}`);
    setMenuOpen(false);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-top">
        <Link to="/" className="brand">📚 BookStore</Link>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by title, author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>☰</button>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/books" onClick={() => setMenuOpen(false)}>Books</Link>
          {isUser && <Link to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</Link>}
          {isUser && (
            <Link to="/cart" onClick={() => setMenuOpen(false)}>
              Cart {cart.items?.length > 0 && <span className="badge">{cart.items.length}</span>}
            </Link>
          )}
          {isUser && <Link to="/orders" onClick={() => setMenuOpen(false)}>Orders</Link>}
          {isUser && <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>}

          {isUser ? (
            <button className="link-btn" onClick={() => setShowLogoutConfirm(true)}>Logout</button>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
              <Link to="/seller/login" onClick={() => setMenuOpen(false)}>Sell on BookStore</Link>
            </>
          )}
          {!actor && <Link to="/admin/login" onClick={() => setMenuOpen(false)}>Admin</Link>}
        </nav>
      </div>

      {showLogoutConfirm && (
        <ConfirmModal
          title="Log out of BookStore?"
          message="You'll need to sign in again to see your cart, wishlist and orders."
          confirmText="Log out"
          tone="danger"
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </header>
  );
};

export default Navbar;
