import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { StorageProvider } from './storage.types';

/**
 * Diskdagi ./uploads ombori.
 *
 * Multer faylni allaqachon `./uploads/<subdir>/<uuid>.<ext>` ga yozgan bo'ladi,
 * shu sabab `persist` faqat nisbiy yo'lni qaytaradi (fayl joyida qoladi). Bu
 * mavjud (tekshirilgan) local xatti-harakatni aynan saqlaydi.
 *
 * Ishlab chiqarishda BARQAROR (persistent) volume ./uploads ga ulanishi shart —
 * aks holda qayta deploy'da rasmlar yo'qoladi. Ephemeral hosting uchun S3 ni
 * ishlating (STORAGE_DRIVER=s3).
 */
@Injectable()
export class LocalStorageProvider implements StorageProvider {
  readonly name = 'local' as const;
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly uploadsRoot = path.resolve(process.cwd(), 'uploads');

  async persist(file: Express.Multer.File, subdirectory: string): Promise<string> {
    // Multer diskStorage faylni yozgan — nisbiy DB yo'lini qaytaramiz.
    return `uploads/${subdirectory}/${file.filename}`;
  }

  async remove(storedReference: string): Promise<void> {
    // Faqat http bo'lmagan (local) havolalar bu provayder tomonidan o'chiriladi.
    if (/^https?:\/\//i.test(storedReference)) return;

    const resolved = path.resolve(process.cwd(), storedReference);

    // Path-traversal himoyasi — faqat uploads ildizi ichidagi fayllar.
    if (resolved !== this.uploadsRoot && !resolved.startsWith(this.uploadsRoot + path.sep)) {
      this.logger.warn(`uploads tashqarisidagi yo'l o'chirilmadi: ${storedReference}`);
      return;
    }

    try {
      await fs.unlink(resolved);
    } catch {
      // Fayl allaqachon yo'q — muammo emas.
    }
  }

  /** Yordamchi: subkatalog mavjudligini kafolatlaydi (multer ham qiladi). */
  ensureDir(subdirectory: string): void {
    fsSync.mkdirSync(path.join(this.uploadsRoot, subdirectory), { recursive: true });
  }
}
