const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    // Book <-> Author is many-to-many ("WrittenBy" in the spec). Modeled as
    // a ref array here, which is the idiomatic Mongo equivalent of a join
    // table (a book can list several Author documents; the same Author can
    // be referenced from many books).
    authors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true }],
    // Denormalized, human-readable copy of author names kept in sync on
    // save so search/sort/display don't need an extra populate + join.
    authorNames: { type: String, trim: true, default: '' },

    description: { type: String, required: true },

    // Book <-> Category is many-to-many ("CategorizedAs" in the spec).
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }],

    // Which seller listed this book (Seller <-> Book is one-to-many: a
    // seller can list many books, each book belongs to one seller).
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },

    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    language: { type: String, default: 'English' },
    publisher: { type: String, default: '' },

    // Fast-read aggregate, kept in sync with the sum of this book's
    // Inventory documents (see models/Inventory.js) whenever inventory
    // changes, so catalog/cart/checkout can read it without an extra join.
    stock: { type: Number, required: true, default: 0 },

    isbn: { type: String, required: true, unique: true },
    pages: { type: Number, default: 0 },
    coverImage: { type: String, default: '/uploads/default-book.png' },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'removed'], default: 'active' }
  },
  { timestamps: true }
);

bookSchema.virtual('finalPrice').get(function () {
  return +(this.price - (this.price * this.discount) / 100).toFixed(2);
});

bookSchema.set('toJSON', { virtuals: true });
bookSchema.set('toObject', { virtuals: true });

// language_override avoids colliding with our own `language` field (e.g. "Telugu"),
// which is not a valid MongoDB text-search language value.
bookSchema.index(
  { title: 'text', authorNames: 'text', description: 'text' },
  { language_override: 'textIndexLanguage' }
);

module.exports = mongoose.model('Book', bookSchema);
