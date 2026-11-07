import * as fs from 'fs';
import * as fsAsync from 'fs/promises';
import * as path from 'path';

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

async function assertRealImage(file: Express.Multer.File): Promise<void> {
  let handle: fsAsync.FileHandle | undefined;
  try {
    handle = await fsAsync.open(file.path, 'r');
    const buf = Buffer.alloc(12);
    const { bytesRead } = await handle.read(buf, 0, 12, 0);
    if (bytesRead < 12) throw new BadRequestException('Fayl buzilgan yoki juda kichik');
    const matched = MAGIC.find((m) => m.check(buf));
    if (!matched) throw new BadRequestException('Fayl haqiqiy rasm emas. Faqat JPEG, PNG yoki WebP yuboring.');
    if (matched.mime !== file.mimetype) {
      throw new BadRequestException(
        `Fayl mazmuni e'lon qilingan turga mos emas (${file.mimetype} deyilgan, aslida ${matched.mime})`,
      );
    }
  } finally {
    await handle?.close();
  }
}
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { PrismaService } from '../../common/prisma/prisma.service';
import { STORAGE_PROVIDER } from '../../common/storage/storage.types';
import type { StorageProvider } from '../../common/storage/storage.types';
import { BANNER_ALLOWED_MIMES, BANNER_MAX_SIZE_BYTES } from './banners.constants';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { BannerResponseDto } from './dto/banner-response.dto';

export interface BannerFiles {
  image_uz?: Express.Multer.File;
  image_ru?: Express.Multer.File;
  image_en?: Express.Multer.File;
}

const TRANSFORM_OPTIONS = { excludeExtraneousValues: true };

