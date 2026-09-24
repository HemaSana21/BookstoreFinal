const Book = require('../models/Book');
const Review = require('../models/Review');

// Public catalog reads only. Write operations (create/update/delete) live in
// SellerControllers.js (sellers manage their own listings) and
// AdminControllers.js (admin can override/remove any listing) - see spec:
// "Seller ... Book Listing" and "Admin ... Book Management".

// @desc    Get all books with search, filter, sort, pagination
// @route   GET /api/books
exports.getBooks = async (req, res, next) => {
  try {
    const {
      search,
      category,
      language,
      minPrice,
      maxPrice,
      minRating,
      sort,
      page = 1,
      limit = 12,
      bestSeller,
      newArrival
    } = req.query;

    const query = { status: 'active' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { authorNames: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.categories = category;
    if (language) query.language = language;
    if (minRating) query.rating = { $gte: Number(minRating) };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (bestSeller === 'true') query.isBestSeller = true;
    if (newArrival === 'true') query.isNewArrival = true;

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'latest') sortOption = { createdAt: -1 };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [books, total] = await Promise.all([
      Book.find(query)
        .populate('categories', 'name slug')
        .populate('authors', 'name')
        .populate('seller', 'businessName')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Book.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: books.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      books
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single book + reviews + related books
// @route   GET /api/books/:id
exports.getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('categories', 'name slug')
      .populate('authors', 'name bio')
      .populate('seller', 'businessName rating');
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const reviews = await Review.find({ book: book._id }).populate('user', 'fullName profilePicture');
    const relatedBooks = await Book.find({
      categories: { $in: book.categories },
      _id: { $ne: book._id },
      status: 'active'
    }).limit(6);

    res.json({ success: true, book, reviews, relatedBooks });
  } catch (error) {
    next(error);
  }
};
