import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AttributeType, Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { slugify } from '../../common/utils/slug.util';
import { ProductMediaService } from './product-media.service';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  ProductAttributeInputDto,
} from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';

/**
 * Mahsulotlar ustidagi yozish amallari (admin panel).
 *
 * O'qish `ProductsService` da. Bu ajratish 778 qatorlik monolit servisni
 * bo'lish uchun qilindi — u so'rov qurish, CRUD, fayl I/O va atribut
 * tekshiruvini bir joyda saqlardi.
 */
@Injectable()
export class ProductsAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly products: ProductsService,
    private readonly media: ProductMediaService,
  ) {}

  async create(
    dto: CreateProductDto,
    files: Express.Multer.File[] = [],
  ): Promise<ProductResponseDto> {
    try {
      const slug = dto.slug ?? slugify(dto.name_uz);

      await this.assertSlugAvailable(slug);
      await this.assertCategoryExists(dto.category_id);
      if (dto.brand_id) await this.assertBrandExists(dto.brand_id);
      await this.assertSkusAvailable(dto.variants.map((v) => v.sku));

      this.assertVariantPricing(dto.variants);

      const attributes = await this.validateAttributes(
        dto.category_id,
        dto.attributes ?? [],
      );

      const product = await this.prisma.$transaction(async (tx) => {
        const created = await tx.product.create({
          data: {
            name_uz: dto.name_uz,
            name_ru: dto.name_ru,
            name_en: dto.name_en,
            slug,
            short_uz: dto.short_uz,
            short_ru: dto.short_ru,
            short_en: dto.short_en,
            description_uz: dto.description_uz,
            description_ru: dto.description_ru,
            description_en: dto.description_en,
            category_id: dto.category_id,
            brand_id: dto.brand_id,
            gender: dto.gender,
            concentration: dto.concentration,
            top_notes: dto.top_notes ?? [],
            heart_notes: dto.heart_notes ?? [],
            base_notes: dto.base_notes ?? [],
            longevity: dto.longevity,
            sillage: dto.sillage,
            country: dto.country,
            release_year: dto.release_year,
            is_active: dto.is_active ?? true,
            is_bestseller: dto.is_bestseller ?? false,
            is_new_arrival: dto.is_new_arrival ?? true,
            is_featured: dto.is_featured ?? false,
            variants: {
              create: dto.variants.map((v, index) => ({
                sku: v.sku,
                barcode: v.barcode,
                volume: v.volume,
                color: v.color,
                color_hex: v.color_hex,
                price: v.price,
                compare_at_price: v.compare_at_price,
                cost_price: v.cost_price,
                stock: v.stock ?? 0,
                low_stock_threshold: v.low_stock_threshold ?? 3,
                // Birinchi variant standart bo'ladi — kartochka nimadir
                // ko'rsatishi kerak.
                is_default: index === 0,
                is_active: v.is_active ?? true,
                sort_order: index,
              })),
            },
            attributes: { create: attributes },
          },
        });

        await this.refreshDenormalizedFields(tx, created.id);
        return created;
      });

      if (files.length > 0) {
        await this.media.attachImages(product.id, files);
      }

      return this.products.findByIdAdmin(product.id);
    } catch (error) {
      // Tranzaksiya bekor bo'lsa yuklangan fayllar yetim qolmasligi kerak.
      await this.media.deleteFiles(files.map((f) => `uploads/products/${f.filename}`));
      throw error;
    }
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    files: Express.Multer.File[] = [],
  ): Promise<ProductResponseDto> {
    try {
      const existing = await this.prisma.product.findFirst({
        where: { id, deleted_at: null },
      });

      if (!existing) throw new NotFoundException('Mahsulot topilmadi');

      const slug = dto.slug ?? (dto.name_uz ? slugify(dto.name_uz) : undefined);

      if (slug && slug !== existing.slug) {
        await this.assertSlugAvailable(slug);
      }

      if (dto.category_id) await this.assertCategoryExists(dto.category_id);
      if (dto.brand_id) await this.assertBrandExists(dto.brand_id);

      const targetCategoryId = dto.category_id ?? existing.category_id;

      const data: Prisma.ProductUpdateInput = {
        ...(dto.name_uz !== undefined && { name_uz: dto.name_uz }),
        ...(dto.name_ru !== undefined && { name_ru: dto.name_ru }),
        ...(dto.name_en !== undefined && { name_en: dto.name_en }),
        ...(slug && { slug }),
        ...(dto.short_uz !== undefined && { short_uz: dto.short_uz }),
        ...(dto.short_ru !== undefined && { short_ru: dto.short_ru }),
        ...(dto.short_en !== undefined && { short_en: dto.short_en }),
        ...(dto.description_uz !== undefined && { description_uz: dto.description_uz }),
        ...(dto.description_ru !== undefined && { description_ru: dto.description_ru }),
        ...(dto.description_en !== undefined && { description_en: dto.description_en }),
        ...(dto.category_id && { category: { connect: { id: dto.category_id } } }),
        ...(dto.brand_id !== undefined && {
          brand: dto.brand_id
            ? { connect: { id: dto.brand_id } }
            : { disconnect: true },
        }),
        ...(dto.gender !== undefined && { gender: dto.gender }),
        ...(dto.concentration !== undefined && { concentration: dto.concentration }),
        ...(dto.top_notes !== undefined && { top_notes: dto.top_notes }),
        ...(dto.heart_notes !== undefined && { heart_notes: dto.heart_notes }),
        ...(dto.base_notes !== undefined && { base_notes: dto.base_notes }),
        ...(dto.longevity !== undefined && { longevity: dto.longevity }),
        ...(dto.sillage !== undefined && { sillage: dto.sillage }),
        ...(dto.country !== undefined && { country: dto.country }),
        ...(dto.release_year !== undefined && { release_year: dto.release_year }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
        ...(dto.is_bestseller !== undefined && { is_bestseller: dto.is_bestseller }),
        ...(dto.is_new_arrival !== undefined && { is_new_arrival: dto.is_new_arrival }),
        ...(dto.is_featured !== undefined && { is_featured: dto.is_featured }),
      };

      await this.prisma.$transaction(async (tx) => {
        await tx.product.update({ where: { id }, data });

        if (dto.attributes !== undefined) {
          const attributes = await this.validateAttributes(
            targetCategoryId,
            dto.attributes,
            tx,
          );

          await tx.productAttribute.deleteMany({ where: { product_id: id } });
          if (attributes.length > 0) {
            await tx.productAttribute.createMany({
              data: attributes.map((a) => ({ ...a, product_id: id })),
            });
          }
        }
      });

      if (files.length > 0) {
        await this.media.attachImages(id, files);
      }

      return this.products.findByIdAdmin(id);
    } catch (error) {
      await this.media.deleteFiles(files.map((f) => `uploads/products/${f.filename}`));
      throw error;
    }
  }

  // ─── Variantlar ────────────────────────────────────────────────────────────

  async upsertVariant(
    productId: string,
    variantId: string | null,
    dto: CreateProductDto['variants'][number],
  ): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deleted_at: null },
      select: { id: true },
    });

    if (!product) throw new NotFoundException('Mahsulot topilmadi');

    this.assertVariantPricing([dto]);

    if (!variantId) {
      await this.assertSkusAvailable([dto.sku]);
    }

    await this.prisma.$transaction(async (tx) => {
      if (variantId) {
        const owned = await tx.productVariant.findFirst({
          where: { id: variantId, product_id: productId },
          select: { id: true },
        });

        if (!owned) throw new NotFoundException('Variant bu mahsulotga tegishli emas');

        await tx.productVariant.update({
          where: { id: variantId },
          data: {
            sku: dto.sku,
            barcode: dto.barcode,
            volume: dto.volume,
            color: dto.color,
            color_hex: dto.color_hex,
            price: dto.price,
            compare_at_price: dto.compare_at_price ?? null,
            cost_price: dto.cost_price,
            stock: dto.stock ?? 0,
            low_stock_threshold: dto.low_stock_threshold ?? 3,
            is_active: dto.is_active ?? true,
          },
        });
      } else {
        await tx.productVariant.create({
          data: {
            product_id: productId,
            sku: dto.sku,
            barcode: dto.barcode,
            volume: dto.volume,
            color: dto.color,
            color_hex: dto.color_hex,
            price: dto.price,
            compare_at_price: dto.compare_at_price ?? null,
            cost_price: dto.cost_price,
            stock: dto.stock ?? 0,
            low_stock_threshold: dto.low_stock_threshold ?? 3,
            is_active: dto.is_active ?? true,
          },
        });
      }

      await this.refreshDenormalizedFields(tx, productId);
    });

    return this.products.findByIdAdmin(productId);
  }

  async removeVariant(productId: string, variantId: string): Promise<ProductResponseDto> {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, product_id: productId },
      include: {
        _count: { select: { order_items: true, purchase_items: true } },
      },
    });

    if (!variant) throw new NotFoundException('Variant topilmadi');

    const variantCount = await this.prisma.productVariant.count({
      where: { product_id: productId },
    });

    if (variantCount <= 1) {
      throw new ConflictException(
        "Mahsulotning oxirgi variantini o'chirib bo'lmaydi — mahsulotni o'chiring",
      );
    }

    await this.prisma.$transaction(async (tx) => {
      if (variant._count.order_items > 0 || variant._count.purchase_items > 0) {
        // Tarixga ega variant o'chirilmaydi — buyurtmalar undan foydalanadi.
        // Uni nofaol qilamiz, shunda katalogdan chiqadi.
        await tx.productVariant.update({
          where: { id: variantId },
          data: { is_active: false },
        });
      } else {
        await tx.productVariant.delete({ where: { id: variantId } });
      }

      await this.refreshDenormalizedFields(tx, productId);
    });

    return this.products.findByIdAdmin(productId);
  }

  // ─── O'chirish ─────────────────────────────────────────────────────────────

  /**
   * Mahsulotni o'chiradi.
   *
   * Buyurtma tarixi bo'lsa SOFT DELETE ishlatiladi: mahsulot katalogdan
   * yo'qoladi, lekin hisob-fakturalar butun qoladi. Ilgari bu holatda 409
   * qaytarilib, admin qo'lda `is_active = false` qilishga majbur edi.
   */
  async remove(id: string): Promise<{ soft_deleted: boolean }> {
    const product = await this.prisma.product.findFirst({
      where: { id, deleted_at: null },
      include: {
        images: { select: { url: true } },
        variants: {
          select: {
            id: true,
            _count: {
              select: { order_items: true, stock_transactions: true, purchase_items: true },
            },
          },
        },
      },
    });

    if (!product) throw new NotFoundException('Mahsulot topilmadi');

    const hasHistory = product.variants.some(
      (v) =>
        v._count.order_items > 0 ||
        v._count.stock_transactions > 0 ||
        v._count.purchase_items > 0,
    );

    if (hasHistory) {
      await this.prisma.product.update({
        where: { id },
        data: { deleted_at: new Date(), is_active: false },
      });
      return { soft_deleted: true };
    }

    const imageUrls = product.images.map((i) => i.url);

    await this.prisma.$transaction([
      this.prisma.cartItem.deleteMany({
        where: { variant_id: { in: product.variants.map((v) => v.id) } },
      }),
      this.prisma.wishlistItem.deleteMany({ where: { product_id: id } }),
      this.prisma.product.delete({ where: { id } }),
    ]);

    await this.media.deleteFiles(imageUrls);

    return { soft_deleted: false };
  }

  async restore(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true, deleted_at: true },
    });

    if (!product) throw new NotFoundException('Mahsulot topilmadi');
    if (!product.deleted_at) throw new BadRequestException("Mahsulot o'chirilmagan");

    await this.prisma.product.update({
      where: { id },
      data: { deleted_at: null, is_active: true },
    });

    return this.products.findByIdAdmin(id);
  }

  // ─── Ichki ─────────────────────────────────────────────────────────────────

  /**
   * `min_price`, `max_price` va `total_stock` ustunlarini variantlardan
   * qayta hisoblaydi.
   *
   * Bu ustunlar narx bo'yicha saralash va "mavjud" filtri uchun kerak —
   * ularsiz Prisma bog'liq jadval agregati bo'yicha saralay olmaydi va
   * "Arzondan qimmatga" tugmasi ishlamaydi.
   */
  private async refreshDenormalizedFields(
    tx: Prisma.TransactionClient,
    productId: string,
  ): Promise<void> {
    const stats = await tx.productVariant.aggregate({
      where: { product_id: productId, is_active: true },
      _min: { price: true },
      _max: { price: true },
      _sum: { stock: true },
    });

    await tx.product.update({
      where: { id: productId },
      data: {
        min_price: stats._min.price,
        max_price: stats._max.price,
        total_stock: stats._sum.stock ?? 0,
      },
    });
  }

  private async assertSlugAvailable(slug: string): Promise<void> {
    const existing = await this.prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existing) throw new ConflictException(`"${slug}" slug allaqachon band`);
  }

  private async assertCategoryExists(categoryId: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });

    if (!category) throw new NotFoundException('Kategoriya topilmadi');
  }

  private async assertBrandExists(brandId: string): Promise<void> {
    const brand = await this.prisma.brand.findUnique({
      where: { id: brandId },
      select: { id: true },
    });

    if (!brand) throw new NotFoundException('Brend topilmadi');
  }

  private async assertSkusAvailable(skus: string[]): Promise<void> {
    if (new Set(skus).size !== skus.length) {
      throw new ConflictException('Variantlarda takroriy SKU mavjud');
    }

    const taken = await this.prisma.productVariant.findMany({
      where: { sku: { in: skus } },
      select: { sku: true },
    });

    if (taken.length > 0) {
      throw new ConflictException(
        `Bu SKU'lar allaqachon band: ${taken.map((v) => v.sku).join(', ')}`,
      );
    }
  }

  /**
   * `compare_at_price` narxdan katta bo'lishi shart — aks holda kartochkada
   * "chegirma" ko'rinadi, lekin aslida narx oshgan bo'ladi. DB darajasida
   * ham `chk_variant_compare_price` bu qoidani majburlaydi; bu yerda
   * tushunarli xato xabari beriladi.
   */
  private assertVariantPricing(
    variants: { sku: string; price: number; compare_at_price?: number | null }[],
  ): void {
    for (const v of variants) {
      if (
        v.compare_at_price !== undefined &&
        v.compare_at_price !== null &&
        v.compare_at_price <= v.price
      ) {
        throw new BadRequestException(
          `"${v.sku}": chegirmagacha narx (${v.compare_at_price}) joriy narxdan ` +
            `(${v.price}) katta bo'lishi kerak`,
        );
      }
    }
  }

  private async validateAttributes(
    categoryId: string,
    inputs: ProductAttributeInputDto[],
    client?: Prisma.TransactionClient,
  ): Promise<{ attribute_id: string; value: string }[]> {
    const db = client ?? this.prisma;

    const categoryAttrs = await db.categoryAttribute.findMany({
      where: { category_id: categoryId },
    });

    const provided = new Map(inputs.map((a) => [a.attribute_id, a.value]));

    for (const attr of categoryAttrs.filter((a) => a.is_required)) {
      if (!provided.has(attr.id)) {
        throw new BadRequestException(`"${attr.name_uz}" maydoni majburiy`);
      }
    }

    const result: { attribute_id: string; value: string }[] = [];

    for (const input of inputs) {
      const attr = categoryAttrs.find((a) => a.id === input.attribute_id);

      if (!attr) {
        throw new BadRequestException(
          `Xususiyat "${input.attribute_id}" bu kategoriyaga tegishli emas`,
        );
      }

      switch (attr.type) {
        case AttributeType.NUMBER:
          if (Number.isNaN(Number(input.value))) {
            throw new BadRequestException(`"${attr.name_uz}" raqam bo'lishi kerak`);
          }
          break;

        case AttributeType.BOOLEAN:
          if (input.value !== 'true' && input.value !== 'false') {
            throw new BadRequestException(`"${attr.name_uz}" true yoki false bo'lishi kerak`);
          }
          break;

        case AttributeType.SELECT:
          if (!attr.options.includes(input.value)) {
            throw new BadRequestException(
              `"${attr.name_uz}" uchun ruxsat etilgan qiymatlar: ${attr.options.join(', ')}`,
            );
          }
          break;

        case AttributeType.MULTI_SELECT: {
          const values = input.value.split(',').map((v) => v.trim());
          const invalid = values.filter((v) => !attr.options.includes(v));
          if (invalid.length > 0) {
            throw new BadRequestException(
              `"${attr.name_uz}" uchun noto'g'ri qiymatlar: ${invalid.join(', ')}`,
            );
          }
          break;
        }

        default:
          break;
      }

      result.push({ attribute_id: input.attribute_id, value: input.value });
    }

    return result;
  }
}
