const Admin = require('../models/Admin/Admin');
const User = require('../models/Users/User');
const Seller = require('../models/Seller/Seller');
const Book = require('../models/Book');
const Order = require('../models/Order');
const generateToken = require('../utils/generateToken');

// --------------------------------------------------------------------------
// This controller covers the "Admin" actor from the spec: System Management,
// User Management, Book Management, and Seller Management. There is no
// public admin registration route - the first admin is created by the seed
// script, and further admins can only be created by an already logged-in
// admin (exports.createAdmin below), matching src/Admin/Asignup.jsx being a
// protected in-app page rather than a public signup form.
// --------------------------------------------------------------------------

// @desc    Admin login
// @route   POST /api/admin/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(admin._id, 'admin');
    res.json({ success: true, token, admin: admin.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged-in admin
// @route   GET /api/admin/me
exports.getMe = async (req, res, next) => {
  res.json({ success: true, admin: req.actor.toSafeObject() });
};

// @desc    Create a new admin account (only an existing admin can do this)
// @route   POST /api/admin/create
exports.createAdmin = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }
    const admin = await Admin.create({ fullName, email, password });
    res.status(201).json({ success: true, admin: admin.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// ---------- User Management ----------

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user (Admin)
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend/Activate a user (Admin)
// @route   PUT /api/admin/users/:id/status
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: `User ${status}`, user });
  } catch (error) {
    next(error);
  }
};

// ---------- Seller Management ----------

// @desc    Get all sellers (Admin)
// @route   GET /api/admin/sellers
exports.getAllSellers = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = status ? { approvalStatus: status } : {};
    const sellers = await Seller.find(query).select('-password');
    res.json({ success: true, sellers });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a pending seller (Admin)
// @route   PUT /api/admin/sellers/:id/approve
exports.approveSeller = async (req, res, next) => {
  try {
    const seller = await Seller.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: 'approved' },
      { new: true }
    ).select('-password');
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });
    res.json({ success: true, message: 'Seller approved', seller });
  } catch (error) {
    next(error);
  }
};

// @desc    Block a seller (Admin)
// @route   PUT /api/admin/sellers/:id/block
exports.blockSeller = async (req, res, next) => {
  try {
    const seller = await Seller.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: 'blocked' },
      { new: true }
    ).select('-password');
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });
    res.json({ success: true, message: 'Seller blocked', seller });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a seller (Admin)
// @route   DELETE /api/admin/sellers/:id
exports.deleteSeller = async (req, res, next) => {
  try {
    const seller = await Seller.findByIdAndDelete(req.params.id);
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });
    await Book.updateMany({ seller: seller._id }, { status: 'removed' });
    res.json({ success: true, message: 'Seller deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ---------- Book Management (override any seller's listing) ----------

// @desc    Get every book, including removed ones (Admin)
// @route   GET /api/admin/books
exports.getAllBooksAdmin = async (req, res, next) => {
  try {
    const books = await Book.find()
      .populate('authors', 'name')
      .populate('categories', 'name')
      .populate('seller', 'businessName')
      .sort({ createdAt: -1 });
    res.json({ success: true, books });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin can directly create a book (e.g. on behalf of a seller, or house stock)
// @route   POST /api/admin/books
exports.createBookAdmin = async (req, res, next) => {
  try {
    const { resolveAuthors, upsertInventoryAndSyncStock } = require('../utils/bookHelpers');
    const { title, authors, description, categories, seller, price, discount, language, publisher, isbn, pages, quantity } =
      req.body;

    if (!title || !authors || !description || !categories || !seller || !price || !isbn) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const categoryIds = Array.isArray(categories) ? categories : String(categories).split(',').filter(Boolean);
    const { authorIds, authorNames } = await resolveAuthors(authors);

    const book = await Book.create({
      title,
      authors: authorIds,
      authorNames,
      description,
      categories: categoryIds,
      seller,
      price,
      discount: discount || 0,
      language: language || 'English',
      publisher: publisher || '',
      isbn,
      pages: pages || 0,
      stock: 0,
      coverImage: req.file ? `/uploads/${req.file.filename}` : undefined
    });

    if (quantity) {
      await upsertInventoryAndSyncStock({ bookId: book._id, sellerId: seller, quantity: Number(quantity) });
    }

    res.status(201).json({ success: true, book });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin edits any book
// @route   PUT /api/admin/books/:id
exports.updateBookAdmin = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (updateData.categories) {
      updateData.categories = Array.isArray(updateData.categories)
        ? updateData.categories
        : String(updateData.categories).split(',').filter(Boolean);
    }
    if (updateData.authors) {
      const { resolveAuthors } = require('../utils/bookHelpers');
      const { authorIds, authorNames } = await resolveAuthors(updateData.authors);
      updateData.authors = authorIds;
      updateData.authorNames = authorNames;
    }
    if (req.file) updateData.coverImage = `/uploads/${req.file.filename}`;

    const book = await Book.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, book });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin removes any book
// @route   DELETE /api/admin/books/:id
exports.deleteBookAdmin = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, { status: 'removed' }, { new: true });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, message: 'Book removed' });
  } catch (error) {
    next(error);
  }
};

// ---------- Dashboard ----------

// @desc    Dashboard statistics (Admin)
// @route   GET /api/admin/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalSellers, pendingSellers, totalBooks, totalOrders, orders] = await Promise.all([
      User.countDocuments(),
      Seller.countDocuments({ approvalStatus: 'approved' }),
      Seller.countDocuments({ approvalStatus: 'pending' }),
      Book.countDocuments({ status: 'active' }),
      Order.countDocuments(),
      Order.find({ status: { $ne: 'Cancelled' } })
    ]);

    const revenue = orders.reduce((sum, o) => sum + o.grandTotal, 0);
    const ordersByStatus = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$grandTotal' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalSellers,
        pendingSellers,
        totalBooks,
        totalOrders,
        revenue: +revenue.toFixed(2),
        ordersByStatus,
        monthlyRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};
