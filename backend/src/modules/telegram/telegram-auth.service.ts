import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

import { ENV_CONFIG, EnvConfig } from '../../common/config/env.config';

/** Telegram WebApp initData ichidagi foydalanuvchi obyekti. */
export interface TelegramWebAppUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_bot?: boolean;
  is_premium?: boolean;
}

export interface VerifiedInitData {
  user: TelegramWebAppUser;
  auth_date: Date;
  /** Bot bilan deep-link orqali kelgan parametr (`?startapp=` / `?start=`). */
  start_param?: string;
  chat_instance?: string;
  query_id?: string;
}

/**
 * Telegram WebApp identifikatorini SERVER tomonda tekshiradi.
 *
 * Frontend'dan kelgan `window.Telegram.WebApp.initDataUnsafe` ga HECH QACHON
 * ishonilmaydi — uni har qanday mijoz o'zgartirishi mumkin. Yagona ishonchli
 * manba — Telegram imzolagan xom `initData` satri.
 *
 * Telegram algoritmi (rasmiy hujjatga muvofiq):
 *   1. `hash` ni query-string'dan ajratib olish
 *   2. Qolgan kalitlarni alifbo tartibida "kalit=qiymat" ko'rinishida \n bilan
 *      biriktirish (data_check_string)
 *   3. secret_key = HMAC_SHA256(key="WebAppData", message=bot_token)
 *   4. HMAC_SHA256(key=secret_key, message=data_check_string) === hash
 *
 * Diqqat: 3-qadamda kalit va xabar o'rni almashgan — bu Telegram'ning
 * o'ziga xosligi va uni chalkashtirish tekshiruvni butunlay buzadi.
 */
@Injectable()
export class TelegramAuthService {
  private readonly logger = new Logger(TelegramAuthService.name);
  private readonly secretKey: Buffer | null;

  constructor(@Inject(ENV_CONFIG) private readonly config: EnvConfig) {
    this.secretKey = config.TELEGRAM_BOT_TOKEN
      ? crypto
          .createHmac('sha256', 'WebAppData')
          .update(config.TELEGRAM_BOT_TOKEN)
          .digest()
      : null;
  }

  get isConfigured(): boolean {
    return this.secretKey !== null;
  }

  /**
   * initData'ni tekshiradi va foydalanuvchini qaytaradi.
   * Imzo noto'g'ri yoki muddati o'tgan bo'lsa — UnauthorizedException.
   */
  verifyInitData(initData: string): VerifiedInitData {
    if (!this.secretKey) {
      throw new UnauthorizedException('Telegram autentifikatsiyasi sozlanmagan');
    }

    if (!initData || typeof initData !== 'string') {
      throw new UnauthorizedException('initData bo\'sh');
    }

    // Juda uzun kirish — DoS'ga qarshi oddiy chegara.
    if (initData.length > 4096) {
      throw new UnauthorizedException('initData juda uzun');
    }

    const params = new URLSearchParams(initData);
    const providedHash = params.get('hash');

    if (!providedHash) {
      throw new UnauthorizedException('initData imzosi topilmadi');
    }

    // ── data_check_string: hash'dan tashqari barcha kalitlar, alifbo tartibida ──
    const pairs: string[] = [];
    for (const [key, value] of params.entries()) {
      if (key === 'hash') continue;
      pairs.push(`${key}=${value}`);
    }
    pairs.sort();
    const dataCheckString = pairs.join('\n');

    const computedHash = crypto
      .createHmac('sha256', this.secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (!this.safeEqualHex(computedHash, providedHash)) {
      this.logger.warn('Telegram initData imzosi mos kelmadi');
      throw new UnauthorizedException('Telegram imzosi yaroqsiz');
    }

    // ── Muddat: eski initData qayta ishlatilishiga (replay) yo'l qo'ymaymiz ──
    const authDateRaw = params.get('auth_date');
    if (!authDateRaw) {
      throw new UnauthorizedException('initData ichida auth_date yo\'q');
    }

    const authDateSeconds = Number(authDateRaw);
    if (!Number.isFinite(authDateSeconds)) {
      throw new UnauthorizedException('auth_date noto\'g\'ri formatda');
    }

    const ageSeconds = Math.floor(Date.now() / 1000) - authDateSeconds;
    if (ageSeconds > this.config.TELEGRAM_INITDATA_MAX_AGE_SECONDS) {
      throw new UnauthorizedException(
        'Telegram sessiyasi eskirgan — ilovani qayta oching',
      );
    }
    // Kelajakdagi sana ham shubhali (soat farqi uchun 5 daqiqa yon beramiz).
    if (ageSeconds < -300) {
      throw new UnauthorizedException('auth_date kelajakda — initData yaroqsiz');
    }

    // ── Foydalanuvchi ──
    const userRaw = params.get('user');
    if (!userRaw) {
      throw new UnauthorizedException(
        'Telegram foydalanuvchi ma\'lumoti yo\'q — profil maxfiyligi cheklangan bo\'lishi mumkin',
      );
    }

    let user: TelegramWebAppUser;
    try {
      user = JSON.parse(userRaw) as TelegramWebAppUser;
    } catch {
      throw new UnauthorizedException('Telegram foydalanuvchi ma\'lumoti buzilgan');
    }

    if (typeof user.id !== 'number' || !Number.isFinite(user.id) || user.id <= 0) {
      throw new UnauthorizedException('Telegram foydalanuvchi ID yaroqsiz');
    }

    if (user.is_bot) {
      throw new UnauthorizedException('Botlar tizimga kira olmaydi');
    }

    return {
      user,
      auth_date: new Date(authDateSeconds * 1000),
      start_param: params.get('start_param') ?? undefined,
      chat_instance: params.get('chat_instance') ?? undefined,
      query_id: params.get('query_id') ?? undefined,
    };
  }

  /** Webhook so'rovi haqiqatan Telegram'dan kelganini tekshiradi. */
  verifyWebhookSecret(headerValue: string | undefined): boolean {
    const expected = this.config.TELEGRAM_WEBHOOK_SECRET;
    if (!expected) return false;
    if (!headerValue) return false;

    const a = Buffer.from(headerValue);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  }

  /** Uzunlik sizib chiqmasligi uchun doimiy vaqtli taqqoslash. */
  private safeEqualHex(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    try {
      return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
    } catch {
      return false;
    }
  }
}
