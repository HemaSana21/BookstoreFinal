import React from 'react';
import { Link } from 'react-router-dom';

// One small illustration per context so empty screens still feel considered
// rather than a leftover placeholder. Add a new case + <svg> when a new
// page needs one.
const ILLUSTRATIONS = {
  orders: (
    <svg viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="60" r="54" fill="url(#g1)" opacity="0.14" />
      <rect x="34" y="40" width="52" height="44" rx="6" fill="#fff" stroke="#7C3AED" strokeWidth="2.5" />
      <path d="M34 52h52" stroke="#7C3AED" strokeWidth="2.5" />
      <path d="M46 40v-6a6 6 0 0 1 6-6h16a6 6 0 0 1 6 6v6" fill="none" stroke="#7C3AED" strokeWidth="2.5" />
      <circle cx="86" cy="80" r="12" fill="#F5B301" />
      <path d="M81 80l3.5 4L92 76" stroke="#14151A" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#4F46E5" /><stop offset="1" stopColor="#7C3AED" /></linearGradient></defs>
    </svg>
  ),
  cart: (
    <svg viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="60" r="54" fill="url(#g2)" opacity="0.14" />
      <path d="M32 38h8l8 44h38l7-30H46" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="52" cy="92" r="5.5" fill="#7C3AED" />
      <circle cx="82" cy="92" r="5.5" fill="#7C3AED" />
      <path d="M64 50l6 6 10-12" stroke="#F5B301" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0" />
      <defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#4F46E5" /><stop offset="1" stopColor="#7C3AED" /></linearGradient></defs>
    </svg>
  ),
  wishlist: (
    <svg viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="60" r="54" fill="url(#g3)" opacity="0.14" />
      <path d="M60 84S34 68 34 49a15 15 0 0 1 26-10 15 15 0 0 1 26 10c0 19-26 35-26 35z" fill="#fff" stroke="#DB2777" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M46 46l6 6 12-12" stroke="#F5B301" strokeWidth="0" fill="none" />
      <defs><linearGradient id="g3" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#DB2777" /><stop offset="1" stopColor="#7C3AED" /></linearGradient></defs>
    </svg>
  ),
  products: (
    <svg viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="60" r="54" fill="url(#g4)" opacity="0.14" />
      <rect x="30" y="34" width="60" height="52" rx="4" fill="#fff" stroke="#7C3AED" strokeWidth="2.5" />
      <path d="M60 34v52" stroke="#7C3AED" strokeWidth="2" opacity="0.5" />
      <path d="M38 46h14M38 56h14M68 46h14M68 56h14" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <circle cx="86" cy="34" r="11" fill="#F5B301" />
      <text x="86" y="38" textAnchor="middle" fontSize="12" fontWeight="700" fill="#14151A">+</text>
      <defs><linearGradient id="g4" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#4F46E5" /><stop offset="1" stopColor="#7C3AED" /></linearGradient></defs>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="60" r="54" fill="url(#g5)" opacity="0.14" />
      <circle cx="54" cy="54" r="22" fill="#fff" stroke="#4F46E5" strokeWidth="3" />
      <path d="M70 70l16 16" stroke="#4F46E5" strokeWidth="4" strokeLinecap="round" />
      <path d="M46 54h16" stroke="#F5B301" strokeWidth="3" strokeLinecap="round" />
      <defs><linearGradient id="g5" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#4F46E5" /><stop offset="1" stopColor="#7C3AED" /></linearGradient></defs>
    </svg>
  ),
  table: (
    <svg viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="60" r="54" fill="url(#g6)" opacity="0.14" />
      <rect x="30" y="42" width="60" height="34" rx="4" fill="#fff" stroke="#7C3AED" strokeWidth="2.5" />
      <path d="M30 54h60M52 42v34" stroke="#7C3AED" strokeWidth="2" opacity="0.5" />
      <defs><linearGradient id="g6" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#4F46E5" /><stop offset="1" stopColor="#7C3AED" /></linearGradient></defs>
    </svg>
  )
};

/**
 * variant: 'orders' | 'cart' | 'wishlist' | 'products' | 'search' | 'table'
 * title, message: copy
 * ctaText, ctaLink: optional call to action (rendered as a router Link)
 */
const EmptyState = ({ variant = 'table', title, message, ctaText, ctaLink }) => (
  <div className="empty-state">
    <div className="empty-state-art">{ILLUSTRATIONS[variant] || ILLUSTRATIONS.table}</div>
    <h3>{title}</h3>
    {message && <p>{message}</p>}
    {ctaText && ctaLink && (
      <Link to={ctaLink} className="btn-primary">{ctaText}</Link>
    )}
  </div>
);

export default EmptyState;
