const jwt = require('jsonwebtoken');
const User = require('../models/Users/User');
const Seller = require('../models/Seller/Seller');
const Admin = require('../models/Admin/Admin');

const MODELS = { user: User, seller: Seller, admin: Admin };

// Every JWT is signed with { id, actorType } where actorType is one of
// 'user' | 'seller' | 'admin'. This single middleware verifies the token,
// loads the matching actor from the right collection, and exposes it as
// req.actor / req.actorType (plus req.user as an alias for the 'user' case,
// kept for backwards compatibility with existing feature controllers).
const verifyToken = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const Model = MODELS[decoded.actorType];
    if (!Model) {
      return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
    }

    const actor = await Model.findById(decoded.id);
    if (!actor) {
      return res.status(401).json({ success: false, message: 'Account no longer exists' });
    }
    if (actor.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended' });
    }
    if (actor.approvalStatus === 'blocked') {
      return res.status(403).json({ success: false, message: 'Your seller account has been blocked' });
    }

    req.actor = actor;
    req.actorType = decoded.actorType;
    if (decoded.actorType === 'user') req.user = actor;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
  }
};

// Restricts a route to one or more actor types, e.g. requireRole('admin')
// or requireRole('user', 'admin').
const requireRole = (...roles) => (req, res, next) => {
  if (req.actorType && roles.includes(req.actorType)) return next();
  return res.status(403).json({ success: false, message: `Access restricted to: ${roles.join(', ')}` });
};

// A seller must be approved by an admin before touching seller-only routes.
const requireApprovedSeller = (req, res, next) => {
  if (req.actorType !== 'seller') {
    return res.status(403).json({ success: false, message: 'Seller access required' });
  }
  if (req.actor.approvalStatus !== 'approved') {
    return res.status(403).json({
      success: false,
      message:
        req.actor.approvalStatus === 'pending'
          ? 'Your seller account is awaiting admin approval'
          : 'Your seller account has been blocked'
    });
  }
  next();
};

module.exports = {
  verifyToken,
  requireRole,
  requireApprovedSeller,
  protect: verifyToken, // back-compat alias for existing feature controllers
  adminOnly: requireRole('admin')
};
