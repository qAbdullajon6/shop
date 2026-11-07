import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../../generated/prisma/client';
import { RefreshTokenUser } from '../types';

export const CurrentUserOptional = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User | null => {
    const request = ctx.switchToHttp().getRequest<{ user: User | null }>();
    return request.user ?? null;
  },
);

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<{ user: User }>();
    return request.user;
  },
);

export const CurrentRefreshUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RefreshTokenUser => {
    const request = ctx.switchToHttp().getRequest<{ user: RefreshTokenUser }>();
    return request.user;
  },
);
