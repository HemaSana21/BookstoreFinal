import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import EmptyState from '../Components/EmptyState';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusToggle = async (user) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await api.put(`/admin/users/${user._id}/status`, { status: newStatus });
      toast.success(`User ${newStatus}`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user account permanently?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.info('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  if (loading) return <p className="page-loader">Loading users...</p>;

  return (
    <div className="admin-page">
      <span className="page-eyebrow">👥 Customer accounts</span>
      <h2>User Management</h2>
      {users.length === 0 ? (
        <EmptyState variant="table" title="No users yet" message="Registered customers will appear here." />
      ) : (
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.fullName}</td>
              <td>{u.email}</td>
              <td>{u.mobile}</td>
              <td><span className={`status-badge status-${u.status}`}>{u.status}</span></td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleStatusToggle(u)}>{u.status === 'active' ? 'Suspend' : 'Activate'}</button>
                <button className="link-btn" onClick={() => handleDelete(u._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </div>
  );
};

export default Users;
