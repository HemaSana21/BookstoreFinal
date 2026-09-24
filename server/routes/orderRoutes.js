const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.post('/', requireRole('user'), placeOrder);
router.get('/my-orders', requireRole('user'), getMyOrders);
router.get('/', requireRole('admin'), getAllOrders); // admin: list all
router.get('/:id', getOrderById); // owner, admin, or fulfilling seller (checked in controller)
router.put('/:id/cancel', requireRole('user'), cancelOrder);
router.put('/:id/status', requireRole('admin'), updateOrderStatus);

module.exports = router;
