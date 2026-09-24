import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const Checkout = () => {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', country: 'India'
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/orders', { shippingAddress: address, paymentMethod });
      toast.success('Order placed successfully!');
      await fetchCart();
      navigate(`/my-orders?highlight=${res.data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return <div className="checkout-page"><p>Your cart is empty. Add books before checking out.</p></div>;
  }

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>
      <form className="checkout-layout" onSubmit={handlePlaceOrder}>
        <div className="checkout-form-section">
          <h3>Shipping Address</h3>
          <input placeholder="Full Name" required value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />
          <input placeholder="Phone Number" required value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
          <input placeholder="Address Line 1" required value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
          <input placeholder="Address Line 2 (optional)" value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
          <div className="input-row">
            <input placeholder="City" required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
            <input placeholder="State" required value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
            <input placeholder="Pincode" required value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} />
          </div>

          <h3>Payment Method</h3>
          <div className="payment-options">
            {['COD', 'UPI', 'CREDIT_CARD', 'DEBIT_CARD'].map((method) => (
              <label key={method}>
                <input
                  type="radio"
                  name="payment"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={() => setPaymentMethod(method)}
                />
                {method === 'COD' ? 'Cash on Delivery' : method.replace('_', ' ')}
              </label>
            ))}
          </div>
          <p className="note">Note: Payment gateway integration is simulated for demo purposes — no real charges are made.</p>
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          {cart.items.map(({ book, quantity, lineTotal }) => (
            <div key={book._id} className="summary-row">
              <span>{book.title} × {quantity}</span>
              <span>₹{lineTotal}</span>
            </div>
          ))}
          <div className="summary-row"><span>Subtotal</span><span>₹{cart.subtotal}</span></div>
          <div className="summary-row"><span>Discount</span><span>-₹{cart.discount}</span></div>
          <div className="summary-row"><span>GST</span><span>₹{cart.gst}</span></div>
          <div className="summary-row"><span>Delivery</span><span>{cart.deliveryCharge === 0 ? 'Free' : `₹${cart.deliveryCharge}`}</span></div>
          <div className="summary-row total"><span>Grand Total</span><span>₹{cart.grandTotal}</span></div>
          <button type="submit" className="btn-primary full-width" disabled={loading}>
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
