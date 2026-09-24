const mongoose = require('mongoose');

// Realizes the spec's Book<->Author many-to-many relationship ("WrittenBy").
// In MongoDB the idiomatic way to model M:M is a ref array on one side
// (Book.authors) rather than a physical join collection - Book.authors
// below plays that role, and this collection is the "many" side referenced.
const authorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    bio: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Author', authorSchema);
