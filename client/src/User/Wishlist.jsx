import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import BookCard from '../Components/BookCard';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState({ books: [] });
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/wishlist');
      setWishlist(res.data.wishlist);
    } catch (err) {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (bookId) => {
    try {
      const res = await api.delete(`/wishlist/remove/${bookId}`);
      setWishlist(res.data.wishlist);
      toast.info('Removed from wishlist');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  if (loading) return <p className="page-loader">Loading wishlist...</p>;

  const count = wishlist.books.length;

  return (
    <div className="wishlist-page">
      <div className="wishlist-hero">
        <span className="page-eyebrow">❤ Saved for later</span>
        <h2>My Wishlist</h2>
        <p className="wishlist-hero-sub">
          {count > 0
            ? `${count} book${count > 1 ? 's' : ''} you don't want to lose track of.`
            : "Keep the books you're eyeing all in one place."}
        </p>
      </div>

      {count === 0 ? (
        <div className="wishlist-empty">
          <div className="wishlist-empty-hearts">
            <span className="floating-heart heart-1">♡</span>
            <span className="floating-heart heart-2">♥</span>
            <span className="floating-heart heart-3">♡</span>
            <div className="wishlist-empty-core">♥</div>
          </div>
          <h3>Your wishlist is feeling a little lonely</h3>
          <p>Tap the ♥ on any book you love and it'll land here, ready whenever you are.</p>
          <Link to="/books" className="btn-primary">Discover books to love</Link>
        </div>
      ) : (
        <div className="book-grid wishlist-grid">
          {wishlist.books.map((book) => (
            <div key={book._id} className="wishlist-item">
              <BookCard book={book} />
              <button className="remove-btn" onClick={() => handleRemove(book._id)}>
                <span aria-hidden="true">✕</span> Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
