import { Logger, Module } from '@nestjs/common';

import { ENV_CONFIG, EnvConfig } from '../../common/config/env.config';
import { TelegramApiService } from '../telegram/telegram-api.service';
import { DevVerificationDriver } from './drivers/dev.driver';
import { SmsVerificationDriver } from './drivers/sms.driver';
import { TelegramVerificationDriver } from './drivers/telegram.driver';
import {
  VERIFICATION_CHANNEL_DRIVER,
  VerificationChannelDriver,
} from './verification-channel';
import { VerificationService } from './verification.service';

/**
 * VERIFICATION_CHANNEL muhit o'zgaruvchisiga qarab aniq drayverni tanlaydi.
 * Yangi provayder qo'shish = yangi drayver + shu yerda bitta qator.
 */
@Module({
  providers: [
    TelegramApiService,
    DevVerificationDriver,
    TelegramVerificationDriver,
    SmsVerificationDriver,
    {
      provide: VERIFICATION_CHANNEL_DRIVER,
      inject: [
        ENV_CONFIG,
        DevVerificationDriver,
        TelegramVerificationDriver,
        SmsVerificationDriver,
      ],
      useFactory: (
        config: EnvConfig,
        dev: DevVerificationDriver,
        telegram: TelegramVerificationDriver,
        sms: SmsVerificationDriver,
      ): VerificationChannelDriver => {
        const logger = new Logger('VerificationModule');

        const selected: VerificationChannelDriver =
          config.VERIFICATION_CHANNEL === 'telegram'
            ? telegram
            : config.VERIFICATION_CHANNEL === 'sms'
              ? sms
              : dev;

        if (!selected.isReady()) {
          // Ishga tushishda ogohlantiramiz — so'rov kelganda emas. Ishlab
          // chiqarishda EnvConfig buni allaqachon bloklagan bo'ladi.
          logger.warn(
            `Tanlangan "${config.VERIFICATION_CHANNEL}" kanali sozlanmagan — ` +
              'kod yuborish so\'rovlari 503 qaytaradi',
          );
        } else {
          logger.log(`Tasdiqlash kanali: ${config.VERIFICATION_CHANNEL}`);
        }

        return selected;
      },
    },
    VerificationService,
  ],
  exports: [VerificationService, TelegramApiService],
})
export class VerificationModule {}
