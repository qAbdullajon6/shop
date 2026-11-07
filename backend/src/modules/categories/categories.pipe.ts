import * as fs from 'fs';
import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { CATEGORY_ALLOWED_MIMES, CATEGORY_MAX_SIZE_BYTES } from './categories.constants';

@Injectable()
export class CategoryFilePipe implements PipeTransform {
  constructor(private readonly required: boolean = true) {}

  transform(file: Express.Multer.File | undefined, _meta: ArgumentMetadata): Express.Multer.File | undefined {
    if (!file) {
      if (this.required) {
        throw new BadRequestException("Kategoriya rasmi majburiy — 'image' maydonini yuboring");
      }
      return undefined;
    }

    if (!(CATEGORY_ALLOWED_MIMES as readonly string[]).includes(file.mimetype)) {
      this.cleanup(file.path);
      throw new BadRequestException(
        `Fayl turi noto'g'ri. Faqat qabul qilinadi: ${CATEGORY_ALLOWED_MIMES.join(', ')}`,
      );
    }

    if (file.size > CATEGORY_MAX_SIZE_BYTES) {
      this.cleanup(file.path);
      throw new BadRequestException(
        `Fayl hajmi ${CATEGORY_MAX_SIZE_BYTES / 1024 / 1024}MB dan oshmasligi kerak`,
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
