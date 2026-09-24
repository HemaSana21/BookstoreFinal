import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

// Protected page: only an existing (super) admin can reach this route to
// create another admin account. There is no public admin signup form.
const Asignup = () => {
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [lastCreated, setLastCreated] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/create', form);
      toast.success('New admin account created');
      setLastCreated({ fullName: form.fullName, email: form.email });
      setForm({ fullName: '', email: '', password: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  const pwdStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'][pwdStrength];

  return (
    <div className="create-admin-page">
      <div className="create-admin-card">
        <div className="create-admin-badge">🛡️</div>
        <span className="page-eyebrow">Super admin action</span>
        <h2>Create a New Admin Account</h2>
        <p className="create-admin-sub">New admins get full console access immediately — only invite people you trust.</p>

        <form className="admin-form create-admin-form" onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="e.g. Priya Sharma" />

          <label>Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@bookstore.com" />

          <label>Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="At least 6 characters"
          />
          {form.password.length > 0 && (
            <div className={`pwd-strength pwd-strength-${pwdStrength}`}>
              <div className="pwd-strength-bar"><span /></div>
              <small>{strengthLabel}</small>
            </div>
          )}

          <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Admin'}</button>
        </form>

        {lastCreated && (
          <div className="create-admin-success">
            <span>✅</span>
            <p><strong>{lastCreated.fullName}</strong> was added as an admin ({lastCreated.email}).</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Asignup;
