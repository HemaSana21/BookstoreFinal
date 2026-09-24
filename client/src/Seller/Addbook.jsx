import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { generateCoverDataUrl, generateCoverFile } from '../utils/coverGenerator';

const Addbook = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    authors: '',
    description: '',
    categories: [],
    price: '',
    discount: 0,
    language: 'English',
    publisher: '',
    isbn: '',
    pages: '',
    quantity: '',
    location: 'Main Warehouse',
    condition: 'new'
  });
  const [cover, setCover] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatingCover, setGeneratingCover] = useState(false);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.categories));
  }, []);

  const toggleCategory = (id) => {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(id) ? f.categories.filter((c) => c !== id) : [...f.categories, id]
    }));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCover(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearCover = () => {
    setCover(null);
    setPreview(null);
  };

  // Live preview of the auto-generated cover, shown whenever the seller
  // hasn't uploaded their own image yet.
  const livePreviewSrc = preview || generateCoverDataUrl(form.title || 'Your Book Title', form.authors || 'Author Name');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.categories.length === 0) {
      toast.error('Select at least one category');
      return;
    }
    setLoading(true);
    try {
      let coverFile = cover;
      if (!coverFile) {
        // No cover chosen — generate one automatically so the listing
        // never falls back to a generic placeholder image.
        setGeneratingCover(true);
        try {
          coverFile = await generateCoverFile(form.title, form.authors);
        } catch (genErr) {
          console.error(genErr);
        } finally {
          setGeneratingCover(false);
        }
      }

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'categories') formData.append('categories', value.join(','));
        else formData.append(key, value);
      });
      if (coverFile) formData.append('coverImage', coverFile);

      await api.post('/sellers/books', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(cover ? 'Book listed successfully!' : 'Book listed with an auto-generated cover!');
      navigate('/seller/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to list book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addbook-page">
      <div className="addbook-hero">
        <span className="page-eyebrow">🪄 List a book</span>
        <h2>Add a New Book</h2>
        <p>Fill in the details on the left — watch the cover come together on the right.</p>
      </div>

      <div className="addbook-layout">
        <form className="addbook-form" onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="addbook-section">
            <h3><span>📖</span> Book Details</h3>
            <label>Title</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

            <label>Author(s) — comma separated</label>
            <input
              required
              placeholder="e.g. Yuval Noah Harari, Jane Doe"
              value={form.authors}
              onChange={(e) => setForm({ ...form, authors: e.target.value })}
            />

            <label>Description</label>
            <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

            <label>Categories</label>
            <div className="checkbox-group">
              {categories.map((c) => (
                <label key={c._id} className="checkbox-pill">
                  <input
                    type="checkbox"
                    checked={form.categories.includes(c._id)}
                    onChange={() => toggleCategory(c._id)}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>

          <div className="addbook-section">
            <h3><span>💰</span> Pricing &amp; Stock</h3>
            <div className="input-row">
              <div>
                <label>Price (₹)</label>
                <input type="number" min="0" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <label>Discount (%)</label>
                <input type="number" min="0" max="100" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
              </div>
              <div>
                <label>Quantity in Stock</label>
                <input type="number" min="0" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="addbook-section">
            <h3><span>🏷️</span> Publishing Info</h3>
            <div className="input-row">
              <div>
                <label>Language</label>
                <input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
              </div>
              <div>
                <label>Publisher</label>
                <input value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} />
              </div>
              <div>
                <label>Pages</label>
                <input type="number" min="0" value={form.pages} onChange={(e) => setForm({ ...form, pages: e.target.value })} />
              </div>
            </div>

            <div className="input-row">
              <div>
                <label>ISBN</label>
                <input required value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
              </div>
              <div>
                <label>Inventory Location</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div>
                <label>Condition</label>
                <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                  <option value="new">New</option>
                  <option value="like_new">Like New</option>
                  <option value="used">Used</option>
                </select>
              </div>
            </div>
          </div>

          <div className="addbook-section">
            <h3><span>🖼️</span> Cover Image</h3>
            <p className="addbook-hint">Optional — if you skip this, we'll auto-generate a unique cover from the title and author.</p>
            <div className="addbook-cover-upload">
              <label className="addbook-upload-btn">
                Choose Image
                <input type="file" accept="image/*" onChange={handleCoverChange} hidden />
              </label>
              {cover && <button type="button" className="link-btn" onClick={clearCover}>Use auto-generated cover instead</button>}
            </div>
          </div>

          <button type="submit" className="addbook-submit" disabled={loading}>
            {loading ? (generatingCover ? 'Generating cover...' : 'Listing...') : 'List Book'}
          </button>
        </form>

        <aside className="addbook-preview">
          <span className="addbook-preview-label">{cover ? 'Your cover' : 'Live auto-generated preview'}</span>
          <div className="addbook-preview-card">
            <img src={livePreviewSrc} alt="Cover preview" />
            {!cover && <span className="generated-cover-badge">Auto cover</span>}
          </div>
          <div className="addbook-preview-meta">
            <strong>{form.title || 'Your Book Title'}</strong>
            <span>{form.authors || 'Author Name'}</span>
            <span className="addbook-preview-price">₹{form.price || '0'}</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Addbook;
