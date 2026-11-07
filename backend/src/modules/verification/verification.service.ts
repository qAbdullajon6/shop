import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import * as crypto from 'crypto';

import {
  VerificationChannel,
  VerificationPurpose,
} from '@prisma/client';
import { ENV_CONFIG, EnvConfig } from '../../common/config/env.config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { compareValue, hashValue } from '../../common/utils/bcrypt.util';
import { VERIFICATION_CHANNEL_DRIVER } from './verification-channel';
import type { VerificationChannelDriver } from './verification-channel';

export interface IssueCodeResult {
  message: string;
  channel: VerificationChannel;
  expires_in_seconds: number;
  /** Faqat development rejimida to'ldiriladi. */
  debug_code?: string;
}

export interface ConsumeResult {
  phone_number: string;
  telegram_id: bigint | null;
}

/**
 * Tasdiqlash kodlarining yagona manbasi.
 *
 * Oldingi implementatsiya kodni doimiy '2222' qilib ochiq saqlar edi, ya'ni
 * istalgan raqamga kirish mumkin edi. Bu servis quyidagilarni ta'minlaydi:
 *
 *   • kod kriptografik tasodifiy (crypto.randomInt)
 *   • DB'da faqat bcrypt hash saqlanadi
 *   • urinishlar sanaladi va tugaganda kod kuyadi (brute-force himoyasi)
 *   • telefon raqami bo'yicha yuborish tezligi cheklanadi (IP bo'yicha emas —
 *     IP throttler bitta raqamga hujumni to'xtata olmaydi)
 *   • tekshirish doimiy vaqtda, sanab chiqarishga qarshi
 */
