import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import BookCard from '../Components/BookCard';
import BookCover from '../Components/BookCover';

const SHELF_LABELS = {
  want_to_read: 'Want to Read',
  reading: 'Currently Reading',
  completed: 'Completed'
};

const Uitem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isUser, actor } = useAuth();
  const { addToCart } = useCart();

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [shelfStatus, setShelfStatus] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/books/${id}`);
      setBook(res.data.book);
      setReviews(res.data.reviews);
      setRelated(res.data.relatedBooks);
    } catch (err) {
      toast.error('Book not found');
      navigate('/books');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading || !book) return <p className="page-loader">Loading...</p>;

  const authorLabel = book.authorNames || book.authors?.map((a) => a.name).join(', ') || 'Unknown author';
  const categoryLabel = book.categories?.map((c) => c.name).join(', ') || 'Uncategorized';
  const finalPrice = +(book.price - (book.price * book.discount) / 100).toFixed(2);

  const handleAddToCart = () => {
    if (!isUser) return navigate('/login');
    addToCart(book._id, quantity);
  };

  const handleBuyNow = async () => {
    if (!isUser) return navigate('/login');
    await addToCart(book._id, quantity);
    navigate('/cart');
  };

  const handleWishlist = async () => {
    if (!isUser) return navigate('/login');
    try {
      await api.post('/wishlist/add', { bookId: book._id });
      toast.success('Added to wishlist');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to wishlist');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isUser) return navigate('/login');
    try {
      await api.post('/reviews', { bookId: book._id, rating: Number(rating), comment });
      toast.success('Review submitted');
      setComment('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.info('Review deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    }
  };

  const handleShelfChange = async (status) => {
    if (!isUser) return navigate('/login');
    try {
      await api.put(`/users/interactions/${book._id}`, { status });
      setShelfStatus(status);
      toast.success(`Marked as "${SHELF_LABELS[status]}"`);
    } catch (err) {
      toast.error('Failed to update your shelf');
    }
  };

  return (
    <div className="book-details-page">
      <div className="book-details-top">
        <div className="book-details-image">
          <BookCover book={book} />
        </div>
        <div className="book-details-info">
          <h1>{book.title}</h1>
          <p className="author">by {authorLabel}</p>
          <div className="book-rating">⭐ {book.rating?.toFixed?.(1) || 0} ({book.numReviews || 0} reviews)</div>
          <div className="price-row">
            <span className="final-price">₹{finalPrice}</span>
            {book.discount > 0 && (
              <>
                <span className="original-price">₹{book.price}</span>
                <span className="discount-tag">-{book.discount}%</span>
              </>
            )}
          </div>
          <p className="description">{book.description}</p>
          <ul className="meta-list">
            <li><strong>Category:</strong> {categoryLabel}</li>
            <li><strong>Sold by:</strong> {book.seller?.businessName || 'BookStore'}</li>
            <li><strong>Language:</strong> {book.language}</li>
            <li><strong>Publisher:</strong> {book.publisher}</li>
            <li><strong>Pages:</strong> {book.pages}</li>
            <li><strong>ISBN:</strong> {book.isbn}</li>
            <li><strong>Stock:</strong> {book.stock > 0 ? `${book.stock} available` : 'Out of stock'}</li>
          </ul>

          <div className="quantity-selector">
            <label>Quantity</label>
            <input
              type="number"
              min="1"
              max={book.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            />
          </div>

          <div className="action-buttons">
            <button onClick={handleAddToCart} disabled={book.stock === 0}>Add to Cart</button>
            <button onClick={handleBuyNow} disabled={book.stock === 0} className="btn-primary">Buy Now</button>
            <button onClick={handleWishlist} className="icon-btn">♥ Wishlist</button>
          </div>

          {isUser && (
            <div className="quantity-selector">
              <label>My Shelf</label>
              <select value={shelfStatus} onChange={(e) => handleShelfChange(e.target.value)}>
                <option value="">Not on your shelf</option>
                {Object.entries(SHELF_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <section className="reviews-section">
        <h2>Customer Reviews</h2>

        {isUser && (
          <form className="review-form" onSubmit={handleReviewSubmit}>
            <label>Your Rating</label>
            <select value={rating} onChange={(e) => setRating(e.target.value)}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} Stars</option>)}
            </select>
            <textarea
              placeholder="Write your review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
            <button type="submit">Submit Review</button>
          </form>
        )}

        <div className="reviews-list">
          {reviews.length === 0 && <p>No reviews yet. Be the first to review this book!</p>}
          {reviews.map((r) => (
            <div key={r._id} className="review-item">
              <div className="review-header">
                <strong>{r.user?.fullName || 'Anonymous'}</strong>
                <span>⭐ {r.rating}</span>
              </div>
              <p>{r.comment}</p>
              {isUser && actor?._id === r.user?._id && (
                <button className="link-btn" onClick={() => handleDeleteReview(r._id)}>Delete</button>
              )}
            </div>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="book-section">
          <h2>Related Books</h2>
          <div className="book-grid">
            {related.map((b) => <BookCard key={b._id} book={b} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default Uitem;
