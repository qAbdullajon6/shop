import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import type { Response } from 'express';

import { ClientIp, CurrentRefreshUser, CurrentUser, Public } from '../../common/decorators';
import { JwtRefreshGuard } from '../../common/guards';
import { REFRESH_TOKEN_COOKIE } from '../../common/strategies/jwt-refresh.strategy';
import { ENV_CONFIG, EnvConfig } from '../../common/config/env.config';
import type { User } from '../../../generated/prisma/client';
import type { RefreshTokenUser } from '../../common/types';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { AuthService } from './auth.service';
import {
  AuthResponseDto,
  MessageResponseDto,
  SendCodeResponseDto,
  TokensDto,
} from './dto/auth-response.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import {
  SendLinkCodeDto,
  TelegramLinkDto,
  TelegramLoginDto,
} from './dto/telegram-login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(ENV_CONFIG) private readonly config: EnvConfig,
  ) {}

  // ─── Telefon + kod ─────────────────────────────────────────────────────────

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Telefon raqamga tasdiqlash kodi yuborish',
    description:
      "IP bo'yicha 3/daqiqa. Bundan tashqari telefon raqami bo'yicha soatlik " +
      "chegara ham amal qiladi (VERIFICATION_MAX_SENDS_PER_HOUR). Javob " +
      "raqam ro'yxatdan o'tganini OSHKOR QILMAYDI.",
  })
  @ApiOkResponse({ type: SendCodeResponseDto })
  @ApiTooManyRequestsResponse({ description: "Juda ko'p so'rov" })
  sendOtp(@Body() dto: SendOtpDto, @ClientIp() ip: string): Promise<SendCodeResponseDto> {
    return this.authService.sendOtp(dto, ip);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Kodni tasdiqlash va kirish/ro'yxatdan o'tish" })
  @ApiOkResponse({ type: AuthResponseDto })
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @ClientIp() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.verifyOtp(dto, { ip, userAgent });
    this.setRefreshCookie(res, result.refresh_token!);
    return result;
  }

  // ─── Telegram ──────────────────────────────────────────────────────────────

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('telegram')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Telegram WebApp orqali kirish',
    description:
      "XOM initData satri yuboriladi va SERVER tomonda Telegram'ning " +
      'HMAC-SHA256 algoritmi bilan tekshiriladi. Frontend bergan ' +
      "foydalanuvchi ma'lumotiga ishonilmaydi.",
  })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Telegram imzosi yaroqsiz yoki eskirgan' })
  async telegramLogin(
    @Body() dto: TelegramLoginDto,
    @ClientIp() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.telegramLogin(dto, { ip, userAgent });
    this.setRefreshCookie(res, result.refresh_token!);
    return result;
  }

  @ApiBearerAuth()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('telegram/send-link-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Telegram hisobiga telefon raqamini bog'lash uchun kod yuborish",
  })
  @ApiOkResponse({ type: SendCodeResponseDto })
  sendLinkCode(
    @CurrentUser() user: User,
    @Body() dto: SendLinkCodeDto,
    @ClientIp() ip: string,
  ): Promise<SendCodeResponseDto> {
    return this.authService.sendLinkCode(user.id, dto.phone_number, ip);
  }

  @ApiBearerAuth()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('telegram/link-phone')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Tasdiqlangan telefon raqamini Telegram hisobiga bog'lash",
    description:
      "Shu raqamli hisob allaqachon mavjud bo'lsa, hisoblar birlashtiriladi " +
      'va buyurtmalar tarixi saqlanadi.',
  })
  @ApiOkResponse({ type: UserResponseDto })
  linkPhone(
    @CurrentUser() user: User,
    @Body() dto: TelegramLinkDto,
  ): Promise<UserResponseDto> {
    return this.authService.linkPhoneToTelegram(user.id, dto);
  }

  // ─── Admin ─────────────────────────────────────────────────────────────────

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login (telefon + parol)' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: "Parol noto'g'ri yoki admin emas" })
  async adminLogin(
    @Body() dto: AdminLoginDto,
    @ClientIp() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.adminLogin(dto, { ip, userAgent });
    this.setRefreshCookie(res, result.refresh_token!);
    return result;
  }

  // ─── Sessiya ───────────────────────────────────────────────────────────────

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth(REFRESH_TOKEN_COOKIE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Access tokenni yangilash',
    description:
      "Refresh token cookie yoki Authorization header orqali yuboriladi. " +
      'Token rotatsiya qilinadi. Ishlatilgan tokenni qayta yuborish ' +
      "foydalanuvchining BARCHA sessiyalarini bekor qiladi (token o'g'irlanishi belgisi).",
  })
  @ApiOkResponse({ type: TokensDto })
  @ApiUnauthorizedResponse({ description: 'Refresh token yaroqsiz' })
  async refresh(
    @CurrentRefreshUser() user: RefreshTokenUser,
    @ClientIp() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokensDto> {
    const tokens = await this.authService.refreshTokens(user, { ip, userAgent });
    this.setRefreshCookie(res, tokens.refresh_token!);
    return tokens;
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @SkipThrottle()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth(REFRESH_TOKEN_COOKIE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Joriy qurilmadan chiqish' })
  @ApiOkResponse({ type: MessageResponseDto })
  async logout(
    @CurrentRefreshUser() user: RefreshTokenUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<MessageResponseDto> {
    const result = await this.authService.logout(user.sessionId);
    this.clearRefreshCookie(res);
    return result;
  }

  @ApiBearerAuth()
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Barcha qurilmalardan chiqish' })
  @ApiOkResponse({ type: MessageResponseDto })
  async logoutAll(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ): Promise<MessageResponseDto> {
    const result = await this.authService.logoutAll(user.id);
    this.clearRefreshCookie(res);
    return result;
  }

  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Joriy foydalanuvchi ma'lumotlari" })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  getMe(@CurrentUser() user: User): Promise<UserResponseDto> {
    return this.authService.getMe(user.id);
  }

  // ─── Cookie helpers ────────────────────────────────────────────────────────

  private setRefreshCookie(res: Response, refreshToken: string): void {
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      // Secure: true in production (HTTPS only). In development, allow HTTP
      // so localhost works without a certificate.
      secure: this.config.isProduction,
      // Lax allows top-level navigations (links, Telegram deep links) while
      // blocking third-party iframe requests. Strict would break Telegram WebApp.
      sameSite: 'lax',
      // Path restricted to auth endpoints — the cookie is never sent to
      // /api/products, /api/orders, etc., minimising its exposure surface.
      path: '/api/auth',
      // 30 days in milliseconds — matches REFRESH_TOKEN_TTL_DAYS in auth.service.ts
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  private clearRefreshCookie(res: Response): void {
    res.clearCookie(REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure: this.config.isProduction,
      sameSite: 'lax',
      path: '/api/auth',
    });
  }
}
