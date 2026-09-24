import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import BookCard from '../Components/BookCard';

// The personalized landing page a logged-in User sees (spec: "Uhome.jsx -
// User home page showing featured books, categories, and recommendations").
// Signed-out visitors instead see the general Components/Home.jsx.
const Uhome = () => {
  const { actor } = useAuth();
  const [recommended, setRecommended] = useState([]);
  const [shelf, setShelf] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [booksRes, interactionsRes, ordersRes] = await Promise.all([
          api.get('/books?sort=rating&limit=8'),
          api.get('/users/interactions'),
          api.get('/users/order-history')
        ]);
        setRecommended(booksRes.data.books);
        setShelf(interactionsRes.data.interactions.slice(0, 6));
        setOrders(ordersRes.data.orders.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="home-page">
      <section className="brand-statement">
        <span className="quote-mark">“</span>
        <p>Welcome back, {actor?.fullName?.split(' ')[0] || 'reader'}. Here's what's new for you.</p>
      </section>

      {shelf.length > 0 && (
        <section className="book-section">
          <div className="section-heading-row">
            <div>
              <span className="eyebrow">Pick up where you left off</span>
              <h2>Your Shelf</h2>
            </div>
          </div>
          <div className="book-grid">
            {shelf.map((i) => i.book && (
              <BookCard key={i._id} book={i.book} />
            ))}
          </div>
        </section>
      )}

      {orders.length > 0 && (
        <section className="chart-section">
          <h3>Recent Orders</h3>
          <div className="simple-bar-chart">
            {orders.map((o) => (
              <div key={o._id} className="order-item-row">
                <span>Order #{o._id.slice(-8).toUpperCase()} — {o.status}</span>
                <span>₹{o.grandTotal}</span>
              </div>
            ))}
          </div>
          <Link to="/my-orders" className="view-all-link">View all orders →</Link>
        </section>
      )}

      {loading ? (
        <p className="page-loader">Loading recommendations...</p>
      ) : (
        <section className="book-section">
          <div className="section-heading-row">
            <div>
              <span className="eyebrow">For you</span>
              <h2>Recommended Books</h2>
            </div>
            <Link to="/books" className="view-all-link">Browse all →</Link>
          </div>
          <div className="book-grid">
            {recommended.map((b) => <BookCard key={b._id} book={b} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default Uhome;
