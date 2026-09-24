const mongoose = require('mongoose');

// Realizes the spec's Book<->Inventory one-to-many relationship: a book can
// have multiple inventory batches (different warehouse/condition), each of
// which belongs to exactly one book. Book.stock is kept as a fast-read
// aggregate (sum of quantities here) so cart/checkout logic doesn't need to
// re-aggregate on every request.
const inventorySchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    location: { type: String, default: 'Main Warehouse' },
    condition: { type: String, enum: ['new', 'like_new', 'used'], default: 'new' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inventory', inventorySchema);
