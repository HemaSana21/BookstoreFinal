import React from 'react';
import './List.css';
import BookCover from '../Components/BookCover';

// A single book row/card in the seller's "My Products" grid (spec:
// "Book.jsx - Component for displaying a single book's details in seller view").
const stockClass = (stock) => (stock === 0 ? 'out-of-stock' : stock < 10 ? 'low-stock' : 'in-stock');
const stockLabel = (stock) => (stock === 0 ? 'Out of stock' : stock < 10 ? `Low (${stock})` : `${stock} in stock`);

const Book = ({ book, onEdit, onDelete }) => (
  <div className="seller-product-card">
    <BookCover book={book} />
    <h4>{book.title}</h4>
    <div className="seller-product-meta">
      <span>₹{book.price}</span>
      <span className={`stock-pill ${stockClass(book.stock)}`}>{stockLabel(book.stock)}</span>
    </div>
    <div className="seller-product-meta">
      <span>{book.categories?.map((c) => c.name).join(', ')}</span>
      <span>{book.status === 'removed' ? 'Removed' : 'Active'}</span>
    </div>
    <div className="seller-product-actions">
      <button onClick={() => onEdit(book)}>Edit</button>
      <button className="link-btn" onClick={() => onDelete(book._id)}>Remove</button>
    </div>
  </div>
);

export default Book;
