import * as fs from 'fs/promises';
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { StorageProvider } from './storage.types';

export interface S3StorageConfig {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** MinIO/Cloudflare R2/DigitalOcean Spaces uchun ixtiyoriy endpoint. */
  endpoint?: string;
  /**
   * Ommaviy bazaviy URL (CDN yoki bucket). DB'da to'liq URL shu asosda saqlanadi.
   * Masalan: https://cdn.zahabi.uz  yoki  https://<bucket>.s3.<region>.amazonaws.com
   */
  publicUrl: string;
  /** true bo'lsa MinIO uslubidagi path-style URL (endpoint/bucket/key). */
  forcePathStyle?: boolean;
}

/**
 * S3-mos obyekt ombori (AWS S3, Cloudflare R2, DigitalOcean Spaces, MinIO).
 *
 * `@aws-sdk/client-s3` KERAK — u DINAMIK yuklanadi, shu sabab paket
 * o'rnatilmagan bo'lsa ham loyiha build bo'ladi. STORAGE_DRIVER=s3 tanlanганда
 * paket o'rnatilmagan bo'lsa, birinchi yuklashda aniq xato beriladi.
 *
 * Faollashtirish:
 *   1. npm i @aws-sdk/client-s3
 *   2. STORAGE_DRIVER=s3 va S3_* env o'zgaruvchilarini o'rnating
 */
@Injectable()
export class S3StorageProvider implements StorageProvider {
  readonly name = 's3' as const;
  private readonly logger = new Logger(S3StorageProvider.name);
  private client: any = null;

  constructor(private readonly config: S3StorageConfig) {}

  private async getClient(): Promise<any> {
    if (this.client) return this.client;
    let mod: any;
    try {
      // Dinamik import — paket o'rnatilmagan bo'lsa build buzilmaydi.
      mod = await import('@aws-sdk/client-s3' as string);
    } catch {
      throw new InternalServerErrorException(
        "S3 ombori tanlangan, lekin '@aws-sdk/client-s3' o'rnatilmagan. " +
          "Ishga tushirish: npm i @aws-sdk/client-s3",
      );
    }
    this.client = new mod.S3Client({
      region: this.config.region,
      ...(this.config.endpoint ? { endpoint: this.config.endpoint } : {}),
      ...(this.config.forcePathStyle ? { forcePathStyle: true } : {}),
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    });
    return this.client;
  }

  async persist(file: Express.Multer.File, subdirectory: string): Promise<string> {
    const key = `${subdirectory}/${file.filename}`;
    const body = await fs.readFile(file.path);

    const [client, mod] = await Promise.all([
      this.getClient(),
      import('@aws-sdk/client-s3' as string),
    ]);

    await client.send(
      new mod.PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: body,
        ContentType: file.mimetype,
        // Rasmlar ommaviy o'qiladi. XSS himoyasi: SVG skript ishga tushmasligi
        // uchun nosniff. (SVG upload'lar allaqachon whitelist bilan rad etiladi.)
        CacheControl: 'public, max-age=2592000, immutable',
      }),
    );

    // Diskdagi vaqtinchalik multer faylini o'chiramiz.
    await fs.unlink(file.path).catch(() => undefined);

    // DB'da to'liq ommaviy URL saqlanadi.
    const base = this.config.publicUrl.replace(/\/+$/, '');
    return `${base}/${key}`;
  }

  async remove(storedReference: string): Promise<void> {
    // Faqat shu provayderga tegishli (ommaviy URL bilan boshlangan) havolalar.
    const base = this.config.publicUrl.replace(/\/+$/, '');
    if (!storedReference.startsWith(base + '/')) return;

    const key = storedReference.slice(base.length + 1);
    try {
      const [client, mod] = await Promise.all([
        this.getClient(),
        import('@aws-sdk/client-s3' as string),
      ]);
      await client.send(
        new mod.DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }),
      );
    } catch (e) {
      this.logger.warn(`S3 obyektni o'chirishda xato: ${key}`);
    }
  }
}
