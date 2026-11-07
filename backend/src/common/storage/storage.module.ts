import { Global, Logger, Module } from '@nestjs/common';
import { ENV_CONFIG, EnvConfig } from '../config/env.config';
import { STORAGE_PROVIDER, StorageProvider } from './storage.types';
import { LocalStorageProvider } from './local-storage.provider';
import { S3StorageProvider } from './s3-storage.provider';

/**
 * Global ombor moduli. STORAGE_DRIVER ga qarab bitta provayder tanlanadi va
 * `STORAGE_PROVIDER` tokeni orqali barcha yuklash servislariga beriladi.
 */
@Global()
@Module({
  providers: [
    LocalStorageProvider,
    {
      provide: STORAGE_PROVIDER,
      inject: [ENV_CONFIG, LocalStorageProvider],
      useFactory: (config: EnvConfig, local: LocalStorageProvider): StorageProvider => {
        const logger = new Logger('StorageModule');

        if (config.STORAGE_DRIVER === 's3') {
          logger.log(`Fayl ombori: S3 (bucket: ${config.S3_BUCKET})`);
          return new S3StorageProvider({
            bucket: config.S3_BUCKET!,
            region: config.S3_REGION!,
            accessKeyId: config.S3_ACCESS_KEY_ID!,
            secretAccessKey: config.S3_SECRET_ACCESS_KEY!,
            endpoint: config.S3_ENDPOINT,
            publicUrl: config.S3_PUBLIC_URL!,
            forcePathStyle: config.S3_FORCE_PATH_STYLE,
          });
        }

        logger.log('Fayl ombori: local (./uploads)');
        return local;
      },
    },
  ],
  exports: [STORAGE_PROVIDER],
})
export class StorageModule {}
