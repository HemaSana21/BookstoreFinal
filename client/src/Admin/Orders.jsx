import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import EmptyState from '../Components/EmptyState';

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders', { params: filter ? { status: filter } : {} });
      setOrders(res.data.orders);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success('Order status updated');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update order');
    }
  };

  if (loading) return <p className="page-loader">Loading orders...</p>;

  return (
    <div className="admin-page">
      <span className="page-eyebrow">🧾 Storewide</span>
      <div className="section-heading-row">
        <h2>Order Management</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          variant="table"
          title="No orders found"
          message={filter ? `No orders currently have status "${filter}".` : 'Orders placed across the store will show up here.'}
        />
      ) : (
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>#{order._id.slice(-8).toUpperCase()}</td>
              <td>{order.user?.fullName}</td>
              <td>{order.items.length} item(s)</td>
              <td>₹{order.grandTotal}</td>
              <td>
                <select value={order.status} onChange={(e) => handleStatusChange(order._id, e.target.value)}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </div>
  );
};

export default Orders;
