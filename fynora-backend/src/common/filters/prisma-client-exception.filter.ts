import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
  type HttpStatus as HttpStatusType,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '@prisma/client';

type PrismaErrorCode = 'P2002' | 'P2003' | 'P2025';

const PRISMA_ERROR_STATUS: Record<PrismaErrorCode, HttpStatusType> = {
  P2002: HttpStatus.CONFLICT,
  P2003: HttpStatus.BAD_REQUEST,
  P2025: HttpStatus.NOT_FOUND,
};

const PRISMA_ERROR_MESSAGE: Record<PrismaErrorCode, string> = {
  P2002: 'O registro informado já existe ou viola uma restrição de unicidade.',
  P2003: 'Operação inválida: referência a registro inexistente.',
  P2025: 'Registro não encontrado.',
};

function isMappedPrismaErrorCode(
  code: string,
): code is PrismaErrorCode {
  return Object.prototype.hasOwnProperty.call(PRISMA_ERROR_STATUS, code);
}

function resolveHttpErrorLabel(status: HttpStatusType): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return 'Bad Request';
    case HttpStatus.NOT_FOUND:
      return 'Not Found';
    case HttpStatus.CONFLICT:
      return 'Conflict';
    case HttpStatus.INTERNAL_SERVER_ERROR:
      return 'Internal Server Error';
    default:
      return 'Internal Server Error';
  }
}

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Record<string, unknown>>();
    const response = ctx.getResponse();

    const isMapped = isMappedPrismaErrorCode(exception.code);
    const status = isMapped
      ? PRISMA_ERROR_STATUS[exception.code]
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = isMapped
      ? PRISMA_ERROR_MESSAGE[exception.code]
      : 'Ocorreu um erro interno ao processar a solicitação.';

    if (!isMapped) {
      this.logger.error(exception.message, exception.stack);
    }

    httpAdapter.reply(
      response,
      {
        statusCode: status,
        message,
        error: resolveHttpErrorLabel(status),
        timestamp: new Date().toISOString(),
        path: httpAdapter.getRequestUrl(request),
      },
      status,
    );
  }
}
