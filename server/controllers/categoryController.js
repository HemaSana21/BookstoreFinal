const Category = require('../models/Category');
const Book = require('../models/Book');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const slug = name.toLowerCase().trim().replace(/\s+/g, '-');
    const category = await Category.create({ name, slug, description });
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (updateData.name) {
      updateData.slug = updateData.name.toLowerCase().trim().replace(/\s+/g, '-');
    }
    const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const bookCount = await Book.countDocuments({ categories: req.params.id });
    if (bookCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${bookCount} book(s) are assigned to this category`
      });
    }
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};
