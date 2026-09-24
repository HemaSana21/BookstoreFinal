const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  getOrderHistory,
  forgotPassword,
  resetPassword,
  setInteraction,
  getMyInteractions
} = require('../controllers/UsersController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Public
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected (User only)
router.use(verifyToken, requireRole('user'));
router.get('/me', getMe);
router.put('/profile', upload.single('profilePicture'), updateProfile);
router.get('/order-history', getOrderHistory);
router.get('/interactions', getMyInteractions);
router.put('/interactions/:bookId', setInteraction);

module.exports = router;
