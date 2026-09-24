const mongoose = require('mongoose');
const passwordPlugin = require('../shared/passwordPlugin');

const addressSchema = new mongoose.Schema(
  {
    fullName: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  { _id: false }
);

// The "User" actor from the spec: a registered reader/customer of BookStore.
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true, minlength: 6 },
    profilePicture: { type: String, default: '' },
    address: addressSchema,
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  { timestamps: true }
);

passwordPlugin(userSchema);

// Constant used when signing/verifying JWTs and by authMiddleware to route
// a decoded token to the right collection.
userSchema.statics.actorType = 'user';

module.exports = mongoose.model('User', userSchema);
