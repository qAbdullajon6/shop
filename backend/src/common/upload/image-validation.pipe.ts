import * as fs from 'fs/promises';
import {
  BadRequestException,
  Injectable,
  Logger,
  PipeTransform,
} from '@nestjs/common';

import { ALLOWED_IMAGE_MIMES, DEFAULT_MAX_SIZE_BYTES } from './upload.factory';

/**
 * Fayl boshidagi "sehrli baytlar" — haqiqiy format imzosi.
 * Content-Type sarlavhasini mijoz yozadi, bu baytlarni esa yo'q.
 */
const MAGIC_BYTES: { mime: string; check: (buf: Buffer) => boolean }[] = [
  {
    mime: 'image/jpeg',
    check: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    mime: 'image/png',
    check: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
      b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  },
  {
    mime: 'image/webp',
    // "RIFF" .... "WEBP"
    check: (b) =>
      b.subarray(0, 4).toString('ascii') === 'RIFF' &&
      b.subarray(8, 12).toString('ascii') === 'WEBP',
  },
];

export interface ImageValidationOptions {
  required?: boolean;
  maxSizeBytes?: number;
}

/**
 * Yuklangan rasmlarni MAZMUNI bo'yicha tekshiradi.
 *
 * multer `fileFilter` faqat mijoz yuborgan `Content-Type` ni ko'radi, uni
 * esa istalgan odam soxtalashtira oladi: zararli skriptni `image/jpeg`
 * sarlavhasi bilan yuborish mumkin edi. Bu quvur faylning haqiqiy imzosini
 * o'qiydi va mos kelmasa faylni o'chirib, so'rovni rad etadi.
 */
@Injectable()
export class ImageValidationPipe implements PipeTransform {
  private readonly logger = new Logger(ImageValidationPipe.name);

  constructor(private readonly options: ImageValidationOptions = {}) {}

  async transform(
    files: Express.Multer.File[] | Express.Multer.File | undefined,
  ): Promise<Express.Multer.File[]> {
    const list = this.normalize(files);

    if (list.length === 0) {
      if (this.options.required) {
        throw new BadRequestException(
          "Kamida bitta rasm yuborilishi kerak — 'images' maydonini to'ldiring",
        );
      }
      return [];
    }

    const maxSize = this.options.maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES;

    try {
      for (const file of list) {
        if (!(ALLOWED_IMAGE_MIMES as readonly string[]).includes(file.mimetype)) {
          throw new BadRequestException(
            `Fayl turi qabul qilinmaydi: ${file.mimetype}`,
          );
        }

        if (file.size > maxSize) {
          throw new BadRequestException(
            `Fayl hajmi ${Math.round(maxSize / 1024 / 1024)}MB dan oshmasligi kerak`,
          );
        }

        if (file.size === 0) {
          throw new BadRequestException("Bo'sh fayl yuborildi");
        }

        await this.assertRealImage(file);
      }
    } catch (error) {
      // Rad etilgan yuklama diskda qolmasligi kerak.
      await this.cleanup(list);
      throw error;
    }

    return list;
  }

  /** Faylning dastlabki baytlarini o'qib, e'lon qilingan turga solishtiradi. */
  private async assertRealImage(file: Express.Multer.File): Promise<void> {
    let handle: fs.FileHandle | undefined;

    try {
      handle = await fs.open(file.path, 'r');
      const buffer = Buffer.alloc(12);
      const { bytesRead } = await handle.read(buffer, 0, 12, 0);

      if (bytesRead < 12) {
        throw new BadRequestException('Fayl buzilgan yoki juda kichik');
      }

      const matched = MAGIC_BYTES.find((m) => m.check(buffer));

      if (!matched) {
        this.logger.warn(
          `Rasm bo'lmagan fayl "${file.mimetype}" sifatida yuborildi: ${file.originalname}`,
        );
        throw new BadRequestException(
          'Fayl haqiqiy rasm emas. Faqat JPEG, PNG yoki WebP yuboring.',
        );
      }

      if (matched.mime !== file.mimetype) {
        throw new BadRequestException(
          `Fayl mazmuni e'lon qilingan turga mos emas ` +
            `(${file.mimetype} deyilgan, aslida ${matched.mime})`,
        );
      }
    } finally {
      await handle?.close();
    }
  }

  private normalize(
    files: Express.Multer.File[] | Express.Multer.File | undefined,
  ): Express.Multer.File[] {
    if (!files) return [];
    return Array.isArray(files) ? files : [files];
  }

  private async cleanup(files: Express.Multer.File[]): Promise<void> {
    await Promise.all(
      files.map(async (file) => {
        try {
          await fs.unlink(file.path);
        } catch {
          // Fayl allaqachon yo'q — muammo emas.
        }
      }),
    );
  }
}
