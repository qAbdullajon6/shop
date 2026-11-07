import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { plainToInstance } from 'class-transformer';

import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { add, discountPercent, multiply, round, subtract, ZERO } from '../../common/utils/money.util';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { SyncCartDto } from './dto/sync-cart.dto';
import { CartResponseDto } from './dto/cart-response.dto';

const TRANSFORM_OPTIONS = { excludeExtraneousValues: true };

/** Bitta qatordagi maksimal miqdor — chakana savdo uchun aqlli chegara. */
const MAX_QUANTITY_PER_ITEM = 20;
const GUEST_CART_TTL_DAYS = 30;

const CART_INCLUDE = {
  items: {
    include: {
      variant: {
        select: {
          id: true,
          sku: true,
          volume: true,
          color: true,
          color_hex: true,
          price: true,
          compare_at_price: true,
          stock: true,
          is_active: true,
          product: {
            select: {
              id: true,
              name_uz: true,
              name_ru: true,
              name_en: true,
              slug: true,
              is_active: true,
              deleted_at: true,
              images: {
                where: { is_primary: true },
                select: { url: true },
                take: 1,
              },
            },
          },
        },
      },
    },
    orderBy: { created_at: 'asc' as const },
  },
} satisfies Prisma.CartInclude;

export interface CartOwner {
  userId?: string;
  sessionToken?: string;
}

/**
 * Savat.
 *
 * Muhim biznes qoidasi: bir mahsulotni bir necha dona qo'shish qatorlar
 * sonini oshirmaydi — MIQDOR oshadi. "Mahsulot × 5" bitta qator bo'lib
 * qoladi va checkout paytida bitta buyurtma qatoriga aylanadi.
 *
 * Savat mijoz ro'yxatdan o'tmagan bo'lsa ham serverda saqlanadi
 * (`session_token`), shunda u qurilmalar orasida yo'qolmaydi va login
 * paytida to'g'ri birlashtiriladi.
 */
