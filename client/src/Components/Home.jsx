import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import BookCard from './BookCard';

const CATEGORIES = [
  { name: 'Fiction', icon: '📖' },
  { name: 'Non Fiction', icon: '📰' },
  { name: 'Science', icon: '🔬' },
  { name: 'Technology', icon: '💻' },
  { name: 'Programming', icon: '👨‍💻' },
  { name: 'History', icon: '🏛️' },
  { name: 'Biography', icon: '🧑‍🎤' },
  { name: 'Business', icon: '💼' },
  { name: 'Self Help', icon: '🌱' },
  { name: 'Children', icon: '🧸' },
  { name: 'Comics', icon: '🦸' }
];

const TRUST_BADGES = [
  { icon: '🚚', title: 'Free Shipping', text: 'On orders over ₹500' },
  { icon: '🔄', title: 'Easy Returns', text: '7-day return window' },
  { icon: '🔒', title: 'Secure Checkout', text: 'Your data stays safe' },
  { icon: '💬', title: '24x7 Support', text: "We're always here" }
];

const Home = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalBooks, setTotalBooks] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setNewsletterEmail('');
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [bs, na, feat] = await Promise.all([
          api.get('/books?bestSeller=true&limit=4'),
          api.get('/books?newArrival=true&limit=4'),
          api.get('/books?sort=rating&limit=8')
        ]);
        setBestSellers(bs.data.books);
        setNewArrivals(na.data.books);
        setFeatured(feat.data.books);
        setTotalBooks(feat.data.total ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const heroCovers = featured.slice(0, 3);

  return (
    <div className="home-page">
      <section className="hero hero-split">
        <div className="hero-content">
          <span className="eyebrow-pill">📚 Welcome to your next chapter</span>
          <h1>Stories worth <span className="accent-underline">staying up</span> for.</h1>
          <p>Browse thousands of titles across every genre, curated for readers who never stop turning pages.</p>
          <div className="hero-actions">
            <Link to="/books" className="btn-primary">Browse Books</Link>
            <Link to="/books?sort=rating" className="btn-ghost">Top Rated →</Link>
          </div>
          <div className="hero-stats">
            <div><strong>{totalBooks ?? '50+'}</strong><span>Books</span></div>
            <div><strong>{CATEGORIES.length}</strong><span>Categories</span></div>
            <div><strong>4.8★</strong><span>Avg. Rating</span></div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="cover-fan">
            {heroCovers.length > 0 ? (
              heroCovers.map((b, i) => (
                <img
                  key={b._id}
                  src={b.coverImage}
                  alt={b.title}
                  className={`cover-fan-item cover-fan-${i + 1}`}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ))
            ) : (
              <>
                <div className="cover-fan-item cover-fan-1 cover-fan-placeholder"></div>
                <div className="cover-fan-item cover-fan-2 cover-fan-placeholder"></div>
                <div className="cover-fan-item cover-fan-3 cover-fan-placeholder"></div>
              </>
            )}
          </div>
          <div className="hero-floating-badge">
            <span>⭐ 4.8</span>
            <small>Loved by readers</small>
          </div>
        </div>
      </section>

      <section className="brand-statement">
        <span className="quote-mark">“</span>
        <p>Every great story starts on page one — find yours today.</p>
      </section>

      <section className="categories-strip">
        <span className="eyebrow">Browse</span>
        <h2>Shop by Category</h2>
        <div className="category-grid">
          {CATEGORIES.map((c, i) => (
            <Link key={c.name} to={`/books?categoryName=${encodeURIComponent(c.name)}`} className="category-tile">
              <span className={`category-tile-icon icon-tone-${(i % 5) + 1}`}>{c.icon}</span>
              <span>{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {loading ? (
        <p className="page-loader">Loading books...</p>
      ) : (
        <>
          <section className="book-section">
            <div className="section-heading-row">
              <div>
                <span className="eyebrow">Handpicked</span>
                <h2>Featured Books</h2>
              </div>
              <Link to="/books" className="view-all-link">View all →</Link>
            </div>
            <div className="book-grid">
              {featured.map((b) => <BookCard key={b._id} book={b} />)}
            </div>
          </section>

          <section className="book-section">
            <div className="section-heading-row">
              <div>
                <span className="eyebrow">Reader favorites</span>
                <h2>Best Sellers</h2>
              </div>
              <Link to="/books?bestSeller=true" className="view-all-link">View all →</Link>
            </div>
            <div className="book-grid">
              {bestSellers.length ? bestSellers.map((b) => <BookCard key={b._id} book={b} />) : <p>No best sellers yet.</p>}
            </div>
          </section>

          <section className="book-section">
            <div className="section-heading-row">
              <div>
                <span className="eyebrow">Just landed</span>
                <h2>New Arrivals</h2>
              </div>
              <Link to="/books?newArrival=true" className="view-all-link">View all →</Link>
            </div>
            <div className="book-grid">
              {newArrivals.length ? newArrivals.map((b) => <BookCard key={b._id} book={b} />) : <p>No new arrivals yet.</p>}
            </div>
          </section>
        </>
      )}

      <section className="trust-strip">
        {TRUST_BADGES.map((t) => (
          <div className="trust-badge" key={t.title}>
            <span className="trust-badge-icon">{t.icon}</span>
            <div>
              <strong>{t.title}</strong>
              <p>{t.text}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="newsletter">
        <div className="newsletter-blob blob-a"></div>
        <div className="newsletter-blob blob-b"></div>
        <div className="newsletter-inner">
          <span className="newsletter-icon">✉️</span>
          <span className="eyebrow">Stay in the loop</span>
          <h2>Never miss a great read</h2>
          <p>New arrivals, curated picks and members-only offers — straight to your inbox, no spam.</p>

          {subscribed ? (
            <div className="newsletter-success">
              <span className="newsletter-success-icon">🎉</span>
              <div>
                <strong>You're on the list!</strong>
                <p>Watch your inbox for our next drop of book recommendations.</p>
              </div>
            </div>
          ) : (
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
              <button type="submit">Subscribe →</button>
            </form>
          )}
          <p className="newsletter-fineprint">Join 10,000+ readers. Unsubscribe anytime.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;