import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import Book from './Book';
import EmptyState from '../Components/EmptyState';
import './List.css';

const MyProducts = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ price: '', discount: '', quantity: '' });

  const fetchProducts = async () => {
    try {
      const res = await api.get('/sellers/my-products');
      setBooks(res.data.books);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load your products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openEdit = (book) => {
    setEditing(book);
    setEditForm({ price: book.price, discount: book.discount, quantity: '' });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { price: editForm.price, discount: editForm.discount };
      if (editForm.quantity) payload.quantity = editForm.quantity;
      await api.put(`/sellers/books/${editing._id}`, payload);
      toast.success('Book updated');
      setEditing(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update book');
    }
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm('Remove this listing? It will no longer be visible to customers.')) return;
    try {
      await api.delete(`/sellers/books/${bookId}`);
      toast.info('Listing removed');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove listing');
    }
  };

  if (loading) return <p className="page-loader">Loading your products...</p>;

  return (
    <div className="admin-page">
      <span className="page-eyebrow">📚 Your catalogue</span>
      <div className="section-heading-row">
        <h2>My Products</h2>
        <Link to="/seller/add-book" className="btn-primary">+ List New Book</Link>
      </div>

      {books.length === 0 ? (
        <EmptyState
          variant="products"
          title="No listings yet"
          message="List your first book to start selling on BookStore."
          ctaText="List a book"
          ctaLink="/seller/add-book"
        />
      ) : (
        <div className="seller-product-grid">
          {books.map((book) => (
            <Book key={book._id} book={book} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <form className="admin-form modal-content" onClick={(e) => e.stopPropagation()} onSubmit={handleEditSubmit}>
            <h3>Edit "{editing.title}"</h3>
            <label>Price (₹)</label>
            <input type="number" min="0" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
            <label>Discount (%)</label>
            <input type="number" min="0" max="100" value={editForm.discount} onChange={(e) => setEditForm({ ...editForm, discount: e.target.value })} />
            <label>Add Stock (units) — optional</label>
            <input type="number" min="0" value={editForm.quantity} onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })} placeholder="Leave blank to keep current stock" />
            <div className="admin-nav-links">
              <button type="submit">Save</button>
              <button type="button" className="link-btn" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MyProducts;
