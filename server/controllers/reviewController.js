const Review = require('../models/Review');
const Book = require('../models/Book');

const recalculateBookRating = async (bookId) => {
  const reviews = await Review.find({ book: bookId });
  const numReviews = reviews.length;
  const rating = numReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews : 0;
  await Book.findByIdAndUpdate(bookId, { rating: +rating.toFixed(1), numReviews });
};

// @desc    Add a review
// @route   POST /api/reviews
exports.createReview = async (req, res, next) => {
  try {
    const { bookId, rating, comment } = req.body;
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    const existing = await Review.findOne({ book: bookId, user: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this book' });
    }

    const review = await Review.create({ book: bookId, user: req.user._id, rating, comment });
    await recalculateBookRating(bookId);

    const populated = await review.populate('user', 'fullName profilePicture');
    res.status(201).json({ success: true, review: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update own review
// @route   PUT /api/reviews/:id
exports.updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this review' });
    }

    const { rating, comment } = req.body;
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    await review.save();
    await recalculateBookRating(review.book);

    res.json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete own review (or admin deleting offensive review)
// @route   DELETE /api/reviews/:id
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    const isOwner = req.actorType === 'user' && review.user.toString() === req.actor._id.toString();
    if (!isOwner && req.actorType !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const bookId = review.book;
    await review.deleteOne();
    await recalculateBookRating(bookId);

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews (Admin - for moderation)
// @route   GET /api/reviews
exports.getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'fullName email')
      .populate('book', 'title')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};
