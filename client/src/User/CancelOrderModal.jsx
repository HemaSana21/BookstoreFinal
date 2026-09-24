import React, { useState } from 'react';

const REASONS = [
  'Ordered by mistake',
  'Found a better price elsewhere',
  'Delivery is taking too long',
  'Changed my mind',
  'Item / address details are wrong',
  'Other'
];

// Asks *why* before cancelling, instead of a plain window.confirm(). The
// chosen reason is sent to the backend (Order.cancelReason) so sellers/admins
// can see it too.
const CancelOrderModal = ({ order, onConfirm, onClose, submitting }) => {
  const [reason, setReason] = useState(REASONS[0]);
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    const finalReason = reason === 'Other' ? note.trim() || 'Other' : reason;
    onConfirm(finalReason);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content confirm-modal confirm-modal-danger" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-icon">📦</div>
        <h3>Cancel Order #{order._id.slice(-8).toUpperCase()}?</h3>
        <p className="confirm-modal-message">This can't be undone. Tell us why — it helps us do better.</p>

        <div className="reason-options">
          {REASONS.map((r) => (
            <label key={r} className={`reason-pill ${reason === r ? 'selected' : ''}`}>
              <input
                type="radio"
                name="cancel-reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
              />
              {r}
            </label>
          ))}
        </div>

        {reason === 'Other' && (
          <textarea
            className="reason-note"
            placeholder="Tell us a bit more..."
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        )}

        <div className="confirm-modal-actions">
          <button type="button" className="btn-ghost-outline" onClick={onClose}>Keep Order</button>
          <button type="button" className="btn-danger" onClick={handleConfirm} disabled={submitting}>
            {submitting ? 'Cancelling...' : 'Confirm Cancellation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;
