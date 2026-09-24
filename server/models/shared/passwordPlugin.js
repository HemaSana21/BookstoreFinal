const bcrypt = require('bcryptjs');

/**
 * Shared Mongoose plugin: adds password hashing + comparison + safe-serialization
 * to any schema with a `password` field. Used by Users/User, Seller/Seller and
 * Admin/Admin so all three actor models share identical auth behaviour.
 */
function passwordPlugin(schema) {
  schema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });

  schema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  schema.methods.toSafeObject = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpire;
    return obj;
  };
}

module.exports = passwordPlugin;
