import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await loginUser(form.email, form.password);
      toast.success(`Welcome back, ${user.fullName}!`);
      navigate(location.state?.from || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
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
            <span className="auth-visual-icon">📖</span>
            <h2>Welcome back, reader.</h2>
            <p>Pick up right where your story left off — your shelf is waiting.</p>
          </div>
        </div>
        <div className="auth-form-wrapper">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Login</h2>
            <label>Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <label>Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
            <p><Link to="/forgot-password">Forgot password?</Link></p>
            <p>Don't have an account? <Link to="/register">Register</Link></p>
            <p><Link to="/seller/login">Sign in as a Seller</Link> · <Link to="/admin/login">Sign in as Admin</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
