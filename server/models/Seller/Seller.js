const mongoose = require('mongoose');
const passwordPlugin = require('../shared/passwordPlugin');

const addressSchema = new mongoose.Schema(
  {
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  { _id: false }
);

// The "Seller" actor from the spec: registers a business account, lists books,
// and fulfills orders placed against their own catalog.
const sellerSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true, minlength: 6 },
    gstNumber: { type: String, default: '' },
    address: addressSchema,
    profilePicture: { type: String, default: '' },
    // New sellers wait for an admin to approve them before they can list books
    // (spec: "Admin ... Approve new seller accounts").
    approvalStatus: { type: String, enum: ['pending', 'approved', 'blocked'], default: 'pending' },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  { timestamps: true }
);

passwordPlugin(sellerSchema);

sellerSchema.statics.actorType = 'seller';

module.exports = mongoose.model('Seller', sellerSchema);
