import { Global, Module } from '@nestjs/common';
import { ENV_CONFIG, EnvConfig, loadEnvConfig } from './env.config';

/**
 * Tekshirilgan konfiguratsiyani butun ilova bo'ylab taqdim etadi.
 *
 * `process.env` ni to'g'ridan-to'g'ri o'qish o'rniga servislar `EnvConfig`
 * ni inject qiladi — shunda har bir o'zgaruvchi ishga tushishda bir marta
 * tekshiriladi va tiplangan bo'ladi.
 */
@Global()
@Module({
  providers: [
    {
      provide: ENV_CONFIG,
      useFactory: (): EnvConfig => loadEnvConfig(),
    },
    {
      provide: EnvConfig,
      useExisting: ENV_CONFIG,
    },
  ],
  exports: [ENV_CONFIG, EnvConfig],
})
export class AppConfigModule {}
