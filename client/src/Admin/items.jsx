import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

// spec: "items.jsx - Displays a list of all books in the store with
// options for admin to edit or remove."
const Items = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ price: '', discount: '', status: 'active' });

  const fetchBooks = async () => {
    try {
      const res = await api.get('/admin/books');
      setBooks(res.data.books);
    } catch (err) {
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const openEdit = (book) => {
    setEditing(book);
    setEditForm({ price: book.price, discount: book.discount, status: book.status });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/books/${editing._id}`, editForm);
      toast.success('Book updated');
      setEditing(null);
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update book');
    }
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm('Remove this book listing?')) return;
    try {
      await api.delete(`/admin/books/${bookId}`);
      toast.info('Book removed');
      fetchBooks();
    } catch (err) {
      toast.error('Failed to remove book');
    }
  };

  if (loading) return <p className="page-loader">Loading books...</p>;

  return (
    <div className="admin-page">
      <h2>Book Management</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Seller</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book._id}>
              <td>{book.title}</td>
              <td>{book.seller?.businessName}</td>
              <td>₹{book.price} (-{book.discount}%)</td>
              <td>{book.stock}</td>
              <td><span className={`status-badge status-${book.status === 'active' ? 'active' : 'suspended'}`}>{book.status}</span></td>
              <td>
                <button onClick={() => openEdit(book)}>Edit</button>
                <button className="link-btn" onClick={() => handleDelete(book._id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <form className="admin-form modal-content" onClick={(e) => e.stopPropagation()} onSubmit={handleEditSubmit}>
            <h3>Edit "{editing.title}"</h3>
            <label>Price (₹)</label>
            <input type="number" min="0" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
            <label>Discount (%)</label>
            <input type="number" min="0" max="100" value={editForm.discount} onChange={(e) => setEditForm({ ...editForm, discount: e.target.value })} />
            <label>Status</label>
            <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="removed">Removed</option>
            </select>
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

export default Items;
