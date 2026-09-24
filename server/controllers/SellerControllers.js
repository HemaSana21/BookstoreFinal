const Seller = require('../models/Seller/Seller');
const Book = require('../models/Book');
const Order = require('../models/Order');
const Review = require('../models/Review');
const generateToken = require('../utils/generateToken');
const { resolveAuthors, upsertInventoryAndSyncStock } = require('../utils/bookHelpers');

// --------------------------------------------------------------------------
// This controller covers the "Seller" actor from the spec: Registration,
// Profile Management, Book Listing, and Order Fulfillment.
// --------------------------------------------------------------------------

// @desc    Register a new seller (starts out "pending" until admin approval)
// @route   POST /api/sellers/register
exports.register = async (req, res, next) => {
  try {
    const { businessName, ownerName, email, mobile, password, confirmPassword, gstNumber, address } = req.body;

    if (!businessName || !ownerName || !email || !mobile || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existing = await Seller.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const seller = await Seller.create({ businessName, ownerName, email, mobile, password, gstNumber, address });
    const token = generateToken(seller._id, 'seller');

    res.status(201).json({
      success: true,
      token,
      seller: seller.toSafeObject(),
      message: 'Registration successful. Your account is pending admin approval before you can list books.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seller login
// @route   POST /api/sellers/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const seller = await Seller.findOne({ email: email.toLowerCase() });
    if (!seller) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (seller.approvalStatus === 'blocked') {
      return res.status(403).json({ success: false, message: 'Your seller account has been blocked' });
    }

    const isMatch = await seller.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(seller._id, 'seller');
    res.json({ success: true, token, seller: seller.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged-in seller
// @route   GET /api/sellers/me
exports.getMe = async (req, res, next) => {
  res.json({ success: true, seller: req.actor.toSafeObject() });
};

// @desc    Update own seller profile
// @route   PUT /api/sellers/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { businessName, ownerName, mobile, gstNumber, address } = req.body;
    const seller = await Seller.findById(req.actor._id);

    if (businessName) seller.businessName = businessName;
    if (ownerName) seller.ownerName = ownerName;
    if (mobile) seller.mobile = mobile;
    if (gstNumber !== undefined) seller.gstNumber = gstNumber;
    if (address) seller.address = { ...(seller.address?.toObject?.() || {}), ...address };
    if (req.file) seller.profilePicture = `/uploads/${req.file.filename}`;

    await seller.save();
    res.json({ success: true, seller: seller.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @desc    List a new book under this seller (spec: "Book Listing")
// @route   POST /api/sellers/books
exports.addBook = async (req, res, next) => {
  try {
    const {
      title,
      authors,
      description,
      categories,
      price,
      discount,
      language,
      publisher,
      quantity,
      isbn,
      pages,
      location,
      condition
    } = req.body;

    if (!title || !authors || !description || !categories || !price || !isbn || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'title, authors, description, categories, price, isbn and quantity are required'
      });
    }

    const categoryIds = Array.isArray(categories) ? categories : String(categories).split(',').filter(Boolean);
    const { authorIds, authorNames } = await resolveAuthors(authors);

    const book = await Book.create({
      title,
      authors: authorIds,
      authorNames,
      description,
      categories: categoryIds,
      seller: req.actor._id,
      price,
      discount: discount || 0,
      language: language || 'English',
      publisher: publisher || '',
      isbn,
      pages: pages || 0,
      stock: 0, // set by upsertInventoryAndSyncStock below
      coverImage: req.file ? `/uploads/${req.file.filename}` : undefined
    });

    await upsertInventoryAndSyncStock({
      bookId: book._id,
      sellerId: req.actor._id,
      quantity: Number(quantity),
      location,
      condition
    });

    const populated = await Book.findById(book._id).populate('authors', 'name').populate('categories', 'name');
    res.status(201).json({ success: true, book: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a book this seller owns
// @route   PUT /api/sellers/books/:id
exports.updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if (book.seller.toString() !== req.actor._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only edit your own listings' });
    }

    const updateData = { ...req.body };
    delete updateData.seller;
    delete updateData.quantity;

    if (updateData.categories) {
      updateData.categories = Array.isArray(updateData.categories)
        ? updateData.categories
        : String(updateData.categories).split(',').filter(Boolean);
    }
    if (updateData.authors) {
      const { authorIds, authorNames } = await resolveAuthors(updateData.authors);
      updateData.authors = authorIds;
      updateData.authorNames = authorNames;
    }
    if (req.file) updateData.coverImage = `/uploads/${req.file.filename}`;

    Object.assign(book, updateData);
    await book.save();

    // Adding more stock to an existing listing goes through Inventory too,
    // keeping Book.stock as the aggregate rather than being overwritten directly.
    if (req.body.quantity !== undefined) {
      await upsertInventoryAndSyncStock({
        bookId: book._id,
        sellerId: req.actor._id,
        quantity: Number(req.body.quantity),
        location: req.body.location,
        condition: req.body.condition
      });
    }

    const populated = await Book.findById(book._id).populate('authors', 'name').populate('categories', 'name');
    res.json({ success: true, book: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove (soft-delete) a book this seller owns
// @route   DELETE /api/sellers/books/:id
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if (book.seller.toString() !== req.actor._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only remove your own listings' });
    }
    book.status = 'removed';
    await book.save();
    res.json({ success: true, message: 'Listing removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get this seller's own book listings (spec: "My Products")
// @route   GET /api/sellers/my-products
exports.getMyProducts = async (req, res, next) => {
  try {
    const books = await Book.find({ seller: req.actor._id })
      .populate('authors', 'name')
      .populate('categories', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, books });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders containing this seller's books (spec: "Order Fulfillment")
// @route   GET /api/sellers/orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ 'items.seller': req.actor._id })
      .populate('user', 'fullName email mobile')
      .sort({ createdAt: -1 });

    // Only surface this seller's own line items per order
    const scoped = orders.map((order) => {
      const obj = order.toObject();
      obj.items = obj.items.filter((i) => i.seller.toString() === req.actor._id.toString());
      return obj;
    });

    res.json({ success: true, orders: scoped });
  } catch (error) {
    next(error);
  }
};

// @desc    Update the fulfillment status of this seller's line item in an order
// @route   PUT /api/sellers/orders/:orderId/items/:bookId/status
exports.updateFulfillmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const item = order.items.find(
      (i) => i.book.toString() === req.params.bookId && i.seller.toString() === req.actor._id.toString()
    );
    if (!item) return res.status(404).json({ success: false, message: 'Order item not found for this seller' });

    item.fulfillmentStatus = status;

    // If every item in the order has been shipped/delivered, roll that up
    // into the order's overall customer-facing status too.
    if (order.items.every((i) => i.fulfillmentStatus === 'Delivered')) order.status = 'Delivered';
    else if (order.items.some((i) => ['Shipped', 'Delivered'].includes(i.fulfillmentStatus))) order.status = 'Shipped';
    else if (order.items.some((i) => i.fulfillmentStatus === 'Processing')) order.status = 'Processing';

    await order.save();
    res.json({ success: true, message: 'Fulfillment status updated', order });
  } catch (error) {
    next(error);
  }
};

// @desc    Seller dashboard stats (spec: "Shome" / seller home with sales stats)
// @route   GET /api/sellers/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalBooks, orders, reviews] = await Promise.all([
      Book.countDocuments({ seller: req.actor._id, status: 'active' }),
      Order.find({ 'items.seller': req.actor._id }),
      Review.find({ book: { $in: await Book.find({ seller: req.actor._id }).distinct('_id') } })
    ]);

    let totalSales = 0;
    let unitsSold = 0;
    orders.forEach((order) => {
      order.items
        .filter((i) => i.seller.toString() === req.actor._id.toString())
        .forEach((i) => {
          totalSales += i.price * i.quantity;
          unitsSold += i.quantity;
        });
    });

    const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

    res.json({
      success: true,
      stats: {
        totalBooks,
        totalOrders: orders.length,
        unitsSold,
        totalSales: +totalSales.toFixed(2),
        avgRating: +avgRating.toFixed(1)
      }
    });
  } catch (error) {
    next(error);
  }
};
