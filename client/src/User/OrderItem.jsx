import React from 'react';

const STATUS_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

// Renders a single order card: header, tracking steps, line items, and
// actions (invoice / cancel). Used by User/MyOrders.jsx for each order in
// the list (spec: "OrderItem.jsx – Component to display individual order details").
const OrderItem = ({ order, highlighted, onCancel, onInvoice }) => (
  <div className={`order-card ${highlighted ? 'highlighted' : ''}`}>
    <div className="order-header">
      <div>
        <strong>Order #{order._id.slice(-8).toUpperCase()}</strong>
        <p>{new Date(order.createdAt).toLocaleDateString()}</p>
      </div>
      <span className={`status-badge status-${order.status.toLowerCase()}`}>{order.status}</span>
    </div>

    {order.status !== 'Cancelled' ? (
      <div className="tracking-steps">
        {STATUS_STEPS.map((step, idx) => (
          <div key={step} className={`step ${STATUS_STEPS.indexOf(order.status) >= idx ? 'active' : ''}`}>
            <span className="step-dot" />
            {step}
          </div>
        ))}
      </div>
    ) : (
      order.cancelReason && (
        <div className="cancel-reason-note">
          <span>✕</span> Cancelled — {order.cancelReason}
        </div>
      )
    )}

    <div className="order-items">
      {order.items.map((item) => (
        <div key={item.book} className="order-item-row">
          <span>{item.title} × {item.quantity}</span>
          <span>₹{item.price * item.quantity}</span>
        </div>
      ))}
    </div>

    <div className="order-footer">
      <strong>Total: ₹{order.grandTotal}</strong>
      <div className="order-actions">
        <button onClick={() => onInvoice(order)}>🧾 Invoice</button>
        {['Pending', 'Processing'].includes(order.status) && (
          <button className="link-btn cancel-order-link" onClick={() => onCancel(order._id)}>Cancel Order</button>
        )}
      </div>
    </div>
  </div>
);

export default OrderItem;
