import { Injectable, Logger } from '@nestjs/common';
import { VerificationChannel } from '@prisma/client';

import {
  DeliveryResult,
  DeliveryTarget,
  VerificationChannelDriver,
} from '../verification-channel';

/**
 * Development drayveri: kod hech qayerga yuborilmaydi, logga chiqadi va
 * API javobida qaytariladi.
 *
 * Bu drayver ishlab chiqarishda ishlatilishi MUMKIN EMAS — `EnvConfig`
 * NODE_ENV=production bo'lganda VERIFICATION_CHANNEL='dev' ni rad etadi
 * va ilova ishga tushmaydi.
 */
@Injectable()
export class DevVerificationDriver implements VerificationChannelDriver {
  readonly channel = VerificationChannel.DEV;
  private readonly logger = new Logger('VerificationCode');

  isReady(): boolean {
    return true;
  }

  send(target: DeliveryTarget, code: string, ttlMinutes: number): Promise<DeliveryResult> {
    this.logger.warn(
      `[DEV] ${target.phone_number} uchun tasdiqlash kodi: ${code} (${ttlMinutes} daqiqa)`,
    );

    return Promise.resolve({
      delivered: true,
      channel: this.channel,
      debug_code: code,
    });
  }
}
