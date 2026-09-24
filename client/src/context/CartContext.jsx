import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { isUser } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, discount: 0, gst: 0, deliveryCharge: 0, grandTotal: 0 });

  const fetchCart = useCallback(async () => {
    if (!isUser) return;
    try {
      const res = await api.get('/cart');
      setCart(res.data.cart);
    } catch (err) {
      // silent fail on load
    }
  }, [isUser]);

  const addToCart = async (bookId, quantity = 1) => {
    try {
      const res = await api.post('/cart/add', { bookId, quantity });
      setCart(res.data.cart);
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const updateQuantity = async (bookId, quantity) => {
    try {
      const res = await api.put('/cart/update', { bookId, quantity });
      setCart(res.data.cart);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update cart');
    }
  };

  const removeItem = async (bookId) => {
    try {
      const res = await api.delete(`/cart/remove/${bookId}`);
      setCart(res.data.cart);
      toast.info('Item removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove item');
    }
  };

  const applyCoupon = async (code) => {
    try {
      const res = await api.post('/cart/coupon', { code });
      setCart(res.data.cart);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    }
  };

  const clearCartState = () => setCart({ items: [], subtotal: 0, discount: 0, gst: 0, deliveryCharge: 0, grandTotal: 0 });

  return (
    <CartContext.Provider value={{ cart, fetchCart, addToCart, updateQuantity, removeItem, applyCoupon, clearCartState }}>
      {children}
    </CartContext.Provider>
  );
};
