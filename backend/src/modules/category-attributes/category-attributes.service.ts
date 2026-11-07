import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AttributeType } from '../../../generated/prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCategoryAttributeDto } from './dto/create-category-attribute.dto';
import { UpdateCategoryAttributeDto } from './dto/update-category-attribute.dto';
import { CategoryAttributeResponseDto } from './dto/category-attribute-response.dto';

const TRANSFORM_OPTIONS = { excludeExtraneousValues: true };
const SELECT_TYPES: AttributeType[] = [AttributeType.SELECT, AttributeType.MULTI_SELECT];

@Injectable()
export class CategoryAttributesService {
  constructor(private readonly prisma: PrismaService) {}

  private map(attr: object): CategoryAttributeResponseDto {
    return plainToInstance(CategoryAttributeResponseDto, attr, TRANSFORM_OPTIONS);
  }

  async findByCategory(categoryId: string): Promise<CategoryAttributeResponseDto[]> {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new NotFoundException('Kategoriya topilmadi');

    const attrs = await this.prisma.categoryAttribute.findMany({
      where: { category_id: categoryId },
      orderBy: { sort_order: 'asc' },
    });

    return attrs.map((a) => this.map(a));
  }

  async findOne(id: string): Promise<CategoryAttributeResponseDto> {
    const attr = await this.prisma.categoryAttribute.findUnique({ where: { id } });
    if (!attr) throw new NotFoundException('Xususiyat topilmadi');
    return this.map(attr);
  }

  async create(dto: CreateCategoryAttributeDto): Promise<CategoryAttributeResponseDto> {
    const category = await this.prisma.category.findUnique({ where: { id: dto.category_id } });
    if (!category) throw new NotFoundException('Kategoriya topilmadi');

    this.validateOptions(dto.type, dto.options ?? []);

    const attr = await this.prisma.categoryAttribute.create({
      data: {
        category_id: dto.category_id,
        name_uz: dto.name_uz,
        name_ru: dto.name_ru,
        name_en: dto.name_en,
        slug: dto.slug,
        type: dto.type,
        unit: dto.unit ?? null,
        is_required: dto.is_required ?? false,
        options: dto.options ?? [],
        sort_order: dto.sort_order ?? 0,
      },
    });

    return this.map(attr);
  }

  async update(id: string, dto: UpdateCategoryAttributeDto): Promise<CategoryAttributeResponseDto> {
    const hasChanges =
      dto.name_uz !== undefined ||
      dto.name_ru !== undefined ||
      dto.name_en !== undefined ||
      dto.slug !== undefined ||
      dto.type !== undefined ||
      dto.unit !== undefined ||
      dto.is_required !== undefined ||
      dto.options !== undefined ||
      dto.sort_order !== undefined;

    if (!hasChanges) {
      throw new BadRequestException('Yangilash uchun kamida bitta maydon yuborilishi kerak');
    }

    const existing = await this.prisma.categoryAttribute.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Xususiyat topilmadi');

    const resolvedType = dto.type ?? existing.type;
    const resolvedOptions = dto.options ?? existing.options;
    this.validateOptions(resolvedType, resolvedOptions);

    const attr = await this.prisma.categoryAttribute.update({
      where: { id },
      data: {
        ...(dto.name_uz !== undefined && { name_uz: dto.name_uz }),
        ...(dto.name_ru !== undefined && { name_ru: dto.name_ru }),
        ...(dto.name_en !== undefined && { name_en: dto.name_en }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.unit !== undefined && { unit: dto.unit }),
        ...(dto.is_required !== undefined && { is_required: dto.is_required }),
        ...(dto.options !== undefined && { options: dto.options }),
        ...(dto.sort_order !== undefined && { sort_order: dto.sort_order }),
      },
    });

    return this.map(attr);
  }

  async remove(id: string): Promise<void> {
    const attr = await this.prisma.categoryAttribute.findUnique({ where: { id } });
    if (!attr) throw new NotFoundException('Xususiyat topilmadi');
    await this.prisma.categoryAttribute.delete({ where: { id } });
  }

  private validateOptions(type: AttributeType, options: string[]): void {
    if (SELECT_TYPES.includes(type) && options.length === 0) {
      throw new BadRequestException(
        "SELECT va MULTI_SELECT turlar uchun kamida bitta variant (options) kiritilishi kerak",
      );
    }
    if (!SELECT_TYPES.includes(type) && options.length > 0) {
      throw new BadRequestException(
        "options faqat SELECT va MULTI_SELECT turlari uchun kiritilishi mumkin",
      );
    }
  }
}
