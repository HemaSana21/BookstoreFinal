const Wishlist = require('../models/Wishlist');
const Book = require('../models/Book');

exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('books');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, books: [] });
    }
    res.json({ success: true, wishlist });
  } catch (error) {
    next(error);
  }
};

exports.addToWishlist = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) wishlist = new Wishlist({ user: req.user._id, books: [] });

    if (!wishlist.books.includes(bookId)) {
      wishlist.books.push(bookId);
      await wishlist.save();
    }
    await wishlist.populate('books');
    res.json({ success: true, message: 'Added to wishlist', wishlist });
  } catch (error) {
    next(error);
  }
};

exports.removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) return res.status(404).json({ success: false, message: 'Wishlist not found' });

    wishlist.books = wishlist.books.filter((id) => id.toString() !== req.params.bookId);
    await wishlist.save();
    await wishlist.populate('books');
    res.json({ success: true, message: 'Removed from wishlist', wishlist });
  } catch (error) {
    next(error);
  }
};
