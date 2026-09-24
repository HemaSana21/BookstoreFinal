// Generates a distinctive, deterministic "book cover" for any book that has
// no real cover image (or whose cover URL fails to load) — so every listing
// looks intentional instead of showing a generic placeholder graphic.
// Same title+author always renders the same cover (deterministic hash), so
// it stays stable across reloads without needing to store anything extra.

const PALETTES = [
  ['#4F46E5', '#7C3AED'],
  ['#DB2777', '#7C3AED'],
  ['#0EA5E9', '#4F46E5'],
  ['#F59E0B', '#DB2777'],
  ['#059669', '#0EA5E9'],
  ['#7C3AED', '#F5B301'],
  ['#EF4444', '#7C3AED'],
  ['#0891B2', '#059669']
];

const hashString = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const escapeXml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const wrapTitle = (title = '', maxCharsPerLine = 15, maxLines = 4) => {
  const words = title.trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
    if (lines.length === maxLines - 1) break;
  }
  if (current) lines.push(current);
  if (lines.length > maxLines) lines.length = maxLines;
  if (lines.length > maxLines - 1 && lines[lines.length - 1].length > maxCharsPerLine) {
    lines[lines.length - 1] = `${lines[lines.length - 1].slice(0, maxCharsPerLine - 1)}…`;
  }
  return lines.length ? lines : ['Untitled'];
};

export const getPalette = (seedText) => PALETTES[hashString(seedText) % PALETTES.length];

export const buildCoverSvg = (title = 'Untitled', author = '') => {
  const [c1, c2] = getPalette(`${title}|${author}`);
  const lines = wrapTitle(title || 'Untitled');
  const initial = (title || '?').trim().charAt(0).toUpperCase() || '?';
  const authorLabel = (author || 'Unknown Author').slice(0, 34);
  const titleStartY = 210 - (lines.length - 1) * 15;
  const lineEls = lines
    .map(
      (line, i) =>
        `<text x="160" y="${titleStartY + i * 30}" text-anchor="middle" font-family="'Space Grotesk', sans-serif" font-size="21" font-weight="700" fill="#ffffff">${escapeXml(
          line
        )}</text>`
    )
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="460" viewBox="0 0 320 460">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="320" height="460" fill="url(#bg)"/>
  <circle cx="272" cy="46" r="86" fill="rgba(255,255,255,0.09)"/>
  <circle cx="26" cy="424" r="104" fill="rgba(255,255,255,0.07)"/>
  <rect x="16" y="16" width="288" height="428" rx="14" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>
  <text x="160" y="112" text-anchor="middle" font-family="'Space Grotesk', sans-serif" font-size="58" font-weight="700" fill="rgba(255,255,255,0.92)">${escapeXml(
    initial
  )}</text>
  <line x1="90" y1="140" x2="230" y2="140" stroke="rgba(255,255,255,0.5)" stroke-width="2"/>
  ${lineEls}
  <text x="160" y="404" text-anchor="middle" font-family="'Inter', sans-serif" font-size="14" fill="rgba(255,255,255,0.88)">${escapeXml(
    authorLabel
  )}</text>
  <text x="160" y="428" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" letter-spacing="3" fill="rgba(255,255,255,0.62)">AUTO-GENERATED COVER</text>
</svg>`;
};

// Cheap, synchronous — safe to use directly as an <img src>.
export const generateCoverDataUrl = (title, author) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(buildCoverSvg(title, author))}`;

// Rasterizes the same design into a real PNG File, so it can be uploaded
// and stored like any other cover image (used when a seller lists a book
// without picking a cover).
export const generateCoverFile = (title, author) =>
  new Promise((resolve, reject) => {
    try {
      const svgUrl = generateCoverDataUrl(title, author);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 460;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 320, 460);
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Could not generate a cover image'));
          resolve(new File([blob], `generated-cover-${Date.now()}.png`, { type: 'image/png' }));
        }, 'image/png');
      };
      img.onerror = () => reject(new Error('Could not generate a cover image'));
      img.src = svgUrl;
    } catch (err) {
      reject(err);
    }
  });
