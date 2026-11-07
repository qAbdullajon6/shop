import { Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum NodeEnv {
  Development = 'development',
  Test = 'test',
  Production = 'production',
}

const toBool = ({ value }: { value: unknown }): boolean =>
  value === true || value === 'true' || value === '1';

const toInt = ({ value }: { value: unknown }): number | undefined =>
  value === undefined || value === '' ? undefined : Number(value);

/**
 * Muhit o'zgaruvchilari kontrakti.
 *
 * Ishga tushishda bir marta tekshiriladi va noto'g'ri konfiguratsiyada
 * jarayon TO'XTAYDI. Yashirin zaxira qiymatlar (fallback secret) yo'q —
 * ishlab chiqarishda sirlar majburiy.
 */
export class EnvConfig {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @Transform(toInt)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT = 8000;

  @IsString()
  @MinLength(1, { message: 'DATABASE_URL majburiy' })
  DATABASE_URL!: string;

  /** Vergul bilan ajratilgan ruxsat etilgan Origin ro'yxati. */
  @IsString()
  CORS_ORIGIN = 'http://localhost:3000';

  // ── JWT ──
  @IsString()
  @MinLength(32, { message: 'JWT_ACCESS_SECRET kamida 32 belgidan iborat bo\'lishi kerak' })
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @MinLength(32, { message: 'JWT_REFRESH_SECRET kamida 32 belgidan iborat bo\'lishi kerak' })
  JWT_REFRESH_SECRET!: string;

  @IsString()
  JWT_ACCESS_EXPIRES_IN = '15m';

  @IsString()
  JWT_REFRESH_EXPIRES_IN = '30d';

  // ── Tasdiqlash kodlari ──
  /**
   * Kod yetkazish kanali.
   *   dev      — kod javobda/logda qaytadi (FAQAT development)
   *   telegram — Zahabi boti orqali yuboriladi
   *   sms      — SMS provayderi orqali yuboriladi
   */
  @IsIn(['dev', 'telegram', 'sms'])
  VERIFICATION_CHANNEL: 'dev' | 'telegram' | 'sms' = 'dev';

  @Transform(toInt)
  @IsInt()
  @Min(4)
  @Max(8)
  VERIFICATION_CODE_LENGTH = 6;

  @Transform(toInt)
  @IsInt()
  @Min(1)
  VERIFICATION_CODE_TTL_MINUTES = 5;

  @Transform(toInt)
  @IsInt()
  @Min(1)
  VERIFICATION_MAX_ATTEMPTS = 5;

  /** Bitta telefon raqamiga soatiga ruxsat etilgan kod so'rovlari. */
  @Transform(toInt)
  @IsInt()
  @Min(1)
  VERIFICATION_MAX_SENDS_PER_HOUR = 5;

  // ── Telegram ──
  @IsOptional()
  @IsString()
  TELEGRAM_BOT_TOKEN?: string;

  @IsOptional()
  @IsString()
  TELEGRAM_BOT_USERNAME?: string;

  /** Telegram webhook so'rovlarini tasdiqlash uchun maxfiy token. */
  @IsOptional()
  @IsString()
  TELEGRAM_WEBHOOK_SECRET?: string;

  /** WebApp joylashgan to'liq HTTPS manzil (frontend). */
  @IsOptional()
  @IsString()
  TELEGRAM_WEBAPP_URL?: string;

  /** Backend ning public URL — webhook o'rnatish uchun (masalan ngrok). */
  @IsOptional()
  @IsString()
  TELEGRAM_BACKEND_URL?: string;

  /** initData qanchalik "yangi" bo'lishi kerak (soniya) — replay himoyasi. */
  @Transform(toInt)
  @IsInt()
  @Min(60)
  TELEGRAM_INITDATA_MAX_AGE_SECONDS = 300;

  // ── SMS provayderi (ixtiyoriy) ──
  @IsOptional()
  @IsString()
  SMS_API_URL?: string;

  @IsOptional()
  @IsString()
  SMS_API_TOKEN?: string;

  @IsOptional()
  @IsString()
  SMS_SENDER?: string;

  // ── Fayllar / ombor ──
  @Transform(toInt)
  @IsInt()
  @Min(1)
  UPLOAD_MAX_SIZE_MB = 5;

  /** Yuklangan fayllar uchun ommaviy asos manzil (CDN qo'yilsa o'zgaradi). */
  @IsOptional()
  @IsString()
  PUBLIC_ASSET_BASE_URL?: string;

  /**
   * Fayl ombori:
   *   'local' — diskdagi ./uploads (dev + persistent-volume prod)
   *   's3'    — S3-mos obyekt ombori (ephemeral hosting uchun)
   */
  @IsIn(['local', 's3'])
  STORAGE_DRIVER: 'local' | 's3' = 'local';

  @IsOptional()
  @IsString()
  S3_BUCKET?: string;

  @IsOptional()
  @IsString()
  S3_REGION?: string;

  @IsOptional()
  @IsString()
  S3_ACCESS_KEY_ID?: string;

  @IsOptional()
  @IsString()
  S3_SECRET_ACCESS_KEY?: string;

  /** MinIO/R2/Spaces uchun ixtiyoriy endpoint (AWS S3 uchun bo'sh qoldiring). */
  @IsOptional()
  @IsString()
  S3_ENDPOINT?: string;

  /** DB'da to'liq URL saqlash uchun ommaviy bazaviy manzil (CDN yoki bucket). */
  @IsOptional()
  @IsString()
  S3_PUBLIC_URL?: string;

  @Transform(toBool)
  @IsBoolean()
  S3_FORCE_PATH_STYLE = false;

  @Transform(toBool)
  @IsBoolean()
  SWAGGER_ENABLED = true;

  get isProduction(): boolean {
    return this.NODE_ENV === NodeEnv.Production;
  }

  get corsOrigins(): string[] {
    return this.CORS_ORIGIN.split(',')
      .map((o) => o.trim())
      .filter(Boolean);
  }
}

let cached: EnvConfig | null = null;

/**
 * Muhitni tekshiradi va yagona konfiguratsiya obyektini qaytaradi.
 * Xato bo'lsa jarayon ishga tushmaydi — "yashirin fallback" bilan
 * xavfsiz bo'lmagan holatda ishlashdan ko'ra darhol to'xtash afzal.
 */
export function loadEnvConfig(env: NodeJS.ProcessEnv = process.env): EnvConfig {
  if (cached) return cached;

  const config = plainToInstance(EnvConfig, env, {
    enableImplicitConversion: false,
    excludeExtraneousValues: false,
  });

  const errors = validateSync(config, {
    skipMissingProperties: false,
    whitelist: false,
  });

  if (errors.length > 0) {
    const details = errors
      .map((e) => `  • ${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`)
      .join('\n');
    throw new Error(`Muhit konfiguratsiyasi noto'g'ri:\n${details}`);
  }

  assertProductionInvariants(config);

  cached = config;
  return config;
}

/** Ishlab chiqarishda faqat development uchun mo'ljallangan rejimlarni taqiqlaydi. */
function assertProductionInvariants(config: EnvConfig): void {
  if (!config.isProduction) return;

  const problems: string[] = [];

  if (config.VERIFICATION_CHANNEL === 'dev') {
    problems.push(
      "VERIFICATION_CHANNEL='dev' ishlab chiqarishda ishlatilmaydi — " +
        "u tasdiqlash kodini javobda qaytaradi va autentifikatsiyani ochiq qoldiradi",
    );
  }

  if (config.VERIFICATION_CHANNEL === 'telegram' && !config.TELEGRAM_BOT_TOKEN) {
    problems.push("VERIFICATION_CHANNEL='telegram' uchun TELEGRAM_BOT_TOKEN majburiy");
  }

  if (config.VERIFICATION_CHANNEL === 'sms' && (!config.SMS_API_URL || !config.SMS_API_TOKEN)) {
    problems.push("VERIFICATION_CHANNEL='sms' uchun SMS_API_URL va SMS_API_TOKEN majburiy");
  }

  if (config.TELEGRAM_BOT_TOKEN && !config.TELEGRAM_WEBHOOK_SECRET) {
    problems.push(
      'TELEGRAM_WEBHOOK_SECRET majburiy — usiz webhook uchinchi tomon tomonidan soxtalashtirilishi mumkin',
    );
  }

  if (config.STORAGE_DRIVER === 's3') {
    const missing = [
      ['S3_BUCKET', config.S3_BUCKET],
      ['S3_REGION', config.S3_REGION],
      ['S3_ACCESS_KEY_ID', config.S3_ACCESS_KEY_ID],
      ['S3_SECRET_ACCESS_KEY', config.S3_SECRET_ACCESS_KEY],
      ['S3_PUBLIC_URL', config.S3_PUBLIC_URL],
    ].filter(([, v]) => !v).map(([k]) => k);
    if (missing.length > 0) {
      problems.push(`STORAGE_DRIVER='s3' uchun majburiy: ${missing.join(', ')}`);
    }
  }

  if (config.corsOrigins.some((o) => o === '*')) {
    problems.push("CORS_ORIGIN='*' credentials bilan birga ishlab chiqarishda taqiqlanadi");
  }

  if (config.corsOrigins.some((o) => o.startsWith('http://') && !o.includes('localhost'))) {
    problems.push('CORS_ORIGIN ishlab chiqarishda HTTPS bo\'lishi kerak');
  }

  if (problems.length > 0) {
    throw new Error(
      'Ishlab chiqarish konfiguratsiyasi xavfsiz emas:\n' +
        problems.map((p) => `  • ${p}`).join('\n'),
    );
  }
}

/** Ishga tushish paytida konfiguratsiyaning qisqacha holatini loglaydi (sirlarsiz). */
export function logConfigSummary(config: EnvConfig, logger: Logger): void {
  logger.log(`Muhit: ${config.NODE_ENV}`);
  logger.log(`Tasdiqlash kanali: ${config.VERIFICATION_CHANNEL}`);
  logger.log(`Telegram: ${config.TELEGRAM_BOT_TOKEN ? 'sozlangan' : 'sozlanmagan'}`);
  logger.log(`CORS: ${config.corsOrigins.join(', ')}`);
}

export const ENV_CONFIG = 'ENV_CONFIG';
