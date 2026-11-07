import * as fs from 'fs';
import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { BANNER_ALLOWED_MIMES, BANNER_MAX_SIZE_BYTES } from './banners.constants';

@Injectable()
export class BannerFilePipe implements PipeTransform {
  constructor(private readonly required: boolean = true) {}

  transform(file: Express.Multer.File | undefined, _meta: ArgumentMetadata): Express.Multer.File | undefined {
    if (!file) {
      if (this.required) {
        throw new BadRequestException("Banner rasmi majburiy — 'image' maydonini yuboring");
      }
      return undefined;
    }

    // Fayl turi tekshiruvi (multer fileFilter o'tmagan holat uchun xavfsizlik qatlami)
    if (!(BANNER_ALLOWED_MIMES as readonly string[]).includes(file.mimetype)) {
      this.cleanup(file.path);
      throw new BadRequestException(
        `Fayl turi noto'g'ri. Faqat qabul qilinadi: ${BANNER_ALLOWED_MIMES.join(', ')}`,
      );
    }

    // Fayl hajmi tekshiruvi
    if (file.size > BANNER_MAX_SIZE_BYTES) {
      this.cleanup(file.path);
      throw new BadRequestException(
        `Fayl hajmi ${BANNER_MAX_SIZE_BYTES / 1024 / 1024}MB dan oshmasligi kerak`,
      );
    }

    return file;
  }

  private cleanup(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch {
      // Silent — fayl allaqachon o'chirilgan bo'lishi mumkin
    }
  }
}
