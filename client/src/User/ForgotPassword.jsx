import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/users/forgot-password', { email });
      toast.info(res.data.message);
      if (res.data.resetToken) setResetToken(res.data.resetToken); // dev-mode convenience
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/users/reset-password/${resetToken}`, { password });
      toast.success('Password reset successful. Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
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
            <span className="auth-visual-icon">🔑</span>
            <h2>Lost your way back?</h2>
            <p>No worries — we'll help you get back to your books in a couple of steps.</p>
          </div>
        </div>
        <div className="auth-form-wrapper">
          {step === 1 ? (
            <form className="auth-form" onSubmit={handleRequestToken}>
              <h2>Forgot Password</h2>
              <label>Enter your registered email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              <button type="submit" disabled={loading}>{loading ? 'Please wait...' : 'Send Reset Token'}</button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleResetPassword}>
              <h2>Reset Password</h2>
              <label>Reset Token</label>
              <input required value={resetToken} onChange={(e) => setResetToken(e.target.value)} />
              <label>New Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="submit" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
