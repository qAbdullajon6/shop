import * as fs from 'fs';
import * as path from 'path';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { PrismaService } from '../../common/prisma/prisma.service';
import { CATEGORY_ALLOWED_MIMES, CATEGORY_MAX_SIZE_BYTES } from './categories.constants';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

export interface CategoryFiles {
  image_uz?: Express.Multer.File;
  image_ru?: Express.Multer.File;
  image_en?: Express.Multer.File;
}

function generateSlug(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!slug) throw new BadRequestException("Nom asosida slug yaratib bo'lmadi. Iltimos slug ni qo'lda kiriting");

  return slug;
}

const TRANSFORM_OPTIONS = { excludeExtraneousValues: true };

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CategoryResponseDto[]> {
    const categories = await this.prisma.category.findMany({
      where: { is_active: true, parent_id: null },
      include: { children: { where: { is_active: true }, orderBy: { sort_order: 'asc' } } },
      orderBy: { sort_order: 'asc' },
    });

    return plainToInstance(CategoryResponseDto, categories, TRANSFORM_OPTIONS);
  }

  async findAllAdmin(): Promise<CategoryResponseDto[]> {
    const categories = await this.prisma.category.findMany({
      where: { parent_id: null },
      include: { children: { orderBy: { sort_order: 'asc' } } },
      orderBy: { sort_order: 'asc' },
    });

    return plainToInstance(CategoryResponseDto, categories, TRANSFORM_OPTIONS);
  }

  async findBySlug(slug: string): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: { orderBy: { sort_order: 'asc' } },
      },
    });

    if (!category) throw new NotFoundException('Kategoriya topilmadi');

    return plainToInstance(CategoryResponseDto, category, TRANSFORM_OPTIONS);
  }

  async create(dto: CreateCategoryDto, files: CategoryFiles): Promise<CategoryResponseDto> {
    this.validateFiles(files, false);

    const slug = dto.slug ?? generateSlug(dto.name_uz);

    if (await this.slugTaken(slug)) {
      this.deleteFiles(files);
      throw new ConflictException(`"${slug}" slug allaqachon mavjud`);
    }

    if (dto.parent_id) {
      const parent = await this.prisma.category.findUnique({ where: { id: dto.parent_id } });
      if (!parent) {
        this.deleteFiles(files);
        throw new NotFoundException('Ota-kategoriya topilmadi');
      }
    }

    const category = await this.prisma.category.create({
      data: {
        name_uz: dto.name_uz,
        name_ru: dto.name_ru,
        name_en: dto.name_en,
        slug,
        description_uz: dto.description_uz,
        description_ru: dto.description_ru,
        description_en: dto.description_en,
        parent_id: dto.parent_id,
        sort_order: dto.sort_order ?? 0,
        is_active: dto.is_active ?? true,
        image_uz: files.image_uz ? `uploads/categories/${files.image_uz.filename}` : null,
        image_ru: files.image_ru ? `uploads/categories/${files.image_ru.filename}` : null,
        image_en: files.image_en ? `uploads/categories/${files.image_en.filename}` : null,
      },
      include: { parent: true, children: true },
    });

    return plainToInstance(CategoryResponseDto, category, TRANSFORM_OPTIONS);
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
    files: CategoryFiles,
  ): Promise<CategoryResponseDto> {
    const hasBodyChanges =
      dto.name_uz !== undefined ||
      dto.name_ru !== undefined ||
      dto.name_en !== undefined ||
      dto.slug !== undefined ||
      dto.description_uz !== undefined ||
      dto.description_ru !== undefined ||
      dto.description_en !== undefined ||
      dto.parent_id !== undefined ||
      dto.sort_order !== undefined ||
      dto.is_active !== undefined;

    const hasFileChanges = !!(files.image_uz || files.image_ru || files.image_en);

    if (!hasBodyChanges && !hasFileChanges) {
      throw new BadRequestException('Yangilash uchun kamida bitta maydon yoki rasm yuborilishi kerak');
    }

    if (hasFileChanges) this.validateFiles(files, false);

    const existing = await this.prisma.category.findUnique({ where: { id } });

    if (!existing) {
      this.deleteFiles(files);
      throw new NotFoundException('Kategoriya topilmadi');
    }

    const slug = dto.slug ?? (dto.name_uz ? generateSlug(dto.name_uz) : undefined);

    if (slug && slug !== existing.slug && await this.slugTaken(slug)) {
      this.deleteFiles(files);
      throw new ConflictException(`"${slug}" slug allaqachon mavjud`);
    }

    if (dto.parent_id) {
      if (dto.parent_id === id) {
        this.deleteFiles(files);
        throw new BadRequestException("Kategoriya o'ziga ota-kategoriya bo'la olmaydi");
      }
      const parent = await this.prisma.category.findUnique({ where: { id: dto.parent_id } });
      if (!parent) {
        this.deleteFiles(files);
        throw new NotFoundException('Ota-kategoriya topilmadi');
      }
    }

    try {
      const category = await this.prisma.category.update({
        where: { id },
        data: {
          ...(dto.name_uz !== undefined && { name_uz: dto.name_uz }),
          ...(dto.name_ru !== undefined && { name_ru: dto.name_ru }),
          ...(dto.name_en !== undefined && { name_en: dto.name_en }),
          ...(slug && { slug }),
          ...(dto.description_uz !== undefined && { description_uz: dto.description_uz }),
          ...(dto.description_ru !== undefined && { description_ru: dto.description_ru }),
          ...(dto.description_en !== undefined && { description_en: dto.description_en }),
          ...(dto.parent_id !== undefined && { parent_id: dto.parent_id }),
          ...(dto.sort_order !== undefined && { sort_order: dto.sort_order }),
          ...(dto.is_active !== undefined && { is_active: dto.is_active }),
          ...(files.image_uz && { image_uz: `uploads/categories/${files.image_uz.filename}` }),
          ...(files.image_ru && { image_ru: `uploads/categories/${files.image_ru.filename}` }),
          ...(files.image_en && { image_en: `uploads/categories/${files.image_en.filename}` }),
        },
        include: { parent: true, children: true },
      });

      if (files.image_uz && existing.image_uz) this.deleteFile(path.join(process.cwd(), existing.image_uz));
      if (files.image_ru && existing.image_ru) this.deleteFile(path.join(process.cwd(), existing.image_ru));
      if (files.image_en && existing.image_en) this.deleteFile(path.join(process.cwd(), existing.image_en));

      return plainToInstance(CategoryResponseDto, category, TRANSFORM_OPTIONS);
    } catch (error) {
      this.deleteFiles(files);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { children: true, products: true } } },
    });

    if (!category) throw new NotFoundException('Kategoriya topilmadi');

    if (category._count.children > 0) {
      throw new ConflictException(
        `Bu kategoriyada ${category._count.children} ta pastki kategoriya mavjud. Avval ularni o'chiring`,
      );
    }

    if (category._count.products > 0) {
      throw new ConflictException(
        `Bu kategoriyada ${category._count.products} ta mahsulot mavjud. Avval mahsulotlarni boshqa kategoriyaga o'tkazing`,
      );
    }

    await this.prisma.category.delete({ where: { id } });

    if (category.image_uz) this.deleteFile(path.join(process.cwd(), category.image_uz));
    if (category.image_ru) this.deleteFile(path.join(process.cwd(), category.image_ru));
    if (category.image_en) this.deleteFile(path.join(process.cwd(), category.image_en));
  }

  private validateFiles(files: CategoryFiles, allRequired: boolean): void {
    const langs: Array<keyof CategoryFiles> = ['image_uz', 'image_ru', 'image_en'];
    const labels: Record<keyof CategoryFiles, string> = {
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

      if (!(CATEGORY_ALLOWED_MIMES as readonly string[]).includes(file.mimetype)) {
        this.deleteFiles(files);
        throw new BadRequestException(
          `${labels[lang]} rasm turi noto'g'ri. Faqat: ${CATEGORY_ALLOWED_MIMES.join(', ')}`,
        );
      }

      if (file.size > CATEGORY_MAX_SIZE_BYTES) {
        this.deleteFiles(files);
        throw new BadRequestException(
          `${labels[lang]} rasm hajmi ${CATEGORY_MAX_SIZE_BYTES / 1024 / 1024}MB dan oshmasligi kerak`,
        );
      }
    }
  }

  private async slugTaken(slug: string): Promise<boolean> {
    const existing = await this.prisma.category.findUnique({ where: { slug }, select: { id: true } });
    return existing !== null;
  }

  private deleteFiles(files: CategoryFiles): void {
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
