import { Prisma } from '@prisma/client';

export function isPrismaUniqueConstraintError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

export function isPrismaUniqueConstraintOnFields(
  error: unknown,
  fields: string[],
): boolean {
  if (!isPrismaUniqueConstraintError(error)) {
    return false;
  }

  const target = error.meta?.target;

  if (!Array.isArray(target)) {
    return true;
  }

  return fields.some((field) => target.includes(field));
}
