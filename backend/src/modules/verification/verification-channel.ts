import { VerificationChannel } from '@prisma/client';

export interface DeliveryTarget {
  phone_number: string;
  /** Telegram kanali uchun — kod yuboriladigan chat. */
  telegram_id?: bigint | null;
}

export interface DeliveryResult {
  delivered: boolean;
  channel: VerificationChannel;
  /**
   * Kod FAQAT development rejimida qaytariladi, shunda ishlab chiquvchi
   * SMS/Telegram'siz sinovdan o'tkaza oladi. Ishlab chiqarishda doim null —
   * bu invariant `EnvConfig` da majburlanadi.
   */
  debug_code?: string;
  /** Yetkazib bo'lmagan sabab (mijozga ko'rsatiladigan xavfsiz matn). */
  reason?: string;
}

/**
 * Tasdiqlash kodini yetkazib berish kanali.
 *
 * Auth logikasi shu interfeysga tayanadi, aniq provayderga emas — shuning
 * uchun SMS shlyuzi, Telegram boti yoki uchinchi tomon xizmatini almashtirish
 * autentifikatsiya kodiga tegmaydi.
 */
export interface VerificationChannelDriver {
  readonly channel: VerificationChannel;

  /** Kanal ishlashga tayyorligi (token/sozlama mavjudligi). */
  isReady(): boolean;

  send(target: DeliveryTarget, code: string, ttlMinutes: number): Promise<DeliveryResult>;
}

export const VERIFICATION_CHANNEL_DRIVER = 'VERIFICATION_CHANNEL_DRIVER';
