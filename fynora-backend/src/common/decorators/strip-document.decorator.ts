import { Transform } from 'class-transformer';
import { stripDocument } from '../utils/document.util';

export function StripDocument(): PropertyDecorator {
  return Transform(({ value }) => stripDocument(value));
}
