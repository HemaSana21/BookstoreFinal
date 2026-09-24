const Order = require('../models/Order');
const Book = require('../models/Book');
const Cart = require('../models/Cart');
const { _buildCartSummary } = require('./cartController');

// @desc    Place an order from the current cart
// @route   POST /api/orders
exports.placeOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.line1) {
      return res.status(400).json({ success: false, message: 'Shipping address is required' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    const summary = await _buildCartSummary(cart);
    if (summary.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // Validate stock and decrement
    for (const item of summary.items) {
      const book = await Book.findById(item.book._id);
      if (!book || book.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${item.book.title}"`
        });
      }
    }
    for (const item of summary.items) {
      await Book.findByIdAndUpdate(item.book._id, { $inc: { stock: -item.quantity } });
    }

    const order = await Order.create({
      user: req.user._id,
      items: summary.items.map((i) => ({
        book: i.book._id,
        seller: i.book.seller,
        title: i.book.title,
        coverImage: i.book.coverImage,
        price: i.book.price,
        quantity: i.quantity
      })),
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'COD' ? 'pending' : 'paid',
      subtotal: summary.subtotal,
      discount: summary.discount,
      gst: summary.gst,
      deliveryCharge: summary.deliveryCharge,
      grandTotal: summary.grandTotal
    });

    // Clear cart after order
    cart.items = [];
    cart.couponCode = '';
    await cart.save();

    res.status(201).json({ success: true, message: 'Order placed successfully', order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my-orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order (invoice/tracking)
// @route   GET /api/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'fullName email mobile');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const isOwner = req.actorType === 'user' && order.user._id.toString() === req.actor._id.toString();
    const isAdmin = req.actorType === 'admin';
    const isFulfillingSeller =
      req.actorType === 'seller' && order.items.some((i) => i.seller.toString() === req.actor._id.toString());

    if (!isOwner && !isAdmin && !isFulfillingSeller) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel own order
// @route   PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (['Shipped', 'Delivered', 'Cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled once it is ${order.status}`
      });
    }

    order.status = 'Cancelled';
    order.cancelReason = (reason || '').toString().slice(0, 300);
    await order.save();

    // Restock
    for (const item of order.items) {
      await Book.findByIdAndUpdate(item.book, { $inc: { stock: item.quantity } });
    }

    res.json({ success: true, message: 'Order cancelled', order });
  } catch (error) {
    next(error);
  }
};

// ---------- Admin ----------

// @desc    Get all orders (Admin)
// @route   GET /api/orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const orders = await Order.find(query).populate('user', 'fullName email').sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    next(error);
  }
};
