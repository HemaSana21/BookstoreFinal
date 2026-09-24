import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Ssignup = () => {
  const { registerSeller } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    businessName: '', ownerName: '', email: '', mobile: '', password: '', confirmPassword: '', gstNumber: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await registerSeller(form);
      toast.success(res.message || 'Registration successful');
      navigate('/seller');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split">
        <div className="auth-visual">
          <div className="auth-visual-blob blob-1"></div>
          <div className="auth-visual-blob blob-2"></div>
          <div className="auth-visual-content">
            <span className="auth-visual-icon">📦</span>
            <h2>Become a Seller</h2>
            <p>Reach thousands of readers. Your account will need a quick admin approval before you can list books.</p>
          </div>
        </div>
        <div className="auth-form-wrapper">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Seller Registration</h2>
            <label>Business Name</label>
            <input required value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
            <label>Owner Name</label>
            <input required value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
            <label>Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <label>Mobile Number</label>
            <input required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            <label>GST Number (optional)</label>
            <input value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} />
            <label>Password</label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <label>Confirm Password</label>
            <input type="password" required minLength={6} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
            <button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Register as Seller'}</button>
            <p>Already registered? <Link to="/seller/login">Login</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Ssignup;
