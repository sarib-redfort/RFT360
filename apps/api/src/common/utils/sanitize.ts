import sanitizeHtml from 'sanitize-html';

/**
 * Allowlist-based sanitiser for CMS rich text (blog posts, job descriptions).
 *
 * Rich text originates from the Tiptap editor but is attacker-controllable in
 * principle, so every stored HTML string passes through here before it is saved
 * — the API is the trust boundary, never the client. Covers the full set of
 * marks/nodes the editor can produce plus safe embeds.
 */
const options: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr', 'blockquote', 'pre', 'code',
    'strong', 'em', 'u', 's', 'sub', 'sup', 'mark',
    'ul', 'ol', 'li',
    'a', 'img', 'figure', 'figcaption',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'span', 'div', 'iframe',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    span: ['style', 'class'],
    div: ['class'],
    code: ['class'],
    pre: ['class'],
    th: ['colspan', 'rowspan', 'style'],
    td: ['colspan', 'rowspan', 'style'],
    // Only YouTube/Vimeo embeds; enforced by allowedIframeHostnames below.
    iframe: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'title'],
  },
  // Restrict inline styles to a safe, closed set (colours, alignment).
  allowedStyles: {
    '*': {
      color: [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(/],
      'background-color': [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(/],
      'text-align': [/^(left|right|center|justify)$/],
    },
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https', 'data'] },
  allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'player.vimeo.com'],
  // Force safe rel on any link that opens a new tab.
  transformTags: {
    a: (tagName, attribs) => {
      if (attribs.target === '_blank') {
        attribs.rel = 'noopener noreferrer nofollow';
      }
      return { tagName, attribs };
    },
  },
};

export function sanitizeRichHtml(html: string | null | undefined): string {
  if (!html) return '';
  return sanitizeHtml(html, options);
}

/** Strips all tags, leaving plain text (used for excerpts/meta). */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, ' ')
    .trim();
}
