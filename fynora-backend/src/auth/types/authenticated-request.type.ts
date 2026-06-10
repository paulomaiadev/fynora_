import type { Request } from 'express';

/** Shape of `request.user` after JwtStrategy.validate() decodes the token. */
export interface AuthenticatedUser {
  userId: string;
  email: string;
  companyId: string;
}

export type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};
