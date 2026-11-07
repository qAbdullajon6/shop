import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as crypto from 'crypto';

import { ENV_CONFIG, EnvConfig } from '../config/env.config';

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error: string;
  /** Qo'llab-quvvatlashga murojaat qilishda loglar bilan solishtirish uchun. */
  request_id: string;
  path: string;
  timestamp: string;
}

/**
 * Yagona xatolik javobi.
 *
 * Kutilmagan xatoliklar mijozga HECH QACHON stack trace yoki ichki tafsilot
 * qaytarmaydi — to'liq xato serverda `request_id` bilan loglanadi, mijoz esa
 * o'sha identifikatorli xavfsiz xabar oladi.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTP');

  constructor(@Inject(ENV_CONFIG) private readonly config: EnvConfig) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId =
      (request.headers['x-request-id'] as string | undefined) ?? crypto.randomUUID();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      const body: ApiErrorBody = {
        statusCode: status,
        message:
          typeof payload === 'string'
            ? payload
            : ((payload as { message?: string | string[] }).message ?? exception.message),
        error:
          typeof payload === 'object' && payload !== null && 'error' in payload
            ? String((payload as { error: unknown }).error)
            : exception.name,
        request_id: requestId,
        path: request.url,
        timestamp: new Date().toISOString(),
      };

      // 5xx — bu bizning xatomiz, to'liq loglaymiz. 4xx — odatiy mijoz xatosi.
      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(
          `${request.method} ${request.url} → ${status} [${requestId}]`,
          exception.stack,
        );
      }

      response.status(status).json(body);
      return;
    }

    // Kutilmagan xatolik: serverda to'liq, mijozga umumiy xabar.
    this.logger.error(
      `${request.method} ${request.url} → 500 [${requestId}] ` +
        `${exception instanceof Error ? exception.message : String(exception)}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const body: ApiErrorBody = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: this.config.isProduction
        ? "Serverda kutilmagan xatolik yuz berdi. Iltimos keyinroq urinib ko'ring."
        : exception instanceof Error
          ? exception.message
          : String(exception),
      error: 'InternalServerError',
      request_id: requestId,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(body);
  }
}
