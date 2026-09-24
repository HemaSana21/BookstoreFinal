const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', getCategories);
router.post('/', verifyToken, requireRole('admin'), createCategory);
router.put('/:id', verifyToken, requireRole('admin'), updateCategory);
router.delete('/:id', verifyToken, requireRole('admin'), deleteCategory);

module.exports = router;
