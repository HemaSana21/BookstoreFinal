const express = require('express');
const router = express.Router();
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlistController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.use(verifyToken, requireRole('user'));
router.get('/', getWishlist);
router.post('/add', addToWishlist);
router.delete('/remove/:bookId', removeFromWishlist);

module.exports = router;
