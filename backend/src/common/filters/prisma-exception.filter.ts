import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { Request, Response } from 'express';
import { Prisma } from '../../../generated/prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(error: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const exception = this.mapError(error);
    const status = exception.getStatus();
    const requestId =
      (request.headers['x-request-id'] as string | undefined) ?? crypto.randomUUID();

    response.status(status).json({
      statusCode: status,
      message: (exception.getResponse() as { message?: string } | string | undefined) instanceof Object
        ? ((exception.getResponse() as { message?: string }).message ?? exception.message)
        : exception.message,
      error: exception.name,
      request_id: requestId,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private mapError(error: Prisma.PrismaClientKnownRequestError): HttpException {
    switch (error.code) {
      case 'P2002': {
        const fields = (error.meta?.target as string[] | undefined)?.join(', ');
        return new ConflictException(
          fields ? `"${fields}" allaqachon mavjud` : "Bu ma'lumot allaqachon mavjud",
        );
      }
      case 'P2025':
        return new NotFoundException("Yozuv topilmadi");
      case 'P2003':
        return new BadRequestException("Tegishli yozuv topilmadi yoki mavjud emas");
      case 'P2014':
        return new BadRequestException("Bog'lanish talabi buzildi");
      case 'P2015':
        return new NotFoundException("Bog'liq yozuv topilmadi");
      case 'P2016':
        return new BadRequestException("So'rov talqini xatosi");
      case 'P2023':
        return new BadRequestException("Ma'lumot formati noto'g'ri");
      case 'P2021':
        return new InternalServerErrorException("Server xatosi");
      default:
        return new InternalServerErrorException("Server xatosi");
    }
  }
}