@Injectable()
export class BannersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  /** Berilgan locale rasmlarni doimiy omborga o'tkazadi. */
  private async persistImages(files: BannerFiles): Promise<{
    image_uz?: string; image_ru?: string; image_en?: string;
  }> {
    const out: { image_uz?: string; image_ru?: string; image_en?: string } = {};
    if (files.image_uz) out.image_uz = await this.storage.persist(files.image_uz, 'banners');
    if (files.image_ru) out.image_ru = await this.storage.persist(files.image_ru, 'banners');
    if (files.image_en) out.image_en = await this.storage.persist(files.image_en, 'banners');
    return out;
  }

  async findAll(): Promise<BannerResponseDto[]> {
    const banners = await this.prisma.banner.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' },
    });
    return plainToInstance(BannerResponseDto, banners, TRANSFORM_OPTIONS);
  }

  async findAllAdmin(): Promise<BannerResponseDto[]> {
    const banners = await this.prisma.banner.findMany({
      orderBy: { sort_order: 'asc' },
    });
    return plainToInstance(BannerResponseDto, banners, TRANSFORM_OPTIONS);
  }

  async findOne(id: string): Promise<BannerResponseDto> {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner topilmadi');
    return plainToInstance(BannerResponseDto, banner, TRANSFORM_OPTIONS);
  }

  async create(dto: CreateBannerDto, files: BannerFiles): Promise<BannerResponseDto> {
    await this.validateFiles(files, true);

    const stored = await this.persistImages(files);

    const banner = await this.prisma.banner.create({
      data: {
        title_uz: dto.title_uz ?? null,
        title_ru: dto.title_ru ?? null,
        title_en: dto.title_en ?? null,
        subtitle_uz: dto.subtitle_uz ?? null,
        subtitle_ru: dto.subtitle_ru ?? null,
        subtitle_en: dto.subtitle_en ?? null,
        image_uz: stored.image_uz ?? null,
        image_ru: stored.image_ru ?? null,
        image_en: stored.image_en ?? null,
        link: dto.link,
        sort_order: dto.sort_order ?? 0,
        is_active: dto.is_active ?? true,
      },
    });
    return plainToInstance(BannerResponseDto, banner, TRANSFORM_OPTIONS);
  }

  async update(
    id: string,
    dto: UpdateBannerDto,
    files: BannerFiles,
  ): Promise<BannerResponseDto> {
    const hasBodyChanges =
      dto.title_uz !== undefined ||
      dto.title_ru !== undefined ||
      dto.title_en !== undefined ||
      dto.subtitle_uz !== undefined ||
      dto.subtitle_ru !== undefined ||
      dto.subtitle_en !== undefined ||
      dto.link !== undefined ||
      dto.sort_order !== undefined ||
      dto.is_active !== undefined;

    const hasFileChanges = !!(files.image_uz || files.image_ru || files.image_en);

    if (!hasBodyChanges && !hasFileChanges) {
      throw new BadRequestException('Yangilash uchun kamida bitta maydon yoki rasm yuborilishi kerak');
    }

    if (hasFileChanges) await this.validateFiles(files, false);

    const existing = await this.prisma.banner.findUnique({ where: { id } });

    if (!existing) {
      this.deleteFiles(files);
      throw new NotFoundException('Banner topilmadi');
    }

    let stored: { image_uz?: string; image_ru?: string; image_en?: string } = {};
    try {
      stored = await this.persistImages(files);

      const banner = await this.prisma.banner.update({
        where: { id },
        data: {
          ...(dto.title_uz !== undefined && { title_uz: dto.title_uz }),
          ...(dto.title_ru !== undefined && { title_ru: dto.title_ru }),
          ...(dto.title_en !== undefined && { title_en: dto.title_en }),
          ...(dto.subtitle_uz !== undefined && { subtitle_uz: dto.subtitle_uz }),
          ...(dto.subtitle_ru !== undefined && { subtitle_ru: dto.subtitle_ru }),
          ...(dto.subtitle_en !== undefined && { subtitle_en: dto.subtitle_en }),
          ...(stored.image_uz && { image_uz: stored.image_uz }),
          ...(stored.image_ru && { image_ru: stored.image_ru }),
          ...(stored.image_en && { image_en: stored.image_en }),
          ...(dto.link !== undefined && { link: dto.link }),
          ...(dto.sort_order !== undefined && { sort_order: dto.sort_order }),
          ...(dto.is_active !== undefined && { is_active: dto.is_active }),
        },
      });

      // Yangi rasmlar saqlandi — eskilarini omurdan o'chiramiz.
      if (stored.image_uz && existing.image_uz) await this.storage.remove(existing.image_uz);
      if (stored.image_ru && existing.image_ru) await this.storage.remove(existing.image_ru);
      if (stored.image_en && existing.image_en) await this.storage.remove(existing.image_en);

      return plainToInstance(BannerResponseDto, banner, TRANSFORM_OPTIONS);
    } catch (error) {
      // Rollback: saqlangan yangi rasmlarni, aks holda temp fayllarni o'chiramiz.
      const persisted = [stored.image_uz, stored.image_ru, stored.image_en].filter(Boolean) as string[];
      if (persisted.length > 0) await Promise.all(persisted.map((r) => this.storage.remove(r)));
      else this.deleteFiles(files);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner topilmadi');

    await this.prisma.banner.delete({ where: { id } });

    if (banner.image_uz) await this.storage.remove(banner.image_uz);
    if (banner.image_ru) await this.storage.remove(banner.image_ru);
    if (banner.image_en) await this.storage.remove(banner.image_en);
  }

  private async validateFiles(files: BannerFiles, allRequired: boolean): Promise<void> {
    const langs: Array<keyof BannerFiles> = ['image_uz', 'image_ru', 'image_en'];
    const labels: Record<keyof BannerFiles, string> = {
      image_uz: "O'zbek tilidagi",
      image_ru: 'Rus tilidagi',
      image_en: 'Ingliz tilidagi',
    };

    for (const lang of langs) {
      const file = files[lang];

      if (!file) {
        if (allRequired) {
          throw new BadRequestException(`${labels[lang]} rasm majburiy (${lang})`);
        }
        continue;
      }

      if (!(BANNER_ALLOWED_MIMES as readonly string[]).includes(file.mimetype)) {
        this.deleteFiles(files);
        throw new BadRequestException(
          `${labels[lang]} rasm turi noto'g'ri. Faqat: ${BANNER_ALLOWED_MIMES.join(', ')}`,
        );
      }

      if (file.size > BANNER_MAX_SIZE_BYTES) {
        this.deleteFiles(files);
        throw new BadRequestException(
          `${labels[lang]} rasm hajmi ${BANNER_MAX_SIZE_BYTES / 1024 / 1024}MB dan oshmasligi kerak`,
        );
      }

      try {
        await assertRealImage(file);
      } catch (err) {
        this.deleteFiles(files);
        throw err;
      }
    }
  }

  private deleteFiles(files: BannerFiles): void {
    if (files.image_uz) this.deleteFile(files.image_uz.path);
    if (files.image_ru) this.deleteFile(files.image_ru.path);
    if (files.image_en) this.deleteFile(files.image_en.path);
  }

  private deleteFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch {
      // Silent
    }
  }
}
