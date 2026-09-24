const Cart = require('../models/Cart');
const Book = require('../models/Book');

const COUPONS = {
  BOOK10: 10,
  WELCOME50: 50
};

const buildCartSummary = async (cart) => {
  const populatedCart = await cart.populate('items.book');
  let subtotal = 0;
  const items = populatedCart.items
    .filter((item) => item.book) // guard against deleted books
    .map((item) => {
      const finalPrice = +(item.book.price - (item.book.price * item.book.discount) / 100).toFixed(2);
      const lineTotal = +(finalPrice * item.quantity).toFixed(2);
      subtotal += lineTotal;
      return {
        book: item.book,
        quantity: item.quantity,
        lineTotal
      };
    });

  let discount = 0;
  if (cart.couponCode && COUPONS[cart.couponCode]) {
    discount = +((subtotal * COUPONS[cart.couponCode]) / 100).toFixed(2);
  }

  const afterDiscount = subtotal - discount;
  const gst = +(afterDiscount * 0.05).toFixed(2); // 5% GST
  const deliveryCharge = afterDiscount > 500 || afterDiscount === 0 ? 0 : 49;
  const grandTotal = +(afterDiscount + gst + deliveryCharge).toFixed(2);

  return {
    items,
    couponCode: cart.couponCode,
    subtotal: +subtotal.toFixed(2),
    discount,
    gst,
    deliveryCharge,
    grandTotal
  };
};

exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    const summary = await buildCartSummary(cart);
    res.json({ success: true, cart: summary });
  } catch (error) {
    next(error);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { bookId, quantity = 1 } = req.body;
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if (book.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Not enough stock available' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const existingItem = cart.items.find((item) => item.book.toString() === bookId);
    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({ book: bookId, quantity });
    }
    await cart.save();

    const summary = await buildCartSummary(cart);
    res.json({ success: true, message: 'Added to cart', cart: summary });
  } catch (error) {
    next(error);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { bookId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.find((i) => i.book.toString() === bookId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not in cart' });

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.book.toString() !== bookId);
    } else {
      item.quantity = quantity;
    }
    await cart.save();
    const summary = await buildCartSummary(cart);
    res.json({ success: true, cart: summary });
  } catch (error) {
    next(error);
  }
};

exports.removeCartItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter((i) => i.book.toString() !== req.params.bookId);
    await cart.save();
    const summary = await buildCartSummary(cart);
    res.json({ success: true, message: 'Item removed', cart: summary });
  } catch (error) {
    next(error);
  }
};

exports.applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!COUPONS[code]) {
      return res.status(400).json({ success: false, message: 'Invalid coupon code' });
    }
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.couponCode = code;
    await cart.save();
    const summary = await buildCartSummary(cart);
    res.json({ success: true, message: `Coupon applied: ${COUPONS[code]}% off`, cart: summary });
  } catch (error) {
    next(error);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], couponCode: '' });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};

exports._buildCartSummary = buildCartSummary;
