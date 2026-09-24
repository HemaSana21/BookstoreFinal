const mongoose = require('mongoose');

// Realizes the spec's User<->Book many-to-many "Interaction" entity:
// tracks how a user is engaging with a book beyond just buying it
// (reading progress, shelf status) - separate from Review, which is
// specifically the rating/comment a user leaves.
const interactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    status: {
      type: String,
      enum: ['want_to_read', 'reading', 'completed'],
      default: 'want_to_read'
    },
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
    lastInteractedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

interactionSchema.index({ user: 1, book: 1 }, { unique: true });

module.exports = mongoose.model('Interaction', interactionSchema);
