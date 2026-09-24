const express = require('express');
const router = express.Router();
const {
  createReview,
  updateReview,
  deleteReview,
  getAllReviews
} = require('../controllers/reviewController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, requireRole('admin'), getAllReviews);
router.post('/', verifyToken, requireRole('user'), createReview);
router.put('/:id', verifyToken, requireRole('user'), updateReview);
router.delete('/:id', verifyToken, requireRole('user', 'admin'), deleteReview);

module.exports = router;
