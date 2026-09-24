const express = require('express');
const router = express.Router();
const {
  login,
  getMe,
  createAdmin,
  getAllUsers,
  deleteUser,
  updateUserStatus,
  getAllSellers,
  approveSeller,
  blockSeller,
  deleteSeller,
  getAllBooksAdmin,
  createBookAdmin,
  updateBookAdmin,
  deleteBookAdmin,
  getDashboardStats
} = require('../controllers/AdminControllers');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Public (no admin self-signup - see AdminControllers.js header comment)
router.post('/login', login);

// Protected (Admin only)
router.use(verifyToken, requireRole('admin'));
router.get('/me', getMe);
router.post('/create', createAdmin);
router.get('/stats', getDashboardStats);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/status', updateUserStatus);

router.get('/sellers', getAllSellers);
router.put('/sellers/:id/approve', approveSeller);
router.put('/sellers/:id/block', blockSeller);
router.delete('/sellers/:id', deleteSeller);

router.get('/books', getAllBooksAdmin);
router.post('/books', upload.single('coverImage'), createBookAdmin);
router.put('/books/:id', upload.single('coverImage'), updateBookAdmin);
router.delete('/books/:id', deleteBookAdmin);

module.exports = router;
