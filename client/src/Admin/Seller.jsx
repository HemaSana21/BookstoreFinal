import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import EmptyState from '../Components/EmptyState';

// spec: "Seller.jsx - Admin page listing all sellers with options to
// approve, block, or view details."
const SellerAdmin = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchSellers = async () => {
    try {
      const res = await api.get('/admin/sellers', { params: filter ? { status: filter } : {} });
      setSellers(res.data.sellers);
    } catch (err) {
      toast.error('Failed to load sellers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/sellers/${id}/approve`);
      toast.success('Seller approved');
      fetchSellers();
    } catch (err) {
      toast.error('Failed to approve seller');
    }
  };

  const handleBlock = async (id) => {
    if (!window.confirm('Block this seller? Their listings will remain but they cannot manage them.')) return;
    try {
      await api.put(`/admin/sellers/${id}/block`);
      toast.info('Seller blocked');
      fetchSellers();
    } catch (err) {
      toast.error('Failed to block seller');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this seller and remove their listings?')) return;
    try {
      await api.delete(`/admin/sellers/${id}`);
      toast.info('Seller deleted');
      fetchSellers();
    } catch (err) {
      toast.error('Failed to delete seller');
    }
  };

  if (loading) return <p className="page-loader">Loading sellers...</p>;

  return (
    <div className="admin-page">
      <span className="page-eyebrow">🏪 Partner sellers</span>
      <div className="section-heading-row">
        <h2>Seller Management</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {sellers.length === 0 ? (
        <EmptyState
          variant="table"
          title="No sellers found"
          message={filter ? `No sellers currently have status "${filter}".` : 'Sellers who sign up to sell on BookStore will appear here.'}
        />
      ) : (
      <table className="admin-table">
        <thead>
          <tr>
            <th>Business</th>
            <th>Owner</th>
            <th>Email</th>
            <th>Status</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sellers.map((s) => (
            <tr key={s._id}>
              <td>{s.businessName}</td>
              <td>{s.ownerName}</td>
              <td>{s.email}</td>
              <td>
                <span className={`status-badge status-${s.approvalStatus === 'approved' ? 'active' : s.approvalStatus === 'blocked' ? 'suspended' : 'pending'}`}>
                  {s.approvalStatus}
                </span>
              </td>
              <td>{s.rating || 0}★</td>
              <td>
                {s.approvalStatus !== 'approved' && <button onClick={() => handleApprove(s._id)}>Approve</button>}
                {s.approvalStatus !== 'blocked' && <button onClick={() => handleBlock(s._id)}>Block</button>}
                <button className="link-btn" onClick={() => handleDelete(s._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </div>
  );
};

export default SellerAdmin;
