import { Transform } from 'class-transformer';
import { sanitizeText } from '../utils/sanitize-text.util';

export function SanitizeText(): PropertyDecorator {
  return Transform(({ value }) => sanitizeText(value));
}
