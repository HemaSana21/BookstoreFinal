import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import BookCard from '../Components/BookCard';
import EmptyState from '../Components/EmptyState';

const LANGUAGES = ['English', 'Hindi', 'Telugu', 'Tamil', 'Spanish'];

const Products = () => {
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: '',
    language: searchParams.get('language') || '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    sort: 'latest'
  });

  useEffect(() => {
    api.get('/categories').then((res) => {
      setCategories(res.data.categories);
      const categoryName = searchParams.get('categoryName');
      if (categoryName) {
        const match = res.data.categories.find((c) => c.name === categoryName);
        if (match) setFilters((f) => ({ ...f, category: match._id }));
      }
    });
  }, [searchParams]);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 12 };
      Object.keys(params).forEach((k) => (params[k] === '' ? delete params[k] : null));
      const res = await api.get('/books', { params });
      setBooks(res.data.books);
      setPages(res.data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleFilterChange = (key, value) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  return (
    <div className="books-page">
      <aside className="filters-sidebar">
        <h3>Filters</h3>

        <label>Search</label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          placeholder="Title or author"
        />

        <label>Category</label>
        <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        <label>Language</label>
        <select value={filters.language} onChange={(e) => handleFilterChange('language', e.target.value)}>
          <option value="">All Languages</option>
          {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>

        <label>Min Rating</label>
        <select value={filters.minRating} onChange={(e) => handleFilterChange('minRating', e.target.value)}>
          <option value="">Any</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
          <option value="2">2+ Stars</option>
        </select>

        <label>Price Range</label>
        <div className="price-range">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
          />
        </div>

        <label>Sort By</label>
        <select value={filters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)}>
          <option value="latest">Latest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </aside>

      <section className="books-results">
        <span className="page-eyebrow">🔍 Browse the shelves</span>
        <h2>All Books</h2>
        {loading ? (
          <p className="page-loader">Loading books...</p>
        ) : books.length === 0 ? (
          <EmptyState
            variant="search"
            title="No books match your filters"
            message="Try widening your price range or clearing a filter."
          />
        ) : (
          <>
            <div className="book-grid">
              {books.map((b) => <BookCard key={b._id} book={b} />)}
            </div>
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <span>Page {page} of {pages}</span>
              <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Products;
