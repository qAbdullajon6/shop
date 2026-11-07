import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { discountPercent } from '../../common/utils/money.util';
import {
  ProductQueryDto,
  ProductSortBy,
  SortOrder,
} from './dto/product-query.dto';
import { ProductListResponseDto, ProductResponseDto } from './dto/product-response.dto';

const TRANSFORM_OPTIONS = { excludeExtraneousValues: true };

/** Ro'yxat kartochkasi uchun yetarli — mahsulot sahifasidan yengilroq. */
export const PRODUCT_CARD_INCLUDE = {
  category: { select: { id: true, name_uz: true, name_ru: true, name_en: true, slug: true } },
  brand: { select: { id: true, name: true, slug: true, logo: true } },
  images: {
    orderBy: [{ is_primary: 'desc' as const }, { sort_order: 'asc' as const }],
    take: 2,
    select: { id: true, url: true, alt: true, is_primary: true, sort_order: true },
  },
  variants: {
    where: { is_active: true },
    orderBy: [{ is_default: 'desc' as const }, { price: 'asc' as const }],
    select: {
      id: true,
      sku: true,
      volume: true,
      color: true,
      color_hex: true,
      price: true,
      compare_at_price: true,
      stock: true,
      is_default: true,
      is_active: true,
    },
  },
} satisfies Prisma.ProductInclude;

/** Mahsulot sahifasi uchun to'liq ma'lumot. */
export const PRODUCT_DETAIL_INCLUDE = {
  category: { select: { id: true, name_uz: true, name_ru: true, name_en: true, slug: true } },
  brand: { select: { id: true, name: true, slug: true, logo: true, description_uz: true } },
  images: {
    orderBy: [{ is_primary: 'desc' as const }, { sort_order: 'asc' as const }],
    select: {
      id: true,
      url: true,
      alt: true,
      is_primary: true,
      sort_order: true,
      variant_id: true,
    },
  },
  variants: {
    where: { is_active: true },
    orderBy: [{ is_default: 'desc' as const }, { price: 'asc' as const }],
    select: {
      id: true,
      sku: true,
      volume: true,
      color: true,
      color_hex: true,
      price: true,
      compare_at_price: true,
      stock: true,
      is_default: true,
      is_active: true,
    },
  },
  tags: { include: { tag: true } },
  attributes: {
    include: {
      attribute: {
        select: {
          name_uz: true,
          name_ru: true,
          name_en: true,
          slug: true,
          type: true,
          unit: true,
        },
      },
    },
    orderBy: { attribute: { sort_order: 'asc' as const } },
  },
} satisfies Prisma.ProductInclude;

/**
 * Katalogni o'qish servisi.
 *
 * Yozish amallari `ProductsAdminService` da — bu servis faqat so'rovlar bilan
 * shug'ullanadi. Ilgari ikkalasi bitta 778 qatorli faylda edi va u yerda
 * fayl tizimi amallari ham bor edi.
 */
