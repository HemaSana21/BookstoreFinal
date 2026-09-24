const Author = require('../models/Author');
const Inventory = require('../models/Inventory');
const Book = require('../models/Book');

// Accepts an array of author names (strings) coming from a form, finds or
// creates the matching Author documents, and returns their ObjectIds plus
// a denormalized display string. Keeps the Book<->Author M:M relationship
// (WrittenBy) in sync without the client ever needing to know Author ids.
async function resolveAuthors(authorNames = []) {
  const names = (Array.isArray(authorNames) ? authorNames : String(authorNames).split(','))
    .map((n) => n.trim())
    .filter(Boolean);

  const authorDocs = await Promise.all(
    names.map((name) =>
      Author.findOneAndUpdate({ name }, { $setOnInsert: { name } }, { new: true, upsert: true })
    )
  );

  return {
    authorIds: authorDocs.map((a) => a._id),
    authorNames: authorDocs.map((a) => a.name).join(', ')
  };
}

// Creates (or tops up) an Inventory batch for a book/seller and keeps
// Book.stock as the aggregate of all its Inventory documents.
async function upsertInventoryAndSyncStock({ bookId, sellerId, quantity, location, condition }) {
  await Inventory.create({
    book: bookId,
    seller: sellerId,
    quantity,
    location: location || 'Main Warehouse',
    condition: condition || 'new'
  });
  await syncBookStock(bookId);
}

async function syncBookStock(bookId) {
  const agg = await Inventory.aggregate([
    { $match: { book: bookId } },
    { $group: { _id: '$book', total: { $sum: '$quantity' } } }
  ]);
  const total = agg[0]?.total || 0;
  await Book.findByIdAndUpdate(bookId, { stock: total });
  return total;
}

module.exports = { resolveAuthors, upsertInventoryAndSyncStock, syncBookStock };
