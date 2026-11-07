import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const ClientIp = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const forwarded = request.headers['x-forwarded-for'];

    if (forwarded) {
      const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
      return raw.split(',')[0].trim();
    }

    return request.ip ?? '127.0.0.1';
  },
);
