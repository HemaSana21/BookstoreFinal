import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Seller dashboard home (spec: "Shome.jsx - Seller dashboard home page with
// sales stats and quick navigation").
const Shome = () => {
  const { actor } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (actor?.approvalStatus !== 'approved') {
      setLoading(false);
      return;
    }
    api.get('/sellers/stats')
      .then((res) => setStats(res.data.stats))
      .catch(() => setStats({ totalBooks: 0, totalOrders: 0, unitsSold: 0, totalSales: 0, avgRating: 0 }))
      .finally(() => setLoading(false));
  }, [actor]);

  if (actor?.approvalStatus === 'pending') {
    return (
      <div className="seller-status-page">
        <div className="seller-status-card status-pending-card">
          <div className="seller-status-icon spin-slow">⏳</div>
          <span className="page-eyebrow">Application under review</span>
          <h2>Welcome, {actor.businessName}</h2>
          <p>
            Your seller account is awaiting admin approval. You'll be able to list books and see sales
            stats the moment you're approved — usually within a business day.
          </p>
          <div className="seller-status-steps">
            <div className="seller-status-step done"><span>✓</span> Account created</div>
            <div className="seller-status-step active"><span>2</span> Awaiting admin review</div>
            <div className="seller-status-step"><span>3</span> Start selling</div>
          </div>
        </div>
      </div>
    );
  }

  if (actor?.approvalStatus === 'blocked') {
    return (
      <div className="seller-status-page">
        <div className="seller-status-card status-blocked-card">
          <div className="seller-status-icon">🚫</div>
          <span className="page-eyebrow">Account blocked</span>
          <h2>Account blocked</h2>
          <p>Your seller account has been blocked by an administrator. Contact support for assistance.</p>
        </div>
      </div>
    );
  }

  if (loading) return <p className="page-loader">Loading dashboard...</p>;
  if (!stats) return null;

  return (
    <div className="seller-dashboard">
      <div className="seller-dashboard-hero">
        <div>
          <span className="page-eyebrow">🏪 Seller dashboard</span>
          <h2>Welcome back, {actor?.businessName}</h2>
          <p>Here's how your storefront is doing today.</p>
        </div>
        <div className="seller-dashboard-rating">
          <span>⭐ {stats.avgRating || 0}</span>
          <small>Avg. rating</small>
        </div>
      </div>

      <div className="stats-grid seller-stats-grid">
        <div className="stat-card"><span className="stat-card-icon">📚</span><h4>Active Listings</h4><p>{stats.totalBooks}</p></div>
        <div className="stat-card"><span className="stat-card-icon">📦</span><h4>Orders</h4><p>{stats.totalOrders}</p></div>
        <div className="stat-card"><span className="stat-card-icon">🛒</span><h4>Units Sold</h4><p>{stats.unitsSold}</p></div>
        <div className="stat-card"><span className="stat-card-icon">💰</span><h4>Total Sales</h4><p>₹{stats.totalSales.toLocaleString()}</p></div>
      </div>

      <div className="seller-quick-actions">
        <Link to="/seller/add-book" className="seller-action-tile">
          <span className="seller-action-icon">➕</span>
          <div><strong>List a New Book</strong><p>Add another title to your catalogue</p></div>
        </Link>
        <Link to="/seller/products" className="seller-action-tile">
          <span className="seller-action-icon">🗂️</span>
          <div><strong>My Products</strong><p>Manage price, stock and listings</p></div>
        </Link>
        <Link to="/seller/orders" className="seller-action-tile">
          <span className="seller-action-icon">🚚</span>
          <div><strong>Fulfil Orders</strong><p>Update shipping status</p></div>
        </Link>
      </div>
    </div>
  );
};

export default Shome;