@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(owner: CartOwner): Promise<CartResponseDto> {
    const cart = await this.resolveCart(owner);
    return this.toDto(cart);
  }

  async addItem(owner: CartOwner, dto: AddCartItemDto): Promise<CartResponseDto> {
    const variant = await this.loadPurchasableVariant(dto.variant_id);
    const cart = await this.resolveCart(owner);

    const existing = await this.prisma.cartItem.findUnique({
      where: { cart_id_variant_id: { cart_id: cart.id, variant_id: dto.variant_id } },
      select: { quantity: true },
    });

    const requested = (existing?.quantity ?? 0) + dto.quantity;

    if (requested > MAX_QUANTITY_PER_ITEM) {
      throw new BadRequestException(
        `Bir mahsulotdan ko'pi bilan ${MAX_QUANTITY_PER_ITEM} dona olish mumkin`,
      );
    }

    // Savatda zaxiradan ko'p mahsulot turishiga yo'l qo'ymaymiz — mijoz
    // checkout'da emas, hozir bilishi kerak. Zaxira baribir buyurtma
    // yaratilgandagina bron qilinadi.
    if (requested > variant.stock) {
      throw new BadRequestException(
        variant.stock === 0
          ? `"${variant.product.name_uz}" tugagan`
          : `"${variant.product.name_uz}" uchun faqat ${variant.stock} dona mavjud`,
      );
    }

    await this.prisma.cartItem.upsert({
      where: { cart_id_variant_id: { cart_id: cart.id, variant_id: dto.variant_id } },
      create: { cart_id: cart.id, variant_id: dto.variant_id, quantity: dto.quantity },
      // Mavjud qatorga miqdor QO'SHILADI — yangi qator yaratilmaydi.
      update: { quantity: requested },
    });

    await this.touch(cart.id);

    return this.getCart(owner);
  }

  async updateItem(
    owner: CartOwner,
    variantId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const cart = await this.requireCart(owner);
    const variant = await this.loadPurchasableVariant(variantId);

    if (dto.quantity > MAX_QUANTITY_PER_ITEM) {
      throw new BadRequestException(
        `Bir mahsulotdan ko'pi bilan ${MAX_QUANTITY_PER_ITEM} dona olish mumkin`,
      );
    }

    if (dto.quantity > variant.stock) {
      throw new BadRequestException(
        `"${variant.product.name_uz}" uchun faqat ${variant.stock} dona mavjud`,
      );
    }

    const { count } = await this.prisma.cartItem.updateMany({
      where: { cart_id: cart.id, variant_id: variantId },
      data: { quantity: dto.quantity },
    });

    if (count === 0) throw new NotFoundException('Mahsulot savatda topilmadi');

    await this.touch(cart.id);

    return this.getCart(owner);
  }

  async removeItem(owner: CartOwner, variantId: string): Promise<CartResponseDto> {
    const cart = await this.requireCart(owner);

    const { count } = await this.prisma.cartItem.deleteMany({
      where: { cart_id: cart.id, variant_id: variantId },
    });

    if (count === 0) throw new NotFoundException('Mahsulot savatda topilmadi');

    await this.touch(cart.id);

    return this.getCart(owner);
  }

  async clearCart(owner: CartOwner): Promise<CartResponseDto> {
    const cart = await this.resolveCart(owner);

    await this.prisma.cartItem.deleteMany({ where: { cart_id: cart.id } });
    await this.touch(cart.id);

    return this.getCart(owner);
  }

  /**
   * Mehmon savatini foydalanuvchi savatiga birlashtiradi (login paytida).
   *
   * Miqdorlar QO'SHILADI. Ilgari bu `Math.max(mavjud, kelgan)` edi — ya'ni
   * telefonda 2 dona, kompyuterda 3 dona bo'lsa, mijoz 5 emas 3 dona olardi
   * va farqi jimgina yo'qolardi.
   */
  async mergeGuestCart(userId: string, sessionToken: string): Promise<CartResponseDto> {
    const guestCart = await this.prisma.cart.findUnique({
      where: { session_token: sessionToken },
      include: { items: true },
    });

    const userCart = await this.resolveCart({ userId });

    if (!guestCart || guestCart.items.length === 0) {
      if (guestCart) {
        await this.prisma.cart.delete({ where: { id: guestCart.id } });
      }
      return this.toDto(userCart);
    }

    const validVariants = await this.prisma.productVariant.findMany({
      where: {
        id: { in: guestCart.items.map((i) => i.variant_id) },
        is_active: true,
        product: { is_active: true, deleted_at: null },
      },
      select: { id: true, stock: true },
    });

    const stockById = new Map(validVariants.map((v) => [v.id, v.stock]));

    await this.prisma.$transaction(async (tx) => {
      const existingItems = await tx.cartItem.findMany({
        where: { cart_id: userCart.id },
        select: { variant_id: true, quantity: true },
      });

      const existingQty = new Map(existingItems.map((i) => [i.variant_id, i.quantity]));

      for (const item of guestCart.items) {
        const stock = stockById.get(item.variant_id);
        // Endi sotilmaydigan mahsulot jimgina tashlab yuboriladi.
        if (stock === undefined) continue;

        const merged = Math.min(
          (existingQty.get(item.variant_id) ?? 0) + item.quantity,
          stock,
          MAX_QUANTITY_PER_ITEM,
        );

        if (merged <= 0) continue;

        await tx.cartItem.upsert({
          where: {
            cart_id_variant_id: { cart_id: userCart.id, variant_id: item.variant_id },
          },
          create: {
            cart_id: userCart.id,
            variant_id: item.variant_id,
            quantity: merged,
          },
          update: { quantity: merged },
        });
      }

      await tx.cart.delete({ where: { id: guestCart.id } });
      await tx.cart.update({ where: { id: userCart.id }, data: {} });
    });

    return this.getCart({ userId });
  }

  /**
   * Eski mijozlar uchun moslik: localStorage'dagi savatni serverga yuklaydi.
   * Yangi mehmon oqimi `session_token` ishlatadi va bu chaqiruvga muhtoj emas.
   */
  async syncCart(userId: string, dto: SyncCartDto): Promise<CartResponseDto> {
    if (dto.items.length === 0) return this.getCart({ userId });

    const cart = await this.resolveCart({ userId });

    const variants = await this.prisma.productVariant.findMany({
      where: {
        id: { in: dto.items.map((i) => i.variant_id) },
        is_active: true,
        product: { is_active: true, deleted_at: null },
      },
      select: { id: true, stock: true },
    });

    const stockById = new Map(variants.map((v) => [v.id, v.stock]));

    await this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        const stock = stockById.get(item.variant_id);
        if (stock === undefined) continue;

        const existing = await tx.cartItem.findUnique({
          where: { cart_id_variant_id: { cart_id: cart.id, variant_id: item.variant_id } },
          select: { quantity: true },
        });

        const quantity = Math.min(
          (existing?.quantity ?? 0) + item.quantity,
          stock,
          MAX_QUANTITY_PER_ITEM,
        );

        if (quantity <= 0) continue;

        await tx.cartItem.upsert({
          where: { cart_id_variant_id: { cart_id: cart.id, variant_id: item.variant_id } },
          create: { cart_id: cart.id, variant_id: item.variant_id, quantity },
          update: { quantity },
        });
      }

      await tx.cart.update({ where: { id: cart.id }, data: {} });
    });

    return this.getCart({ userId });
  }

  /** Yangi mehmon sessiyasi identifikatorini yaratadi. */
  createGuestToken(): string {
    return crypto.randomUUID();
  }

  // ─── Ichki ─────────────────────────────────────────────────────────────────

  private async resolveCart(owner: CartOwner) {
    if (owner.userId) {
      return this.prisma.cart.upsert({
        where: { user_id: owner.userId },
        create: { user_id: owner.userId },
        update: {},
        include: CART_INCLUDE,
      });
    }

    if (!owner.sessionToken) {
      throw new BadRequestException('Savat identifikatori topilmadi');
    }

    return this.prisma.cart.upsert({
      where: { session_token: owner.sessionToken },
      create: {
        session_token: owner.sessionToken,
        expires_at: new Date(Date.now() + GUEST_CART_TTL_DAYS * 86_400_000),
      },
      update: {
        expires_at: new Date(Date.now() + GUEST_CART_TTL_DAYS * 86_400_000),
      },
      include: CART_INCLUDE,
    });
  }

  private async requireCart(owner: CartOwner) {
    const cart = owner.userId
      ? await this.prisma.cart.findUnique({
          where: { user_id: owner.userId },
          select: { id: true },
        })
      : owner.sessionToken
        ? await this.prisma.cart.findUnique({
            where: { session_token: owner.sessionToken },
            select: { id: true },
          })
        : null;

    if (!cart) throw new NotFoundException('Savat topilmadi');

    return cart;
  }

  private async loadPurchasableVariant(variantId: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      select: {
        id: true,
        stock: true,
        is_active: true,
        product: {
          select: { name_uz: true, is_active: true, deleted_at: true },
        },
      },
    });

    if (
      !variant ||
      !variant.is_active ||
      !variant.product.is_active ||
      variant.product.deleted_at
    ) {
      throw new NotFoundException('Mahsulot topilmadi yoki sotuvda emas');
    }

    return variant;
  }

  private touch(cartId: string): Promise<unknown> {
    return this.prisma.cart.update({ where: { id: cartId }, data: {} });
  }

  /**
   * Savat jamlanmasi SERVERDA hisoblanadi. Frontend faqat ko'rsatadi —
   * yakuniy summa baribir POST /orders/preview orqali tasdiqlanadi.
   */
  private toDto(cart: Record<string, any>): CartResponseDto {
    const items = (cart.items ?? []).map((item: Record<string, any>) => {
      const variant = item.variant;
      const lineTotal = round(multiply(variant.price, item.quantity));

      // Zaxira savatga qo'shilgandan keyin kamayib ketgan bo'lishi mumkin.
      const available =
        variant.is_active && variant.product.is_active && !variant.product.deleted_at
          ? variant.stock
          : 0;

      return {
        id: item.id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        line_total: lineTotal.toFixed(2),
        // Mijoz checkout'ga o'tishdan oldin muammoni ko'rsin.
        is_available: available >= item.quantity,
        available_stock: available,
        created_at: item.created_at,
        variant: {
          id: variant.id,
          sku: variant.sku,
          volume: variant.volume,
          color: variant.color,
          color_hex: variant.color_hex,
          price: variant.price.toString(),
          compare_at_price: variant.compare_at_price
            ? variant.compare_at_price.toString()
            : null,
          discount_percent: discountPercent(variant.price, variant.compare_at_price),
          stock: variant.stock,
          product: {
            id: variant.product.id,
            name_uz: variant.product.name_uz,
            name_ru: variant.product.name_ru,
            name_en: variant.product.name_en,
            slug: variant.product.slug,
            image_url: variant.product.images[0]?.url ?? null,
          },
        },
      };
    });

    const availableItems = items.filter((i: { is_available: boolean }) => i.is_available);

    const subtotal = availableItems.length
      ? round(add(...availableItems.map((i: { line_total: string }) => i.line_total)))
      : ZERO;

    // Chegirma bilan solishtirish uchun — "siz X so'm tejadingiz".
    // Faqat mavjud mahsulotlar hisoblanadi — bo'lmagan mahsulotlar tejamkorlikni
    // sun'iy oshirib ko'rsatmasligi kerak.
    const compareTotal = availableItems.length
      ? round(
          add(
            ...availableItems.map((i: Record<string, any>) =>
              multiply(i.variant.compare_at_price ?? i.variant.price, i.quantity),
            ),
          ),
        )
      : ZERO;

    return plainToInstance(
      CartResponseDto,
      {
        id: cart.id,
        session_token: cart.session_token ?? null,
        items,
        total_items: items.reduce(
          (sum: number, i: { quantity: number }) => sum + i.quantity,
          0,
        ),
        total_price: subtotal.toFixed(2),
        total_savings: subtract(compareTotal, subtotal).toFixed(2),
        has_unavailable_items: items.some(
          (i: { is_available: boolean }) => !i.is_available,
        ),
        created_at: cart.created_at,
        updated_at: cart.updated_at,
      },
      TRANSFORM_OPTIONS,
    );
  }
}
