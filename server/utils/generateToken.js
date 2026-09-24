const jwt = require('jsonwebtoken');

// Signs a JWT for any of the three actor types (user/seller/admin). The
// actorType claim is what authMiddleware uses to know which collection to
// look the id up in.
const generateToken = (id, actorType) =>
  jwt.sign({ id, actorType }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });

module.exports = generateToken;
