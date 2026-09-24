const mongoose = require('mongoose');
const passwordPlugin = require('../shared/passwordPlugin');

// The "Admin" actor from the spec: oversees the whole platform - users,
// sellers, books, categories and orders. Admin accounts are seeded/created
// by an existing admin only; there is no public admin signup endpoint.
const adminSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    profilePicture: { type: String, default: '' },
    superAdmin: { type: Boolean, default: false }
  },
  { timestamps: true }
);

passwordPlugin(adminSchema);

adminSchema.statics.actorType = 'admin';

module.exports = mongoose.model('Admin', adminSchema);