@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: ProductQueryDto,
    options: { allowInactive?: boolean } = {},
  ): Promise<ProductListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = this.buildWhere(query, options.allowInactive === true);
    const orderBy = this.buildOrderBy(query.sort_by, query.sort_order);

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: PRODUCT_CARD_INCLUDE,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map((p) => this.toDto(p)),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async findBySlug(slug: string, userId: string | null): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: { slug, is_active: true, deleted_at: null },
      include: PRODUCT_DETAIL_INCLUDE,
    });

    if (!product) throw new NotFoundException('Mahsulot topilmadi');

    let viewCount = product.view_count;

    if (userId) {
      const incremented = await this.recordView(product.id, userId);
      if (incremented) viewCount += 1;
    }

    return this.toDto({ ...product, view_count: viewCount });
  }

  async findByIdAdmin(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: { id, deleted_at: null },
      include: PRODUCT_DETAIL_INCLUDE,
    });

    if (!product) throw new NotFoundException('Mahsulot topilmadi');

    return this.toDto(product);
  }

  async verifyProductExists(id: string): Promise<void> {
    const product = await this.prisma.product.findFirst({
      where: { id, is_active: true, deleted_at: null },
      select: { id: true },
    });
    if (!product) throw new NotFoundException('Mahsulot topilmadi');
  }

  /**
   * O'xshash mahsulotlar: avval bir xil brend + kategoriya, keyin faqat
   * kategoriya. Ikkalasi ham bitta so'rovda olinadi va xotirada saralanadi —
   * ilgari bu ikki alohida DB chaqiruvi edi.
   */
  async getSimilarProducts(productSlug: string, limit = 8): Promise<ProductResponseDto[]> {
    const product = await this.prisma.product.findUnique({
      where: { slug: productSlug },
      select: { id: true, category_id: true, brand_id: true },
    });

    if (!product) throw new NotFoundException('Mahsulot topilmadi');

    const candidates = await this.prisma.product.findMany({
      where: {
        is_active: true,
        deleted_at: null,
        id: { not: product.id },
        category_id: product.category_id,
      },
      take: limit * 3,
      orderBy: [{ sold_count: 'desc' }, { view_count: 'desc' }],
      include: PRODUCT_CARD_INCLUDE,
    });

    const sameBrand = candidates.filter(
      (p) => product.brand_id !== null && p.brand_id === product.brand_id,
    );
    const others = candidates.filter((p) => !sameBrand.includes(p));

    return [...sameBrand, ...others].slice(0, limit).map((p) => this.toDto(p));
  }

  /** Mahsulot sahifasi ostidagi "Sizga yoqishi mumkin" bloki. */
  async getRecommended(limit = 8): Promise<ProductResponseDto[]> {
    const products = await this.prisma.product.findMany({
      where: { is_active: true, deleted_at: null, total_stock: { gt: 0 } },
      take: limit,
      orderBy: [{ rating_avg: 'desc' }, { sold_count: 'desc' }],
      include: PRODUCT_CARD_INCLUDE,
    });

    return products.map((p) => this.toDto(p));
  }

  /** Katalog filtrlari uchun mavjud qiymatlar (narx oralig'i, hajmlar, notalar). */
  async getFilterFacets(categorySlug?: string): Promise<{
    min_price: number;
    max_price: number;
    total: number;
    volumes: string[];
    brands: { id: string; name: string; slug: string; count: number }[];
    categories: { id: string; slug: string; name_uz: string; name_ru: string; name_en: string; count: number }[];
  }> {
    const productWhere: Prisma.ProductWhereInput = {
      is_active: true,
      deleted_at: null,
      ...(categorySlug && { category: { slug: categorySlug } }),
    };

    const [priceRange, total, volumes, brandGroups, categoryGroups] = await Promise.all([
      this.prisma.product.aggregate({
        where: productWhere,
        _min: { min_price: true },
        _max: { max_price: true },
      }),
      this.prisma.product.count({ where: productWhere }),
      this.prisma.productVariant.findMany({
        where: { is_active: true, volume: { not: null }, product: productWhere },
        select: { volume: true },
        distinct: ['volume'],
      }),
      this.prisma.product.groupBy({
        by: ['brand_id'],
        where: { ...productWhere, brand_id: { not: null } },
        _count: { brand_id: true },
      }),
      // Kategoriya hisoblari — kategoriya filtridan mustaqil (barcha aktiv mahsulot).
      this.prisma.product.groupBy({
        by: ['category_id'],
        where: { is_active: true, deleted_at: null },
        _count: { category_id: true },
      }),
    ]);

    const brandIds = brandGroups
      .map((g) => g.brand_id)
      .filter((id): id is string => id !== null);

    const brands = await this.prisma.brand.findMany({
      where: { id: { in: brandIds } },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    });

    const countByBrand = new Map(brandGroups.map((g) => [g.brand_id, g._count.brand_id]));
    const countByCategory = new Map(categoryGroups.map((g) => [g.category_id, g._count.category_id]));

    const categories = await this.prisma.category.findMany({
      where: { is_active: true },
      select: { id: true, slug: true, name_uz: true, name_ru: true, name_en: true },
      orderBy: { sort_order: 'asc' },
    });

    return {
      min_price: Number(priceRange._min.min_price ?? 0),
      max_price: Number(priceRange._max.max_price ?? 0),
      total,
      volumes: volumes
        .map((v) => v.volume)
        .filter((v): v is string => v !== null)
        .sort(this.compareVolumes),
      brands: brands.map((b) => ({ ...b, count: countByBrand.get(b.id) ?? 0 })),
      categories: categories.map((c) => ({ ...c, count: countByCategory.get(c.id) ?? 0 })),
    };
  }

  // ─── Ichki ─────────────────────────────────────────────────────────────────

  private buildWhere(query: ProductQueryDto, allowInactive: boolean): Prisma.ProductWhereInput {
    const conditions: Prisma.ProductWhereInput[] = [];

    // Soft delete qilingan mahsulot hech qachon chiqmaydi — admin uchun ham.
    const base: Prisma.ProductWhereInput = { deleted_at: null };

    // `include_inactive` FAQAT admin marshrutidan kelganda hisobga olinadi;
    // ommaviy so'rov uni yuborsa ham nofaol mahsulotni ko'ra olmaydi.
    if (!(allowInactive && query.include_inactive)) {
      base.is_active = true;
    }

    conditions.push(base);

    if (query.search) {
      conditions.push({
        OR: [
          { name_uz: { contains: query.search, mode: 'insensitive' } },
          { name_ru: { contains: query.search, mode: 'insensitive' } },
          { name_en: { contains: query.search, mode: 'insensitive' } },
          { brand: { name: { contains: query.search, mode: 'insensitive' } } },
        ],
      });
    }

    if (query.category_slug) conditions.push({ category: { slug: query.category_slug } });
    if (query.category_slugs?.length) {
      conditions.push({ category: { slug: { in: query.category_slugs } } });
    }
    if (query.brand_slug) conditions.push({ brand: { slug: query.brand_slug } });
    if (query.brand_slugs?.length) {
      conditions.push({ brand: { slug: { in: query.brand_slugs } } });
    }

    if (query.gender) conditions.push({ gender: query.gender });
    if (query.concentration) conditions.push({ concentration: query.concentration });

    if (query.notes?.length) {
      // Har qanday notada mos kelsa — piramida qismlaridan biri yetarli.
      conditions.push({
        OR: [
          { top_notes: { hasSome: query.notes } },
          { heart_notes: { hasSome: query.notes } },
          { base_notes: { hasSome: query.notes } },
        ],
      });
    }

    // Narx filtri denormalizatsiyalangan min_price/max_price ustunlariga
    // tayanadi — variantlar bo'yicha bog'liq so'rovdan tezroq va indekslanadi.
    if (query.min_price !== undefined) {
      conditions.push({ max_price: { gte: query.min_price } });
    }
    if (query.max_price !== undefined) {
      conditions.push({ min_price: { lte: query.max_price } });
    }

    if (query.volumes?.length) {
      conditions.push({
        variants: { some: { is_active: true, volume: { in: query.volumes } } },
      });
    }

    if (query.tag_ids?.length) {
      conditions.push({ tags: { some: { tag_id: { in: query.tag_ids } } } });
    }

    if (query.is_bestseller !== undefined) conditions.push({ is_bestseller: query.is_bestseller });
    if (query.is_new_arrival !== undefined) conditions.push({ is_new_arrival: query.is_new_arrival });
    if (query.is_featured !== undefined) conditions.push({ is_featured: query.is_featured });

    if (query.on_sale) {
      conditions.push({
        variants: { some: { is_active: true, compare_at_price: { not: null } } },
      });
    }

    if (query.in_stock) conditions.push({ total_stock: { gt: 0 } });

    // Reyting filtri ham denormalizatsiyalangan ustunlardan — ilgari bu
    // butun reviews jadvalini groupBy qilib, natijani IN ro'yxatiga solardi.
    if (query.min_rating !== undefined) conditions.push({ rating_avg: { gte: query.min_rating } });
    if (query.min_review_count !== undefined) {
      conditions.push({ rating_count: { gte: query.min_review_count } });
    }

    if (query.date_from || query.date_to) {
      conditions.push({
        created_at: {
          ...(query.date_from && { gte: new Date(query.date_from) }),
          ...(query.date_to && { lte: new Date(query.date_to) }),
        },
      });
    }

    if (query.attributes) {
      let parsed: Record<string, string>;
      try {
        parsed = JSON.parse(query.attributes) as Record<string, string>;
      } catch {
        throw new BadRequestException("attributes parametri noto'g'ri JSON formatda");
      }

      for (const [slug, value] of Object.entries(parsed)) {
        conditions.push({
          attributes: { some: { attribute: { slug }, value: { equals: value } } },
        });
      }
    }

    return { AND: conditions };
  }

  /**
   * Saralash.
   *
   * `price` endi haqiqatan narx bo'yicha saralaydi. Ilgari u jimgina
   * `created_at` ga almashtirilardi (narx variantda bo'lgani uchun), ya'ni
   * "Arzondan qimmatga" tugmasi hech narsa qilmasdi. Denormalizatsiyalangan
   * `min_price` ustuni bu muammoni indeks bilan hal qiladi.
   */
  private buildOrderBy(
    sortBy: ProductSortBy = ProductSortBy.CREATED_AT,
    sortOrder: SortOrder = SortOrder.DESC,
  ): Prisma.ProductOrderByWithRelationInput[] {
    const dir = sortOrder === SortOrder.ASC ? 'asc' : 'desc';

    switch (sortBy) {
      case ProductSortBy.PRICE:
        return [{ min_price: { sort: dir, nulls: 'last' } }, { id: 'asc' }];
      case ProductSortBy.NAME:
        return [{ name_uz: dir }, { id: 'asc' }];
      case ProductSortBy.VIEW_COUNT:
        return [{ view_count: dir }, { id: 'asc' }];
      case ProductSortBy.RATING:
        // Bir nechta sharhi borlar oldinda — bitta 5 yulduzli sharh
        // o'nta 4.8 li mahsulotdan yuqori turmasligi kerak.
        return [{ rating_avg: dir }, { rating_count: 'desc' }, { id: 'asc' }];
      case ProductSortBy.BEST_SELLER:
        return [{ sold_count: dir }, { view_count: 'desc' }, { id: 'asc' }];
      default:
        return [{ created_at: dir }, { id: 'asc' }];
    }
  }

  /**
   * Ko'rishlar sonini oshiradi. `@@unique([product_id, user_id])` tufayli
   * bir foydalanuvchi bir mahsulotni faqat bir marta sanaydi.
   */
  private async recordView(productId: string, userId: string): Promise<boolean> {
    try {
      await this.prisma.$transaction([
        this.prisma.productView.create({ data: { product_id: productId, user_id: userId } }),
        this.prisma.product.update({
          where: { id: productId },
          data: { view_count: { increment: 1 } },
        }),
      ]);
      return true;
    } catch {
      // Unique buzilishi — allaqachon ko'rilgan. Bu xato emas.
      return false;
    }
  }

  /** '30ml' < '50ml' < '100ml' — leksikografik emas, sonli tartib. */
  private compareVolumes(a: string, b: string): number {
    const num = (s: string): number => parseFloat(s.replace(/[^\d.]/g, '')) || 0;
    return num(a) - num(b);
  }

  /**
   * Prisma yozuvini API javobiga aylantiradi.
   *
   * Decimal qiymatlar satrga o'giriladi (aniqlik yo'qolmasligi uchun) va
   * chegirma foizi SERVERDA hisoblanadi — frontend narx arifmetikasi bilan
   * shug'ullanmasligi kerak.
   */
  private toDto(product: Record<string, any>): ProductResponseDto {
    const variants = (product.variants ?? []).map((v: Record<string, any>) => ({
      ...v,
      price: v.price?.toString() ?? '0',
      compare_at_price: v.compare_at_price ? v.compare_at_price.toString() : null,
      discount_percent: discountPercent(v.price, v.compare_at_price),
      in_stock: (v.stock ?? 0) > 0,
    }));

    const defaultVariant = variants[0] ?? null;

    return plainToInstance(
      ProductResponseDto,
      {
        ...product,
        min_price: product.min_price?.toString() ?? null,
        max_price: product.max_price?.toString() ?? null,
        rating_avg: Number(product.rating_avg ?? 0),
        variants,
        default_variant_id: defaultVariant?.id ?? null,
        in_stock: (product.total_stock ?? 0) > 0,
        // Kartochkadagi chegirma — standart variantniki.
        discount_percent: defaultVariant?.discount_percent ?? null,
        tags: (product.tags ?? []).map((t: Record<string, any>) => t.tag),
        attributes: (product.attributes ?? []).map((a: Record<string, any>) => ({
          id: a.id,
          attribute_id: a.attribute_id,
          name_uz: a.attribute.name_uz,
          name_ru: a.attribute.name_ru,
          name_en: a.attribute.name_en,
          slug: a.attribute.slug,
          type: a.attribute.type,
          unit: a.attribute.unit,
          value: a.value,
        })),
      },
      TRANSFORM_OPTIONS,
    );
  }
}
