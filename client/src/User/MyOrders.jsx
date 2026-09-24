import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import OrderItem from './OrderItem';
import EmptyState from '../Components/EmptyState';
import CancelOrderModal from './CancelOrderModal';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const highlight = searchParams.get('highlight');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data.orders);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = (orderId) => {
    const order = orders.find((o) => o._id === orderId);
    if (order) setCancelTarget(order);
  };

  const confirmCancel = async (reason) => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await api.put(`/orders/${cancelTarget._id}/cancel`, { reason });
      toast.success('Order cancelled');
      setCancelTarget(null);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const printInvoice = (order) => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Invoice - ${order._id}</title></head>
      <body style="font-family: Arial, sans-serif; padding: 24px;">
        <h2>BookStore Invoice</h2>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <hr/>
        <table width="100%" cellpadding="6" style="border-collapse:collapse;">
          <tr><th align="left">Item</th><th align="right">Qty</th><th align="right">Price</th></tr>
          ${order.items.map((i) => `<tr><td>${i.title}</td><td align="right">${i.quantity}</td><td align="right">₹${i.price}</td></tr>`).join('')}
        </table>
        <hr/>
        <p>Subtotal: ₹${order.subtotal}</p>
        <p>Discount: -₹${order.discount}</p>
        <p>GST: ₹${order.gst}</p>
        <p>Delivery: ₹${order.deliveryCharge}</p>
        <h3>Grand Total: ₹${order.grandTotal}</h3>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  if (loading) return <p className="page-loader">Loading orders...</p>;

  const activeCount = orders.filter((o) => !['Delivered', 'Cancelled'].includes(o.status)).length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;

  return (
    <div className="orders-page">
      <div className="orders-hero">
        <div>
          <span className="page-eyebrow">📦 Order history</span>
          <h2>My Orders</h2>
          <p className="orders-hero-sub">Every book you've ordered, tracked from checkout to your doorstep.</p>
        </div>
        {orders.length > 0 && (
          <div className="orders-hero-stats">
            <div><strong>{orders.length}</strong><span>Total</span></div>
            <div><strong>{activeCount}</strong><span>In progress</span></div>
            <div><strong>{deliveredCount}</strong><span>Delivered</span></div>
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="orders-empty-showcase">
          <EmptyState
            variant="orders"
            title="No orders yet"
            message="Once you place an order, you can track it here from pending to delivered."
            ctaText="Start browsing"
            ctaLink="/books"
          />
        </div>
      ) : (
        orders.map((order) => (
          <OrderItem
            key={order._id}
            order={order}
            highlighted={highlight === order._id}
            onCancel={handleCancel}
            onInvoice={printInvoice}
          />
        ))
      )}

      {cancelTarget && (
        <CancelOrderModal
          order={cancelTarget}
          submitting={cancelling}
          onClose={() => setCancelTarget(null)}
          onConfirm={confirmCancel}
        />
      )}
    </div>
  );
};

export default MyOrders;
