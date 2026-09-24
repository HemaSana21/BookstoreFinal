import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Ahome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then((res) => setStats(res.data.stats)).finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return <p className="page-loader">Loading dashboard...</p>;

  const maxMonthly = Math.max(...stats.monthlyRevenue.map((m) => m.total), 1);

  return (
    <div className="admin-page">
      <h2>Admin Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card"><h4>Users</h4><p>{stats.totalUsers}</p></div>
        <div className="stat-card"><h4>Approved Sellers</h4><p>{stats.totalSellers}</p></div>
        <div className="stat-card"><h4>Pending Sellers</h4><p>{stats.pendingSellers}</p></div>
        <div className="stat-card"><h4>Books</h4><p>{stats.totalBooks}</p></div>
        <div className="stat-card"><h4>Orders</h4><p>{stats.totalOrders}</p></div>
        <div className="stat-card"><h4>Revenue</h4><p>₹{stats.revenue.toLocaleString()}</p></div>
      </div>

      <div className="chart-section">
        <h3>Orders by Status</h3>
        <div className="simple-bar-chart">
          {stats.ordersByStatus.map((s) => (
            <div key={s._id} className="order-item-row">
              <span>{s._id}</span>
              <span>{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-section">
        <h3>Monthly Revenue (last 6 months)</h3>
        <div className="simple-bar-chart">
          {stats.monthlyRevenue.map((m) => (
            <div key={`${m._id.year}-${m._id.month}`} className="bar-row">
              <span className="bar-label">{m._id.month}/{m._id.year}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(m.total / maxMonthly) * 100}%` }} />
              </div>
              <span className="bar-value">₹{m.total.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Ahome;
