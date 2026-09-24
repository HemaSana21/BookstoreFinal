import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import EmptyState from '../Components/EmptyState';

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered'];
const STATUS_ICON = { Pending: '🕓', Processing: '⚙️', Shipped: '🚚', Delivered: '✅' };

// Order Fulfillment (spec: "Orders.jsx - Shows orders received for the
// seller's books with status update controls"). Redesigned as one card per
// order (grouping that seller's own line items) instead of a flat table.
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/sellers/orders');
      setOrders(res.data.orders);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, bookId, status) => {
    try {
      await api.put(`/sellers/orders/${orderId}/items/${bookId}/status`, { status });
      toast.success('Fulfillment status updated');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) return <p className="page-loader">Loading orders...</p>;

  const pendingCount = orders.reduce(
    (acc, o) => acc + o.items.filter((i) => i.fulfillmentStatus === 'Pending').length,
    0
  );

  return (
    <div className="fulfillment-page">
      <div className="fulfillment-hero">
        <div>
          <span className="page-eyebrow">🚚 Fulfillment queue</span>
          <h2>Order Fulfillment</h2>
          <p>Update each item as you pack, ship and deliver it.</p>
        </div>
        {orders.length > 0 && (
          <div className="fulfillment-stat-pill">
            <strong>{pendingCount}</strong>
            <span>awaiting action</span>
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <EmptyState
          variant="orders"
          title="No orders yet"
          message="Orders for your books will show up here as customers buy them."
        />
      ) : (
        <div className="fulfillment-grid">
          {orders.map((order) => (
            <div key={order._id} className="fulfillment-card">
              <div className="fulfillment-card-header">
                <div>
                  <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                  <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="fulfillment-customer">
                  <span>{order.user?.fullName}</span>
                  <small>{order.user?.mobile}</small>
                </div>
              </div>

              <div className="fulfillment-items">
                {order.items.map((item) => (
                  <div key={`${order._id}-${item.book}`} className="fulfillment-item-row">
                    <div className="fulfillment-item-info">
                      <span className="fulfillment-item-title">{item.title}</span>
                      <span className="fulfillment-item-sub">× {item.quantity} · ₹{item.price * item.quantity}</span>
                    </div>
                    <div className="fulfillment-status-control">
                      <span className={`fulfillment-status-chip status-${item.fulfillmentStatus.toLowerCase()}`}>
                        {STATUS_ICON[item.fulfillmentStatus]} {item.fulfillmentStatus}
                      </span>
                      <select
                        value={item.fulfillmentStatus}
                        onChange={(e) => handleStatusChange(order._id, item.book, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
