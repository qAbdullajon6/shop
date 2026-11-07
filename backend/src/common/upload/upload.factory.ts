import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

/** Ruxsat etilgan rasm turlari va ularning haqiqiy kengaytmalari. */
export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export const DEFAULT_MAX_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Yuklash sozlamalarini yaratadi.
 *
 * Ilgari har bir modulda alohida nusxa bor edi va ularning HECH BIRIDA
 * `limits` yo'q edi — e'lon qilingan 5MB chegara multer'ga hech qachon
 * uzatilmagan, ya'ni yuklash hajmi cheklanmagan edi (diskni to'ldirish
 * orqali xizmatni to'xtatish mumkin).
 *
 * Bu fabrika quyidagilarni majburlaydi:
 *   • multer darajasidagi haqiqiy hajm chegarasi
 *   • MIME sarlavhasi bo'yicha dastlabki filtr
 *   • fayl nomi SERVER tomonda yaratiladi (mijoz nomi ishlatilmaydi)
 *   • kengaytma MIME dan olinadi, `originalname` dan emas — mijoz
 *     `.php`/`.svg` kengaytmasini kiritib yubora olmaydi
 */
export function createUploadOptions(config: {
  subdirectory: string;
  maxSizeBytes?: number;
  maxFiles?: number;
}): MulterOptions {
  const destination = path.join(process.cwd(), 'uploads', config.subdirectory);
  const maxSize = config.maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES;

  return {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        fs.mkdirSync(destination, { recursive: true });
        cb(null, destination);
      },
      filename: (_req, file, cb) => {
        // Kengaytma MIME turidan — mijoz bergan nom umuman ishlatilmaydi,
        // shu bilan path traversal va ikki kengaytmali hujumlar yopiladi.
        const extension = MIME_TO_EXTENSION[file.mimetype] ?? '.bin';
        cb(null, `${crypto.randomUUID()}${extension}`);
      },
    }),

    // Haqiqiy chegara — endi e'lon qilinibgina qolmay, majburlanadi ham.
    limits: {
      fileSize: maxSize,
      files: config.maxFiles ?? 10,
      fields: 40,
      // Fayl nomi va maydon nomi uchun cheklovlar — xotira sarfini cheklaydi.
      fieldNameSize: 200,
      fieldSize: 1024 * 1024,
    },

    fileFilter: (_req, file, cb) => {
      if (!(ALLOWED_IMAGE_MIMES as readonly string[]).includes(file.mimetype)) {
        cb(
          new BadRequestException(
            `Fayl turi qabul qilinmaydi. Ruxsat etilgan: ${ALLOWED_IMAGE_MIMES.join(', ')}`,
          ),
          false,
        );
        return;
      }
      cb(null, true);
    },
  };
}
