import * as fs from 'fs';
import * as fsAsync from 'fs/promises';
import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { BRAND_ALLOWED_MIMES, BRAND_MAX_SIZE_BYTES } from './brands.constants';

const MAGIC: { mime: string; check: (b: Buffer) => boolean }[] = [
  { mime: 'image/jpeg', check: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    mime: 'image/png',
    check: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
      b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  },
  {
    mime: 'image/webp',
    check: (b) =>
      b.subarray(0, 4).toString('ascii') === 'RIFF' &&
      b.subarray(8, 12).toString('ascii') === 'WEBP',
  },
];

@Injectable()
export class BrandFilePipe implements PipeTransform {
  constructor(private readonly required: boolean = false) {}

  async transform(file: Express.Multer.File | undefined, _meta: ArgumentMetadata): Promise<Express.Multer.File | undefined> {
    if (!file) {
      if (this.required) {
        throw new BadRequestException("Brand logosi majburiy — 'logo' maydonini yuboring");
      }
      return undefined;
    }

    if (!(BRAND_ALLOWED_MIMES as readonly string[]).includes(file.mimetype)) {
      this.cleanup(file.path);
      throw new BadRequestException(
        `Fayl turi noto'g'ri. Faqat qabul qilinadi: ${BRAND_ALLOWED_MIMES.join(', ')}`,
      );
    }

    if (file.size > BRAND_MAX_SIZE_BYTES) {
      this.cleanup(file.path);
      throw new BadRequestException(
        `Fayl hajmi ${BRAND_MAX_SIZE_BYTES / 1024 / 1024}MB dan oshmasligi kerak`,
      );
    }

    await this.assertRealImage(file);

    return file;
  }

  private async assertRealImage(file: Express.Multer.File): Promise<void> {
    let handle: fsAsync.FileHandle | undefined;
    try {
      handle = await fsAsync.open(file.path, 'r');
      const buf = Buffer.alloc(12);
      const { bytesRead } = await handle.read(buf, 0, 12, 0);
      if (bytesRead < 12) {
        this.cleanup(file.path);
        throw new BadRequestException('Fayl buzilgan yoki juda kichik');
      }
      const matched = MAGIC.find((m) => m.check(buf));
      if (!matched) {
        this.cleanup(file.path);
        throw new BadRequestException('Fayl haqiqiy rasm emas. Faqat JPEG, PNG yoki WebP yuboring.');
      }
      if (matched.mime !== file.mimetype) {
        this.cleanup(file.path);
        throw new BadRequestException(
          `Fayl mazmuni e'lon qilingan turga mos emas (${file.mimetype} deyilgan, aslida ${matched.mime})`,
        );
      }
    } finally {
      await handle?.close();
    }
  }

  private cleanup(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch {
      // Silent
    }
  }
}
