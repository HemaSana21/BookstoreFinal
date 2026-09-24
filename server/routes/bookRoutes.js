const express = require('express');
const router = express.Router();
const { getBooks, getBookById } = require('../controllers/bookController');

// Public catalog only. Writes happen via /api/sellers/books (seller-owned
// listings) and /api/admin/books (admin override) - see SellerControllers.js
// and AdminControllers.js.
router.get('/', getBooks);
router.get('/:id', getBookById);

module.exports = router;
