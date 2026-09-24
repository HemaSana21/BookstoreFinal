const Author = require('../models/Author');

// @desc    List all authors (used for autocomplete on the Add Book form)
// @route   GET /api/authors
exports.getAuthors = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    const authors = await Author.find(query).sort({ name: 1 }).limit(50);
    res.json({ success: true, authors });
  } catch (error) {
    next(error);
  }
};
