import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import * as crypto from 'crypto';
import { plainToInstance } from 'class-transformer';

import {
  Role,
  VerificationPurpose,
} from '@prisma/client';
import type { User } from '@prisma/client';
import { ENV_CONFIG, EnvConfig } from '../../common/config/env.config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { compareValue, hashValue } from '../../common/utils/bcrypt.util';
import { JwtPayload, RefreshTokenUser } from '../../common/types';
import { TelegramAuthService } from '../telegram/telegram-auth.service';
import { UsersService } from '../users/users.service';
import { VerificationService } from '../verification/verification.service';
import { UserResponseDto } from '../users/dto/user-response.dto';
import {
  AuthResponseDto,
  MessageResponseDto,
  SendCodeResponseDto,
  TokensDto,
} from './dto/auth-response.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { TelegramLoginDto, TelegramLinkDto } from './dto/telegram-login.dto';

const REFRESH_TOKEN_TTL_DAYS = 30;

export interface SessionContext {
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  /**
   * Admin login uchun hisob darajasidagi brute-force himoyasi (IP throttle'ga
   * qo'shimcha). Muvaffaqiyatsiz urinishlar telefon raqami bo'yicha sanaladi;
   * chegaradan oshsa hisob VAQTINCHA (auto-expiring) bloklanadi — bu doimiy
   * emas, shu sababli legitim hisobni butunlay qulflab DoS qilib bo'lmaydi.
   */
  private readonly adminLoginAttempts = new Map<
    string,
    { fails: number; lockedUntil: number }
  >();
  private static readonly ADMIN_MAX_FAILS = 10;
  private static readonly ADMIN_LOCK_MS = 15 * 60 * 1000; // 15 daqiqa

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly verification: VerificationService,
    private readonly telegramAuth: TelegramAuthService,
    @Inject(ENV_CONFIG) private readonly config: EnvConfig,
  ) {}

  // ─── Telefon + kod orqali kirish ────────────────────────────────────────────

  async sendOtp(dto: SendOtpDto, ip?: string): Promise<SendCodeResponseDto> {
    const result = await this.verification.issueCode(
      dto.phone_number,
      VerificationPurpose.LOGIN,
      ip,
    );

    return {
      message: result.message,
      channel: result.channel,
      expires_in_seconds: result.expires_in_seconds,
      // Development'da kod javobda qaytadi; ishlab chiqarishda bu maydon
      // hech qachon to'ldirilmaydi (EnvConfig 'dev' kanalini taqiqlaydi).
      ...(result.debug_code ? { debug_code: result.debug_code } : {}),
    };
  }

  async verifyOtp(dto: VerifyOtpDto, ctx: SessionContext): Promise<AuthResponseDto> {
    const { phone_number } = await this.verification.consumeCode(
      dto.phone_number,
      dto.code,
      VerificationPurpose.LOGIN,
    );

    let user = await this.usersService.findByPhone(phone_number);
    if (!user) {
      user = await this.usersService.createCustomer(phone_number);
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Foydalanuvchi bloklangan');
    }

    return this.buildAuthResponse(user, ctx);
  }

  // ─── Telegram WebApp orqali kirish ──────────────────────────────────────────

  /**
   * Telegram WebApp foydalanuvchisini autentifikatsiya qiladi.
   *
   * `initData` SERVER tomonda tekshiriladi — frontend yuborgan foydalanuvchi
   * obyektiga ishonilmaydi. Telegram ID telefon raqamini bermaydi, shuning
   * uchun ilk kirishda hisob telegram_id bo'yicha yaratiladi va telefon
   * raqami keyinroq (buyurtma berishdan oldin) bog'lanadi.
   */
  async telegramLogin(
    dto: TelegramLoginDto,
    ctx: SessionContext,
  ): Promise<AuthResponseDto> {
    const verified = this.telegramAuth.verifyInitData(dto.init_data);
    const telegramId = BigInt(verified.user.id);

    let user = await this.prisma.user.findUnique({
      where: { telegram_id: telegramId },
    });

    if (user) {
      // Profil ma'lumotlari Telegram'da o'zgargan bo'lishi mumkin.
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          telegram_username: verified.user.username ?? null,
          telegram_photo_url: verified.user.photo_url ?? null,
          ...(user.name ? {} : { name: verified.user.first_name ?? null }),
          ...(user.last_name ? {} : { last_name: verified.user.last_name ?? null }),
        },
      });
    } else {
      user = await this.prisma.user.create({
        data: {
          // Telegram telefon raqamini bermaydi. Vaqtinchalik noyob
          // identifikator qo'yamiz; foydalanuvchi keyin haqiqiy raqamni
          // tasdiqlaydi (linkPhone) va u shu yerga yoziladi.
          phone_number: `tg:${telegramId}`,
          telegram_id: telegramId,
          telegram_username: verified.user.username ?? null,
          telegram_photo_url: verified.user.photo_url ?? null,
          telegram_linked_at: new Date(),
          name: verified.user.first_name ?? null,
          last_name: verified.user.last_name ?? null,
          language: this.normalizeLanguage(verified.user.language_code),
        },
      });
      this.logger.log(`Telegram orqali yangi foydalanuvchi: ${telegramId}`);
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Foydalanuvchi bloklangan');
    }

    return this.buildAuthResponse(user, ctx);
  }

  /**
   * Telegram hisobiga haqiqiy telefon raqamini bog'laydi.
   *
   * Raqam kod bilan tasdiqlanadi — foydalanuvchi o'zganing raqamini
   * o'zlashtira olmasligi uchun. Agar shu raqamli hisob allaqachon mavjud
   * bo'lsa, ikkita hisob birlashtiriladi.
   */
  async linkPhoneToTelegram(
    userId: string,
    dto: TelegramLinkDto,
  ): Promise<UserResponseDto> {
    const { phone_number } = await this.verification.consumeCode(
      dto.phone_number,
      dto.code,
      VerificationPurpose.TELEGRAM_LINK,
    );

    const current = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    if (!current.telegram_id) {
      throw new BadRequestException('Bu hisob Telegram bilan bog\'lanmagan');
    }

    const existing = await this.prisma.user.findUnique({
      where: { phone_number },
    });

    if (existing && existing.id !== current.id) {
      if (existing.telegram_id && existing.telegram_id !== current.telegram_id) {
        throw new ConflictException(
          'Bu telefon raqami boshqa Telegram hisobiga bog\'langan',
        );
      }
      // Brauzerdagi mavjud hisob ustuvor — Telegram identifikatorini unga
      // ko'chiramiz, shunda buyurtmalar tarixi saqlanadi.
      return this.mergeTelegramIntoExistingAccount(current, existing);
    }

    const updated = await this.prisma.user.update({
      where: { id: current.id },
      data: { phone_number, telegram_linked_at: new Date() },
    });

    return plainToInstance(UserResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Telegram identifikatorini brauzerda ochilgan mavjud hisobga ko'chiradi.
   * Vaqtinchalik `tg:` hisobi o'chiriladi — unda buyurtma tarixi bo'lmaydi,
   * chunki buyurtma berish uchun tasdiqlangan telefon raqami talab qilinadi.
   */
  private async mergeTelegramIntoExistingAccount(
    telegramAccount: User,
    targetAccount: User,
  ): Promise<UserResponseDto> {
    const merged = await this.prisma.$transaction(async (tx) => {
      // Vaqtinchalik hisobdagi savat/sevimlilarni ko'chirish o'rniga
      // o'chiramiz: mijoz ikkalasini ham ko'rgan bo'lsa chalkashlik bo'ladi.
      await tx.user.update({
        where: { id: telegramAccount.id },
        data: { telegram_id: null, is_active: false },
      });

      return tx.user.update({
        where: { id: targetAccount.id },
        data: {
          telegram_id: telegramAccount.telegram_id,
          telegram_username: telegramAccount.telegram_username,
          telegram_photo_url: telegramAccount.telegram_photo_url,
          telegram_linked_at: new Date(),
        },
      });
    });

    this.logger.log(
      `Telegram ${merged.telegram_id} hisobi ${targetAccount.id} ga birlashtirildi`,
    );

    return plainToInstance(UserResponseDto, merged, {
      excludeExtraneousValues: true,
    });
  }

  /** Telegram hisobiga telefon raqamini bog'lash uchun kod yuboradi. */
  async sendLinkCode(userId: string, phoneNumber: string, ip?: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    if (!user.telegram_id) {
      throw new BadRequestException('Bu hisob Telegram bilan bog\'lanmagan');
    }

    return this.verification.issueCode(
      phoneNumber,
      VerificationPurpose.TELEGRAM_LINK,
      ip,
    );
  }

  // ─── Admin ─────────────────────────────────────────────────────────────────

  async adminLogin(dto: AdminLoginDto, ctx: SessionContext): Promise<AuthResponseDto> {
    // Hisob darajasidagi lock tekshiruvi — parolni tekshirishdan oldin.
    this.assertAdminNotLocked(dto.phone_number);

    const user = await this.prisma.user.findUnique({
      where: { phone_number: dto.phone_number },
    });

    // Parol tekshiruvi HAR DOIM bajariladi — foydalanuvchi topilmagan
    // holatda ham. Aks holda javob vaqtidagi farq admin telefon
    // raqamlarini sanab chiqishga imkon beradi.
    const storedHash =
      user?.password ??
      '$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv';
    const passwordMatch = await compareValue(dto.password, storedHash);

    const isAdmin =
      user !== null && (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN);

    if (!user || !user.password || !isAdmin || !passwordMatch) {
      this.recordAdminFailure(dto.phone_number, ctx.ip ?? 'unknown');
      throw new UnauthorizedException("Telefon raqam yoki parol noto'g'ri");
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Foydalanuvchi bloklangan');
    }

    // Muvaffaqiyatli kirish — hisoblagichni tozalaymiz.
    this.adminLoginAttempts.delete(dto.phone_number);

    return this.buildAuthResponse(user, ctx);
  }

  /** Hisob vaqtincha bloklangan bo'lsa 429 qaytaradi. */
  private assertAdminNotLocked(phone: string): void {
    const rec = this.adminLoginAttempts.get(phone);
    if (!rec) return;
    if (rec.lockedUntil > Date.now()) {
      const seconds = Math.ceil((rec.lockedUntil - Date.now()) / 1000);
      throw new HttpException(
        `Juda ko'p urinish. ${seconds} soniyadan so'ng qayta urinib ko'ring.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    // Lock muddati o'tgan — hisoblagich tozalanadi.
    if (rec.lockedUntil !== 0 && rec.lockedUntil <= Date.now()) {
      this.adminLoginAttempts.delete(phone);
    }
  }

  /** Muvaffaqiyatsiz urinishni qayd etadi; chegaradan oshsa vaqtincha bloklaydi. */
  private recordAdminFailure(phone: string, ip: string): void {
    const rec = this.adminLoginAttempts.get(phone) ?? { fails: 0, lockedUntil: 0 };
    rec.fails += 1;

    if (rec.fails >= AuthService.ADMIN_MAX_FAILS) {
      rec.lockedUntil = Date.now() + AuthService.ADMIN_LOCK_MS;
      rec.fails = 0; // keyingi lock uchun qaytadan sanaladi
      this.logger.warn(
        `Admin login vaqtincha bloklandi: ${phone} (IP: ${ip}) — ` +
          `${AuthService.ADMIN_LOCK_MS / 60000} daqiqa`,
      );
    } else {
      this.logger.warn(
        `Admin login muvaffaqiyatsiz: ${phone} (IP: ${ip}) — ` +
          `urinish ${rec.fails}/${AuthService.ADMIN_MAX_FAILS}`,
      );
    }

    this.adminLoginAttempts.set(phone, rec);
  }

  // ─── Sessiya ───────────────────────────────────────────────────────────────

  async refreshTokens(payload: RefreshTokenUser, ctx: SessionContext): Promise<TokensDto> {
    const session = await this.prisma.session.findUnique({
      where: { id: payload.sessionId },
    });

    if (!session || session.user_id !== payload.sub) {
      throw new UnauthorizedException('Sessiya topilmadi');
    }

    if (session.expires_at < new Date()) {
      await this.prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedException('Sessiya muddati tugagan');
    }

    const tokenMatch = await compareValue(payload.refreshToken, session.token);
    if (!tokenMatch) {
      // Yaroqsiz refresh token bilan mavjud sessiya — token o'g'irlangan
      // bo'lishi mumkin. Foydalanuvchining barcha sessiyalarini bekor qilamiz.
      await this.prisma.session.deleteMany({ where: { user_id: session.user_id } });
      this.logger.warn(
        `Yaroqsiz refresh token — ${session.user_id} ning barcha sessiyalari bekor qilindi`,
      );
      throw new UnauthorizedException('Refresh token yaroqsiz');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.is_active) {
      throw new UnauthorizedException('Foydalanuvchi topilmadi yoki bloklangan');
    }

    // Rotatsiya: eski sessiya o'chadi, yangisi yaraladi.
    await this.prisma.session.delete({ where: { id: session.id } });

    return this.createSession(user.id, user.phone_number, ctx);
  }

  async logout(sessionId: string): Promise<MessageResponseDto> {
    await this.prisma.session.deleteMany({ where: { id: sessionId } });
    return { message: 'Muvaffaqiyatli chiqildi' };
  }

  async logoutAll(userId: string): Promise<MessageResponseDto> {
    const { count } = await this.prisma.session.deleteMany({
      where: { user_id: userId },
    });
    return { message: `${count} ta qurilmadan chiqildi` };
  }

  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('Foydalanuvchi topilmadi');
    return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
  }

  // ─── Ichki yordamchilar ────────────────────────────────────────────────────

  private async buildAuthResponse(
    user: User,
    ctx: SessionContext,
  ): Promise<AuthResponseDto> {
    const tokens = await this.createSession(user.id, user.phone_number, ctx);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    return {
      user: plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true }),
      ...tokens,
    };
  }

  private async createSession(
    userId: string,
    phone: string,
    ctx: SessionContext,
  ): Promise<TokensDto> {
    const sessionId = crypto.randomUUID();
    const payload: JwtPayload = { sub: userId, phone, sessionId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.JWT_ACCESS_SECRET,
        expiresIn: this.config.JWT_ACCESS_EXPIRES_IN as StringValue,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.JWT_REFRESH_SECRET,
        expiresIn: this.config.JWT_REFRESH_EXPIRES_IN as StringValue,
      }),
    ]);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

    await this.prisma.session.create({
      data: {
        id: sessionId,
        user_id: userId,
        token: await hashValue(refreshToken),
        expires_at: expiresAt,
        ip_address: ctx.ip,
        // User-Agent cheksiz uzun bo'lishi mumkin — kesib qo'yamiz.
        user_agent: ctx.userAgent?.slice(0, 255),
      },
    });

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  private normalizeLanguage(code: string | undefined): string {
    if (!code) return 'uz';
    const base = code.slice(0, 2).toLowerCase();
    return ['uz', 'ru', 'en'].includes(base) ? base : 'uz';
  }
}
