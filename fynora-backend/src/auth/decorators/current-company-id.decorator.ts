import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../types/authenticated-request.type';

export const CurrentCompanyId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const companyId = request.user?.companyId;

    if (!companyId || typeof companyId !== 'string') {
      throw new UnauthorizedException('Contexto de tenant inválido.');
    }

    return companyId;
  },
);
