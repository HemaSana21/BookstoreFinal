import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Signup = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
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
      const user = await registerUser(form);
      toast.success(`Welcome to BookStore, ${user.fullName}!`);
      navigate('/');
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
            <span className="auth-visual-icon">✨</span>
            <h2>Join the shelf.</h2>
            <p>Create your account and start collecting stories worth keeping.</p>
          </div>
        </div>
        <div className="auth-form-wrapper">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Create an Account</h2>
            <label>Full Name</label>
            <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <label>Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <label>Mobile Number</label>
            <input required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            <label>Password</label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <label>Confirm Password</label>
            <input type="password" required minLength={6} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
            <button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Register'}</button>
            <p>Already have an account? <Link to="/login">Login</Link></p>
            <p>Want to sell books? <Link to="/seller/register">Become a Seller</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
