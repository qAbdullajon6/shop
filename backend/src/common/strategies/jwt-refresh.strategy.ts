import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ENV_CONFIG, EnvConfig } from '../config/env.config';
import { JwtPayload, RefreshTokenUser } from '../types';

/** Cookie name used for the httpOnly refresh token. */
export const REFRESH_TOKEN_COOKIE = 'rt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(@Inject(ENV_CONFIG) config: EnvConfig) {
    super({
      // Extract from httpOnly cookie first (web clients), then Authorization
      // header (API clients, mobile, Postman). Cookie takes priority so web
      // clients never need to touch the token value.
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.[REFRESH_TOKEN_COOKIE] ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: config.JWT_REFRESH_SECRET,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload): RefreshTokenUser {
    // Prefer cookie (already extracted by passport-jwt above and verified by
    // the JWT library), but fall back to Authorization header for API clients.
    const refreshToken: string | undefined =
      req.cookies?.[REFRESH_TOKEN_COOKIE] ??
      req.headers['authorization']?.split(' ')[1];

    if (!refreshToken) throw new UnauthorizedException('Refresh token topilmadi');

    return { ...payload, refreshToken };
  }
}
