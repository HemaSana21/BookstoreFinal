import React from 'react';

// Generic confirm dialog used wherever an action needs a "are you sure?"
// step — logout across all three portals, destructive actions, etc.
// Pass `children` to embed extra fields (e.g. a cancellation-reason form).
const ConfirmModal = ({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  tone = 'default',
  onConfirm,
  onCancel,
  children
}) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className={`modal-content confirm-modal confirm-modal-${tone}`} onClick={(e) => e.stopPropagation()}>
      <div className="confirm-modal-icon">{tone === 'danger' ? '⚠️' : '👋'}</div>
      <h3>{title}</h3>
      {message && <p className="confirm-modal-message">{message}</p>}
      {children}
      <div className="confirm-modal-actions">
        <button type="button" className="btn-ghost-outline" onClick={onCancel}>{cancelText}</button>
        <button
          type="button"
          className={tone === 'danger' ? 'btn-danger' : 'btn-primary'}
          onClick={onConfirm}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmModal;
