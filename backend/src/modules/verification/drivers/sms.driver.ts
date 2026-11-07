import { Inject, Injectable, Logger } from '@nestjs/common';
import { VerificationChannel } from '../../../../generated/prisma/client';

import { ENV_CONFIG, EnvConfig } from '../../../common/config/env.config';
import {
  DeliveryResult,
  DeliveryTarget,
  VerificationChannelDriver,
} from '../verification-channel';

/**
 * Umumiy HTTP SMS shlyuzi drayveri.
 *
 * O'zbekistondagi ko'pchilik provayderlar (Eskiz, Play Mobile) bir xil
 * shaklga ega: Bearer token bilan himoyalangan JSON POST. Boshqa shaklga
 * o'tish uchun faqat shu fayldagi so'rov tanasi o'zgartiriladi — auth
 * logikasiga tegilmaydi.
 *
 * Kerakli muhit o'zgaruvchilari: SMS_API_URL, SMS_API_TOKEN, SMS_SENDER.
 */
@Injectable()
export class SmsVerificationDriver implements VerificationChannelDriver {
  readonly channel = VerificationChannel.SMS;
  private readonly logger = new Logger(SmsVerificationDriver.name);

  constructor(@Inject(ENV_CONFIG) private readonly config: EnvConfig) {}

  isReady(): boolean {
    return Boolean(this.config.SMS_API_URL && this.config.SMS_API_TOKEN);
  }

  async send(
    target: DeliveryTarget,
    code: string,
    ttlMinutes: number,
  ): Promise<DeliveryResult> {
    if (!this.isReady()) {
      return {
        delivered: false,
        channel: this.channel,
        reason: 'SMS xizmati sozlanmagan',
      };
    }

    const message =
      `Zahabi Parfume tasdiqlash kodi: ${code}. ` +
      `Kod ${ttlMinutes} daqiqa amal qiladi. Kodni hech kimga bermang.`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);

      const response = await fetch(this.config.SMS_API_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.SMS_API_TOKEN}`,
        },
        body: JSON.stringify({
          mobile_phone: target.phone_number.replace(/^\+/, ''),
          message,
          from: this.config.SMS_SENDER ?? '4546',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        // Provayder javobi loglanadi, lekin mijozga qaytarilmaydi —
        // u ichki tafsilotlarni oshkor qilishi mumkin.
        this.logger.error(`SMS shlyuzi ${response.status} qaytardi`);
        return {
          delivered: false,
          channel: this.channel,
          reason: "SMS yuborib bo'lmadi. Iltimos keyinroq urinib ko'ring.",
        };
      }

      return { delivered: true, channel: this.channel };
    } catch (error) {
      this.logger.error(
        `SMS yuborishda xatolik: ${error instanceof Error ? error.message : String(error)}`,
      );
      return {
        delivered: false,
        channel: this.channel,
        reason: "SMS xizmatiga ulanib bo'lmadi. Iltimos keyinroq urinib ko'ring.",
      };
    }
  }
}
