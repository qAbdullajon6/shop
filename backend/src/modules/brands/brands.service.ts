import * as fs from 'fs';
import * as path from 'path';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { Inject } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { STORAGE_PROVIDER } from '../../common/storage/storage.types';
import type { StorageProvider } from '../../common/storage/storage.types';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandResponseDto } from './dto/brand-response.dto';

const TRANSFORM_OPTIONS = { excludeExtraneousValues: true };

function generateSlug(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!slug) {
    throw new BadRequestException(
      "Nomdan slug hosil qilib bo'lmadi — lotin harflardan foydalaning",
    );
  }
  return slug;
}

@Injectable()
export class BrandsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  async findAll(): Promise<BrandResponseDto[]> {
    const brands = await this.prisma.brand.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' },
    });
    return plainToInstance(BrandResponseDto, brands, TRANSFORM_OPTIONS);
  }

  async findAllAdmin(): Promise<BrandResponseDto[]> {
    const brands = await this.prisma.brand.findMany({
      orderBy: { name: 'asc' },
    });
    return plainToInstance(BrandResponseDto, brands, TRANSFORM_OPTIONS);
  }

  async findBySlug(slug: string): Promise<BrandResponseDto> {
    const brand = await this.prisma.brand.findUnique({ where: { slug } });
    if (!brand) throw new NotFoundException('Brand topilmadi');
    return plainToInstance(BrandResponseDto, brand, TRANSFORM_OPTIONS);
  }

  async create(
    dto: CreateBrandDto,
    file?: Express.Multer.File,
  ): Promise<BrandResponseDto> {
    const slug = dto.slug ?? generateSlug(dto.name);

    const existing = await this.prisma.brand.findFirst({
      where: { OR: [{ name: dto.name }, { slug }] },
    });

    if (existing) {
      if (file) this.deleteFile(file.path);
      if (existing.name === dto.name) {
        throw new ConflictException('Bu nomdagi brand allaqachon mavjud');
      }
      throw new ConflictException('Bu slug allaqachon band');
    }

    const logoPath = file ? await this.storage.persist(file, 'brand-logos') : null;

    const brand = await this.prisma.brand.create({
      data: {
        name: dto.name,
        slug,
        logo: logoPath,
        description_uz: dto.description_uz ?? null,
        description_ru: dto.description_ru ?? null,
        description_en: dto.description_en ?? null,
        is_active: dto.is_active ?? true,
      },
    });

    return plainToInstance(BrandResponseDto, brand, TRANSFORM_OPTIONS);
  }

  async update(
    id: string,
    dto: UpdateBrandDto,
    file?: Express.Multer.File,
  ): Promise<BrandResponseDto> {
    const hasBodyChanges =
      dto.name !== undefined ||
      dto.slug !== undefined ||
      dto.description_uz !== undefined ||
      dto.description_ru !== undefined ||
      dto.description_en !== undefined ||
      dto.is_active !== undefined;

    if (!hasBodyChanges && !file) {
      throw new BadRequestException(
        'Yangilash uchun kamida bitta maydon yoki logo yuborilishi kerak',
      );
    }

    const existing = await this.prisma.brand.findUnique({ where: { id } });

    if (!existing) {
      if (file) this.deleteFile(file.path);
      throw new NotFoundException('Brand topilmadi');
    }

    const newSlug = dto.slug ?? (dto.name ? generateSlug(dto.name) : undefined);

    if (dto.name !== undefined || newSlug !== undefined) {
      const conflict = await this.prisma.brand.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(dto.name !== undefined ? [{ name: dto.name }] : []),
                ...(newSlug !== undefined ? [{ slug: newSlug }] : []),
              ],
            },
          ],
        },
      });

      if (conflict) {
        if (file) this.deleteFile(file.path);
        if (dto.name !== undefined && conflict.name === dto.name) {
          throw new ConflictException('Bu nomdagi brand allaqachon mavjud');
        }
        throw new ConflictException('Bu slug allaqachon band');
      }
    }

    let newLogoPath: string | undefined;
    try {
      newLogoPath = file ? await this.storage.persist(file, 'brand-logos') : undefined;

      const brand = await this.prisma.brand.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(newSlug !== undefined && { slug: newSlug }),
          ...(newLogoPath !== undefined && { logo: newLogoPath }),
          ...(dto.description_uz !== undefined && { description_uz: dto.description_uz }),
          ...(dto.description_ru !== undefined && { description_ru: dto.description_ru }),
          ...(dto.description_en !== undefined && { description_en: dto.description_en }),
          ...(dto.is_active !== undefined && { is_active: dto.is_active }),
        },
      });

      // Yangi logo saqlandi — eskisini omurdan o'chiramiz.
      if (newLogoPath && existing.logo) {
        await this.storage.remove(existing.logo);
      }

      return plainToInstance(BrandResponseDto, brand, TRANSFORM_OPTIONS);
    } catch (error) {
      // Rollback: agar yangi logo saqlangan bo'lsa uni, aks holda temp faylni.
      if (newLogoPath) await this.storage.remove(newLogoPath);
      else if (file) this.deleteFile(file.path);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException('Brand topilmadi');

    const hasProducts = await this.prisma.product.count({ where: { brand_id: id } });
    if (hasProducts > 0) {
      throw new ConflictException(
        "Brandga tegishli mahsulotlar mavjud — avval mahsulotlarni o'chiring yoki boshqa brandga o'tkazing",
      );
    }

    await this.prisma.brand.delete({ where: { id } });

    if (brand.logo) {
      await this.storage.remove(brand.logo);
    }
  }

  private deleteFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch {
      // Silent — fayl allaqachon o'chirilgan bo'lishi mumkin
    }
  }
}
