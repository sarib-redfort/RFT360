import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import type { ApiErrorBody } from '@rft360/shared';

/**
 * Global exception filter — normalises every thrown error into the stable
 * {@link ApiErrorBody} shape the web app expects, and maps Prisma/Zod errors to
 * appropriate HTTP status codes. Never leaks stack traces to clients.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { id?: string }>();

    const { status, error, message, details } = this.resolve(exception);

    const body: ApiErrorBody = {
      statusCode: status,
      error,
      message,
      details,
      path: request.url,
      timestamp: new Date().toISOString(),
      requestId: request.id,
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status} ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`${request.method} ${request.url} -> ${status} ${message}`);
    }

    response.status(status).json(body);
  }

  private resolve(exception: unknown): {
    status: number;
    error: string;
    message: string;
    details?: Record<string, string[]>;
  } {
    if (exception instanceof ZodError) {
      const details: Record<string, string[]> = {};
      for (const issue of exception.issues) {
        const path = issue.path.join('.') || '_root';
        (details[path] ??= []).push(issue.message);
      }
      return {
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        error: 'VALIDATION_FAILED',
        message: 'The submitted data is invalid.',
        details,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      let message = exception.message;
      let details: Record<string, string[]> | undefined;

      if (typeof res === 'object' && res !== null) {
        const obj = res as Record<string, unknown>;
        if (Array.isArray(obj.message)) {
          // class-validator style array of messages.
          details = { _root: obj.message as string[] };
          message = 'Validation failed.';
        } else if (typeof obj.message === 'string') {
          message = obj.message;
        }
      }
      return { status, error: this.codeFromStatus(status), message, details };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.mapPrismaError(exception);
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        status: HttpStatus.BAD_REQUEST,
        error: 'BAD_REQUEST',
        message: 'The request could not be processed.',
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred.',
    };
  }

  private mapPrismaError(error: Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        const target = (error.meta?.target as string[] | undefined)?.join(', ') ?? 'field';
        return {
          status: HttpStatus.CONFLICT,
          error: 'CONFLICT',
          message: `A record with this ${target} already exists.`,
        };
      }
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          error: 'NOT_FOUND',
          message: 'The requested record was not found.',
        };
      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          error: 'BAD_REQUEST',
          message: 'The operation references a record that does not exist.',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'DATABASE_ERROR',
          message: 'A database error occurred.',
        };
    }
  }

  private codeFromStatus(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_FAILED',
      429: 'TOO_MANY_REQUESTS',
    };
    return map[status] ?? 'ERROR';
  }
}
