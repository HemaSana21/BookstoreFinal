const crypto = require('crypto');
const User = require('../models/Users/User');
const Order = require('../models/Order');
const Interaction = require('../models/Interaction');
const generateToken = require('../utils/generateToken');

// --------------------------------------------------------------------------
// This controller covers the "User" actor from the spec: Registration,
// Profile Management, Book Browsing (delegated to bookController for the
// actual catalog data), and Logout (client-side token discard).
// --------------------------------------------------------------------------

// @desc    Register a new user (reader/customer)
// @route   POST /api/users/register
exports.register = async (req, res, next) => {
  try {
    const { fullName, email, mobile, password, confirmPassword } = req.body;

    if (!fullName || !email || !mobile || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const user = await User.create({ fullName, email, mobile, password });
    const token = generateToken(user._id, 'user');

    res.status(201).json({ success: true, token, user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/users/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, 'user');
    res.json({ success: true, token, user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged-in user
// @route   GET /api/users/me
exports.getMe = async (req, res, next) => {
  res.json({ success: true, user: req.user.toSafeObject() });
};

// @desc    Update own profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, mobile, address } = req.body;
    const user = await User.findById(req.user._id);

    if (fullName) user.fullName = fullName;
    if (mobile) user.mobile = mobile;
    if (address) user.address = { ...(user.address?.toObject?.() || {}), ...address };
    if (req.file) user.profilePicture = `/uploads/${req.file.filename}`;

    await user.save();
    res.json({ success: true, user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order history for current user
// @route   GET /api/users/order-history
exports.getOrderHistory = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password - generates a reset token
// @route   POST /api/users/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) {
      return res.json({
        success: true,
        message: 'If that email is registered, a reset link/token has been generated.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Password reset token generated. In production this is sent via email.',
      resetToken
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using token
// @route   POST /api/users/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id, 'user');
    res.json({ success: true, message: 'Password reset successful', token });
  } catch (error) {
    next(error);
  }
};

// @desc    Record/update a user's reading interaction with a book
//          (want_to_read / reading / completed + progress %)
// @route   PUT /api/users/interactions/:bookId
exports.setInteraction = async (req, res, next) => {
  try {
    const { status, progressPercent } = req.body;
    const interaction = await Interaction.findOneAndUpdate(
      { user: req.user._id, book: req.params.bookId },
      {
        ...(status && { status }),
        ...(progressPercent !== undefined && { progressPercent }),
        lastInteractedAt: new Date()
      },
      { new: true, upsert: true }
    );
    res.json({ success: true, interaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all of a user's book interactions (their "shelf")
// @route   GET /api/users/interactions
exports.getMyInteractions = async (req, res, next) => {
  try {
    const interactions = await Interaction.find({ user: req.user._id })
      .populate('book', 'title coverImage authors')
      .sort({ lastInteractedAt: -1 });
    res.json({ success: true, interactions });
  } catch (error) {
    next(error);
  }
};
