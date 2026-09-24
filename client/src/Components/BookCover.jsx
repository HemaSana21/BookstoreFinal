import React, { useState } from 'react';
import { generateCoverDataUrl } from '../utils/coverGenerator';

const isPlaceholder = (src) => !src || src.includes('default-book.png');

// Drop-in replacement for a raw <img src={book.coverImage} /> that never
// shows a generic broken-image icon or dull placeholder: if the book has no
// real cover (or its file 404s), it renders a unique generated cover instead.
const BookCover = ({ book, className = '', alt }) => {
  const [broken, setBroken] = useState(false);
  const authorLabel =
    book.authorNames || (book.authors || []).map((a) => (typeof a === 'string' ? a : a?.name)).filter(Boolean).join(', ');

  const useGenerated = isPlaceholder(book.coverImage) || broken;
  const src = useGenerated ? generateCoverDataUrl(book.title, authorLabel) : book.coverImage;

  return (
    <span className={`book-cover-wrap ${useGenerated ? 'is-generated' : ''}`}>
      <img
        className={`book-cover-img ${className}`}
        src={src}
        alt={alt || book.title}
        onError={() => setBroken(true)}
      />
      {useGenerated && <span className="generated-cover-badge">Auto cover</span>}
    </span>
  );
};

export default BookCover;
