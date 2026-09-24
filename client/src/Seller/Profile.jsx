import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const STATUS_META = {
  approved: { label: 'Approved', cls: 'active' },
  blocked: { label: 'Blocked', cls: 'suspended' },
  pending: { label: 'Pending Approval', cls: 'pending' }
};

const Profile = () => {
  const { actor, setActor } = useAuth();
  const [form, setForm] = useState({
    businessName: actor?.businessName || '',
    ownerName: actor?.ownerName || '',
    mobile: actor?.mobile || '',
    gstNumber: actor?.gstNumber || ''
  });
  const [picture, setPicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPicture(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (picture) formData.append('profilePicture', picture);

      const res = await api.put('/sellers/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setActor(res.data.seller);
      localStorage.setItem('actor', JSON.stringify(res.data.seller));
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const status = STATUS_META[actor?.approvalStatus] || STATUS_META.pending;
  const initial = (form.businessName || actor?.businessName || '?').charAt(0).toUpperCase();

  return (
    <div className="profile-page">
      <div className="profile-header seller-profile-header">
        <div className="profile-banner">
          <div className="profile-banner-blob blob-1"></div>
          <div className="profile-banner-blob blob-2"></div>
        </div>

        <div className="profile-avatar-wrap">
          {previewUrl || actor?.profilePicture ? (
            <img
              className="profile-avatar"
              src={previewUrl || actor.profilePicture}
              alt="Business"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="profile-avatar profile-avatar-fallback">{initial}</div>
          )}
          <label className="profile-avatar-edit" title="Change photo">
            📷
            <input type="file" accept="image/*" onChange={handlePictureChange} hidden />
          </label>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-identity">
          <h2>{actor?.businessName}</h2>
          <p>{actor?.email}</p>
          <span className={`status-badge status-${status.cls}`}>{status.label}</span>
        </div>

        <form className="profile-cards" onSubmit={handleSubmit}>
          <div className="profile-card">
            <div className="profile-card-header">
              <span className="profile-card-icon">🏪</span>
              <h3>Business Details</h3>
            </div>
            <label>Email (cannot be changed)</label>
            <input value={actor?.email || ''} disabled />
            <label>Business Name</label>
            <input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
            <label>Owner Name</label>
            <input value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
          </div>

          <div className="profile-card">
            <div className="profile-card-header">
              <span className="profile-card-icon">📇</span>
              <h3>Contact &amp; Tax Info</h3>
            </div>
            <label>Mobile</label>
            <input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            <label>GST Number</label>
            <input value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} />
          </div>

          <div className="profile-footer">
            <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
