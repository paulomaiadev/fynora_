import sanitizeHtml from 'sanitize-html';

/**
 * Remove tags HTML/scripts e normaliza espaços para mitigar XSS armazenado.
 */
export function sanitizeText(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  const withoutTags = sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  });

  return withoutTags.trim().replace(/\s+/g, ' ');
}
