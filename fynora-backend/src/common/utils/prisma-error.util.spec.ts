import { Prisma } from '@prisma/client';
import {
  isPrismaUniqueConstraintError,
  isPrismaUniqueConstraintOnFields,
} from './prisma-error.util';

describe('prisma-error.util', () => {
  const p2002 = new Prisma.PrismaClientKnownRequestError(
    'Unique constraint failed',
    {
      code: 'P2002',
      clientVersion: '7.8.0',
      meta: { target: ['email'] },
    },
  );

  it('should detect P2002', () => {
    expect(isPrismaUniqueConstraintError(p2002)).toBe(true);
  });

  it('should match configured fields', () => {
    expect(isPrismaUniqueConstraintOnFields(p2002, ['email'])).toBe(true);
    expect(isPrismaUniqueConstraintOnFields(p2002, ['document'])).toBe(false);
  });
});
