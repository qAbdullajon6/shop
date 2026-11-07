import { Inject, Injectable } from '@nestjs/common';
import { VerificationChannel } from '@prisma/client';

import { ENV_CONFIG, EnvConfig } from '../../../common/config/env.config';
import { TelegramApiService } from '../../telegram/telegram-api.service';
import {
  DeliveryResult,
  DeliveryTarget,
  VerificationChannelDriver,
} from '../verification-channel';

/**
 * Kodni Zahabi Telegram boti orqali yetkazadi.
 *
 * Foydalanuvchi avval bot bilan suhbatni boshlagan bo'lishi kerak
 * (Telegram botlarga notanish odamga yozishga ruxsat bermaydi), va uning
 * telegram_id si platforma hisobiga bog'langan bo'lishi shart.
 */
@Injectable()
export class TelegramVerificationDriver implements VerificationChannelDriver {
  readonly channel = VerificationChannel.TELEGRAM;

  constructor(
    private readonly telegram: TelegramApiService,
    @Inject(ENV_CONFIG) private readonly config: EnvConfig,
  ) {}

  isReady(): boolean {
    return this.telegram.isConfigured;
  }

  async send(
    target: DeliveryTarget,
    code: string,
    ttlMinutes: number,
  ): Promise<DeliveryResult> {
    if (!target.telegram_id) {
      const botName = this.config.TELEGRAM_BOT_USERNAME ?? 'Zahabi bot';
      return {
        delivered: false,
        channel: this.channel,
        reason:
          `Bu raqam Telegram hisobiga bog'lanmagan. ` +
          `Avval @${botName} botini oching va /start bosing.`,
      };
    }

    const text =
      `<b>Zahabi Parfume</b>\n\n` +
      `Tasdiqlash kodingiz: <code>${code}</code>\n\n` +
      `Kod ${ttlMinutes} daqiqa amal qiladi.\n` +
      `<i>Bu kodni hech kimga aytmang — Zahabi xodimlari uni hech qachon so'ramaydi.</i>`;

    const delivered = await this.telegram.sendMessage(
      String(target.telegram_id),
      text,
    );

    return delivered
      ? { delivered: true, channel: this.channel }
      : {
          delivered: false,
          channel: this.channel,
          reason:
            "Telegram orqali yuborib bo'lmadi. Botni bloklamaganingizni tekshiring.",
        };
  }
}
