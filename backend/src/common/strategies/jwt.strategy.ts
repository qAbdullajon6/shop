import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '@prisma/client';
import { ENV_CONFIG, EnvConfig } from '../config/env.config';
import { UsersService } from '../../modules/users/users.service';
import { JwtPayload } from '../types';

const CACHE_TTL_MS = 60_000; // 60 seconds

interface CachedUser {
  user: User;
  expiresAt: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly cache = new Map<string, CachedUser>();

  constructor(
    private readonly usersService: UsersService,
    @Inject(ENV_CONFIG) config: EnvConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.JWT_ACCESS_SECRET,
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const cached = this.cache.get(payload.sub);
    if (cached && cached.expiresAt > Date.now()) {
      if (!cached.user.is_active) throw new UnauthorizedException('Foydalanuvchi bloklangan');
      return cached.user;
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException('Foydalanuvchi topilmadi');
    if (!user.is_active) throw new UnauthorizedException('Foydalanuvchi bloklangan');

    this.cache.set(payload.sub, { user, expiresAt: Date.now() + CACHE_TTL_MS });

    // Prune expired entries periodically to prevent unbounded memory growth.
    if (this.cache.size > 10_000) {
      const now = Date.now();
      for (const [key, entry] of this.cache) {
        if (entry.expiresAt <= now) this.cache.delete(key);
      }
    }

    return user;
  }
}
