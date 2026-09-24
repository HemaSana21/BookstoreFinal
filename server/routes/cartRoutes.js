const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  applyCoupon,
  clearCart
} = require('../controllers/cartController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.use(verifyToken, requireRole('user'));
router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/remove/:bookId', removeCartItem);
router.post('/coupon', applyCoupon);
router.delete('/clear', clearCart);

module.exports = router;