@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(ENV_CONFIG) private readonly config: EnvConfig,
    @Inject(VERIFICATION_CHANNEL_DRIVER)
    private readonly driver: VerificationChannelDriver,
  ) {}

  /**
   * Yangi kod yaratadi va tanlangan kanal orqali yuboradi.
   *
   * Diqqat: bu yerda foydalanuvchi mavjudligi OSHKOR QILINMAYDI — javob
   * ro'yxatdan o'tgan va o'tmagan raqam uchun bir xil bo'ladi, aks holda
   * endpoint mijozlar bazasini sanab chiqish vositasiga aylanadi.
   */
  async issueCode(
    phoneNumber: string,
    purpose: VerificationPurpose,
    ipAddress?: string,
  ): Promise<IssueCodeResult> {
    if (!this.driver.isReady()) {
      this.logger.error(`"${this.driver.channel}" kanali ishlashga tayyor emas`);
      throw new ServiceUnavailableException(
        "Tasdiqlash xizmati vaqtincha ishlamayapti. Keyinroq urinib ko'ring.",
      );
    }

    await this.assertSendRateLimit(phoneNumber, purpose);

    const code = this.generateCode();
    const ttlMinutes = this.config.VERIFICATION_CODE_TTL_MINUTES;
    const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);

    // Telegram kanali uchun kod qaysi chatga borishini bilishimiz kerak.
    const user = await this.prisma.user.findUnique({
      where: { phone_number: phoneNumber },
      select: { telegram_id: true },
    });

    // Avvalgi ishlatilmagan kodlarni bekor qilamiz, lekin O'CHIRMAYMIZ —
    // tezlik chegarasi yuborishlar tarixiga tayanadi.
    //
    // MUHIM: consumed_at = now() ham o'rnatiladi, chunki schema'da
    // uq_verification_active partial unique indeksi
    // WHERE consumed_at IS NULL ustida qurilgan. consumed_at belgilanmasa
    // eski yozuv "faol" ko'rinib qoladi va yangi kod kiritilganda noyoblik
    // xatosi beradi.
    await this.prisma.verificationCode.updateMany({
      where: { phone_number: phoneNumber, purpose, consumed_at: null },
      data: { expires_at: new Date(0), consumed_at: new Date() },
    });

    const record = await this.prisma.verificationCode.create({
      data: {
        phone_number: phoneNumber,
        code_hash: await hashValue(code),
        channel: this.driver.channel,
        purpose,
        max_attempts: this.config.VERIFICATION_MAX_ATTEMPTS,
        expires_at: expiresAt,
        ip_address: ipAddress,
        telegram_id: user?.telegram_id ?? null,
      },
    });

    const delivery = await this.driver.send(
      { phone_number: phoneNumber, telegram_id: user?.telegram_id ?? null },
      code,
      ttlMinutes,
    );

    if (!delivery.delivered) {
      // Yetkazilmagan kod foydasiz — darhol bekor qilamiz, aks holda
      // u tezlik chegarasini behuda band qiladi.
      await this.prisma.verificationCode.update({
        where: { id: record.id },
        data: { expires_at: new Date(0) },
      });

      throw new ServiceUnavailableException(
        delivery.reason ?? "Kodni yuborib bo'lmadi. Keyinroq urinib ko'ring.",
      );
    }

    return {
      message: this.deliveryMessage(delivery.channel),
      channel: delivery.channel,
      expires_in_seconds: ttlMinutes * 60,
      ...(delivery.debug_code ? { debug_code: delivery.debug_code } : {}),
    };
  }

  /**
   * Kodni tekshiradi va bir martalik qilib "iste'mol qiladi".
   * Muvaffaqiyatli bo'lsa telefon raqami qaytadi, aks holda xato tashlanadi.
   */
  async consumeCode(
    phoneNumber: string,
    code: string,
    purpose: VerificationPurpose,
  ): Promise<ConsumeResult> {
    const record = await this.prisma.verificationCode.findFirst({
      where: {
        phone_number: phoneNumber,
        purpose,
        consumed_at: null,
        expires_at: { gt: new Date() },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!record) {
      // Kod topilmadi/eskirdi — noto'g'ri kod bilan bir xil xabar beriladi,
      // shunda hujumchi qaysi holat yuz berganini ajrata olmaydi.
      throw new BadRequestException(
        "Kod noto'g'ri yoki muddati tugagan. Yangi kod so'rang.",
      );
    }

    if (record.attempts >= record.max_attempts) {
      await this.prisma.verificationCode.update({
        where: { id: record.id },
        data: { expires_at: new Date(0) },
      });
      throw new BadRequestException(
        "Urinishlar soni tugadi. Yangi kod so'rang.",
      );
    }

    const matches = await compareValue(code, record.code_hash);

    if (!matches) {
      // Atomik shartli inkrement: `attempts < max_attempts` sharti bir vaqtda
      // kelgan bir necha noto'g'ri urinish limitdan oshib ketishiga yo'l
      // qo'ymaydi (MED-3 poyga holatini yopadi). RETURNING yangi qiymatni beradi.
      const rows = await this.prisma.$queryRaw<
        { attempts: number; max_attempts: number }[]
      >`
        UPDATE verification_codes
        SET attempts = attempts + 1
        WHERE id = ${record.id}
          AND consumed_at IS NULL
          AND attempts < max_attempts
        RETURNING attempts, max_attempts
      `;

      if (rows.length === 0) {
        // Allaqachon limitda yoki iste'mol qilingan — kodni kuydiramiz.
        await this.prisma.verificationCode.update({
          where: { id: record.id },
          data: { expires_at: new Date(0) },
        });
        throw new BadRequestException(
          "Urinishlar soni tugadi. Yangi kod so'rang.",
        );
      }

      const remaining = rows[0].max_attempts - rows[0].attempts;

      throw new BadRequestException(
        remaining > 0
          ? `Kod noto'g'ri. Qolgan urinishlar: ${remaining}`
          : "Urinishlar soni tugadi. Yangi kod so'rang.",
      );
    }

    // Atomik iste'mol: shart bilan yangilash bir vaqtda kelgan ikkinchi
    // so'rovning o'sha kodni qayta ishlatishiga yo'l qo'ymaydi.
    const consumed = await this.prisma.verificationCode.updateMany({
      where: { id: record.id, consumed_at: null },
      data: { consumed_at: new Date() },
    });

    if (consumed.count === 0) {
      throw new BadRequestException('Bu kod allaqachon ishlatilgan');
    }

    return { phone_number: record.phone_number, telegram_id: record.telegram_id };
  }

  /** Muddati o'tgan kodlarni tozalaydi (rejalashtirilgan vazifa chaqiradi). */
  async purgeExpired(olderThanHours = 24): Promise<number> {
    const cutoff = new Date(Date.now() - olderThanHours * 3_600_000);
    const { count } = await this.prisma.verificationCode.deleteMany({
      where: { created_at: { lt: cutoff } },
    });
    return count;
  }

  /**
   * Bir telefon raqamiga soatiga yuborilgan kodlar sonini cheklaydi.
   *
   * IP bo'yicha throttler buni qoplamaydi: hujumchi IP almashtirib bitta
   * qurbonning raqamini SMS bilan ko'mishi ("SMS bombing") mumkin edi.
   */
  private async assertSendRateLimit(
    phoneNumber: string,
    purpose: VerificationPurpose,
  ): Promise<void> {
    const windowStart = new Date(Date.now() - 3_600_000);

    const recentSends = await this.prisma.verificationCode.count({
      where: { phone_number: phoneNumber, purpose, created_at: { gte: windowStart } },
    });

    if (recentSends >= this.config.VERIFICATION_MAX_SENDS_PER_HOUR) {
      throw new BadRequestException(
        "Juda ko'p kod so'raldi. Iltimos, bir soatdan keyin urinib ko'ring.",
      );
    }
  }

  /** Kriptografik tasodifiy raqamli kod (Math.random emas). */
  private generateCode(): string {
    const length = this.config.VERIFICATION_CODE_LENGTH;
    let code = '';
    for (let i = 0; i < length; i++) {
      code += crypto.randomInt(0, 10).toString();
    }
    return code;
  }

  private deliveryMessage(channel: VerificationChannel): string {
    switch (channel) {
      case VerificationChannel.TELEGRAM:
        return 'Tasdiqlash kodi Telegram orqali yuborildi';
      case VerificationChannel.SMS:
        return 'Tasdiqlash kodi SMS orqali yuborildi';
      default:
        return 'Tasdiqlash kodi yaratildi (development rejimi)';
    }
  }
}
