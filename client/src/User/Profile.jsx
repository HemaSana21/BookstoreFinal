import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const Profile = () => {
  const { actor, setActor } = useAuth();
  const [form, setForm] = useState({
    fullName: actor?.fullName || '',
    mobile: actor?.mobile || '',
    address: {
      fullName: actor?.address?.fullName || '',
      phone: actor?.address?.phone || '',
      line1: actor?.address?.line1 || '',
      city: actor?.address?.city || '',
      state: actor?.address?.state || '',
      pincode: actor?.address?.pincode || ''
    }
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
      formData.append('fullName', form.fullName);
      formData.append('mobile', form.mobile);
      formData.append('address', JSON.stringify(form.address));
      if (picture) formData.append('profilePicture', picture);

      const res = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setActor(res.data.user);
      localStorage.setItem('actor', JSON.stringify(res.data.user));
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const initial = (form.fullName || actor?.fullName || '?').charAt(0).toUpperCase();

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-banner">
          <div className="profile-banner-blob blob-1"></div>
          <div className="profile-banner-blob blob-2"></div>
        </div>

        <div className="profile-avatar-wrap">
          {previewUrl || actor?.profilePicture ? (
            <img
              className="profile-avatar"
              src={previewUrl || actor.profilePicture}
              alt="Profile"
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
          <h2>{actor?.fullName}</h2>
          <p>{actor?.email}</p>
        </div>

        <form className="profile-cards" onSubmit={handleSubmit}>
          <div className="profile-card">
            <div className="profile-card-header">
              <span className="profile-card-icon">👤</span>
              <h3>Personal Details</h3>
            </div>
            <label>Email (cannot be changed)</label>
            <input value={actor?.email || ''} disabled />
            <label>Full Name</label>
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <label>Phone</label>
            <input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          </div>

          <div className="profile-card">
            <div className="profile-card-header">
              <span className="profile-card-icon">📍</span>
              <h3>Shipping Address</h3>
            </div>
            <label>Address Line 1</label>
            <input
              placeholder="Address Line 1"
              value={form.address.line1}
              onChange={(e) => setForm({ ...form, address: { ...form.address, line1: e.target.value } })}
            />
            <label>City / State / Pincode</label>
            <div className="input-row">
              <input
                placeholder="City"
                value={form.address.city}
                onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
              />
              <input
                placeholder="State"
                value={form.address.state}
                onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })}
              />
              <input
                placeholder="Pincode"
                value={form.address.pincode}
                onChange={(e) => setForm({ ...form, address: { ...form.address, pincode: e.target.value } })}
              />
            </div>
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
