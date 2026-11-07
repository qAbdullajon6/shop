import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { WishlistResponseDto } from './dto/wishlist-response.dto';

const TRANSFORM_OPTIONS = { excludeExtraneousValues: true };

/**
 * Sevimlilar MAHSULOT darajasida saqlanadi.
 *
 * Ilgari u variantga bog'langan edi va interfeys doim `variants[0]` ni
 * ishlatardi — natijada mijoz 100ml ni saqlab, ro'yxatda 50ml ni ko'rar edi.
 * `variant_id` endi ixtiyoriy: mijoz aniq hajmni belgilagan bo'lsa saqlanadi.
 */
const WISHLIST_INCLUDE = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name_uz: true,
          name_ru: true,
          name_en: true,
          slug: true,
          min_price: true,
          total_stock: true,
          rating_avg: true,
          rating_count: true,
          brand: { select: { id: true, name: true, slug: true } },
          category: { select: { id: true, name_uz: true, slug: true } },
          images: {
            where: { is_primary: true },
            select: { url: true },
            take: 1,
          },
        },
      },
      variant: {
        select: {
          id: true,
          sku: true,
          volume: true,
          price: true,
          compare_at_price: true,
          stock: true,
        },
      },
    },
    orderBy: { created_at: 'desc' as const },
  },
} satisfies Prisma.WishlistInclude;

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async getWishlist(userId: string): Promise<WishlistResponseDto> {
    const wishlist = await this.getOrCreateWishlist(userId);
    return plainToInstance(
      WishlistResponseDto,
      { ...wishlist, total_items: wishlist.items.length },
      TRANSFORM_OPTIONS,
    );
  }

  async addItem(userId: string, dto: AddWishlistItemDto): Promise<WishlistResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.product_id, is_active: true, deleted_at: null },
      select: { id: true },
    });

    if (!product) throw new NotFoundException('Mahsulot topilmadi');

    // Variant berilgan bo'lsa, u shu mahsulotga tegishli ekanini tekshiramiz —
    // aks holda mijoz o'zga mahsulotning variantini bog'lab yuborishi mumkin.
    if (dto.variant_id) {
      const variant = await this.prisma.productVariant.findFirst({
        where: { id: dto.variant_id, product_id: dto.product_id, is_active: true },
        select: { id: true },
      });

      if (!variant) {
        throw new NotFoundException('Variant bu mahsulotga tegishli emas');
      }
    }

    const wishlist = await this.getOrCreateWishlist(userId);

    // Ikki marta bosish 409 bermasligi kerak — upsert idempotent.
    await this.prisma.wishlistItem.upsert({
      where: {
        wishlist_id_product_id: {
          wishlist_id: wishlist.id,
          product_id: dto.product_id,
        },
      },
      create: {
        wishlist_id: wishlist.id,
        product_id: dto.product_id,
        variant_id: dto.variant_id ?? null,
      },
      update: { variant_id: dto.variant_id ?? null },
    });

    return this.getWishlist(userId);
  }

  async removeItem(userId: string, productId: string): Promise<WishlistResponseDto> {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { user_id: userId },
      select: { id: true },
    });

    if (!wishlist) throw new NotFoundException('Sevimlilar topilmadi');

    const { count } = await this.prisma.wishlistItem.deleteMany({
      where: { wishlist_id: wishlist.id, product_id: productId },
    });

    if (count === 0) {
      throw new NotFoundException('Mahsulot sevimlilarda topilmadi');
    }

    return this.getWishlist(userId);
  }

  async clearWishlist(userId: string): Promise<WishlistResponseDto> {
    const wishlist = await this.getOrCreateWishlist(userId);

    await this.prisma.wishlistItem.deleteMany({ where: { wishlist_id: wishlist.id } });

    return this.getWishlist(userId);
  }

  private async getOrCreateWishlist(userId: string) {
    return this.prisma.wishlist.upsert({
      where: { user_id: userId },
      create: { user_id: userId },
      update: {},
      include: WISHLIST_INCLUDE,
    });
  }
}
