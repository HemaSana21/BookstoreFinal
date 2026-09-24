const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  addBook,
  updateBook,
  deleteBook,
  getMyProducts,
  getMyOrders,
  updateFulfillmentStatus,
  getDashboardStats
} = require('../controllers/SellerControllers');
const { verifyToken, requireApprovedSeller } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Public
router.post('/register', register);
router.post('/login', login);

// Protected (Seller only)
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, upload.single('profilePicture'), updateProfile);

// Requires an *approved* seller account (spec: admin approves new sellers first)
router.get('/stats', verifyToken, requireApprovedSeller, getDashboardStats);
router.get('/my-products', verifyToken, requireApprovedSeller, getMyProducts);
router.post('/books', verifyToken, requireApprovedSeller, upload.single('coverImage'), addBook);
router.put('/books/:id', verifyToken, requireApprovedSeller, upload.single('coverImage'), updateBook);
router.delete('/books/:id', verifyToken, requireApprovedSeller, deleteBook);
router.get('/orders', verifyToken, requireApprovedSeller, getMyOrders);
router.put('/orders/:orderId/items/:bookId/status', verifyToken, requireApprovedSeller, updateFulfillmentStatus);

module.exports = router;
