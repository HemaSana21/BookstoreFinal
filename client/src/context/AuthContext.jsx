import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Single context that understands all three BookStore actors from the spec -
// User, Seller and Admin - each backed by its own collection/JWT claim
// (see server/middleware/authMiddleware.js). `actorType` tells the rest of
// the app which one is currently signed in.
const ME_ENDPOINTS = { user: '/users/me', seller: '/sellers/me', admin: '/admin/me' };

export const AuthProvider = ({ children }) => {
  const [actor, setActor] = useState(() => {
    const stored = localStorage.getItem('actor');
    return stored ? JSON.parse(stored) : null;
  });
  const [actorType, setActorType] = useState(() => localStorage.getItem('actorType') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedType = localStorage.getItem('actorType');
    if (token && storedType && ME_ENDPOINTS[storedType]) {
      api
        .get(ME_ENDPOINTS[storedType])
        .then((res) => {
          const data = res.data[storedType];
          setActor(data);
          localStorage.setItem('actor', JSON.stringify(data));
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('actorType');
          localStorage.removeItem('actor');
          setActor(null);
          setActorType(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const persistSession = (type, token, data) => {
    localStorage.setItem('token', token);
    localStorage.setItem('actorType', type);
    localStorage.setItem('actor', JSON.stringify(data));
    setActorType(type);
    setActor(data);
  };

  const loginUser = async (email, password) => {
    const res = await api.post('/users/login', { email, password });
    persistSession('user', res.data.token, res.data.user);
    return res.data.user;
  };

  const registerUser = async (payload) => {
    const res = await api.post('/users/register', payload);
    persistSession('user', res.data.token, res.data.user);
    return res.data.user;
  };

  const loginSeller = async (email, password) => {
    const res = await api.post('/sellers/login', { email, password });
    persistSession('seller', res.data.token, res.data.seller);
    return res.data.seller;
  };

  const registerSeller = async (payload) => {
    const res = await api.post('/sellers/register', payload);
    persistSession('seller', res.data.token, res.data.seller);
    return res.data;
  };

  const loginAdmin = async (email, password) => {
    const res = await api.post('/admin/login', { email, password });
    persistSession('admin', res.data.token, res.data.admin);
    return res.data.admin;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('actorType');
    localStorage.removeItem('actor');
    setActor(null);
    setActorType(null);
  };

  const refreshActor = async () => {
    if (!actorType) return;
    const res = await api.get(ME_ENDPOINTS[actorType]);
    const data = res.data[actorType];
    setActor(data);
    localStorage.setItem('actor', JSON.stringify(data));
  };

  return (
    <AuthContext.Provider
      value={{
        actor,
        actorType,
        setActor,
        loading,
        loginUser,
        registerUser,
        loginSeller,
        registerSeller,
        loginAdmin,
        logout,
        refreshActor,
        isUser: actorType === 'user',
        isSeller: actorType === 'seller',
        isAdmin: actorType === 'admin',
        // kept for any leftover code expecting the old shape
        user: actorType === 'user' ? actor : null
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
