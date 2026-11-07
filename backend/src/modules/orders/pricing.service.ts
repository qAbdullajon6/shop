import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import {
  DiscountType,
  Prisma,
  type Coupon,
  type DeliveryOption,
  type ProductVariant,
} from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { add, gte, min, money, multiply, round, subtract, ZERO } from '../../common/utils/money.util';

export interface PricedLine {
  variant_id: string;
  product_id: string;
  quantity: number;
  unit_price: Prisma.Decimal;
  unit_cost: Prisma.Decimal;
  line_total: Prisma.Decimal;
  // Buyurtma qatoriga yoziladigan snapshot
  product_name: string;
  product_slug: string;
  variant_sku: string;
  variant_volume: string | null;
  image_url: string | null;
}

export interface PricedOrder {
  lines: PricedLine[];
  subtotal: Prisma.Decimal;
  discount: Prisma.Decimal;
  shipping: Prisma.Decimal;
  total: Prisma.Decimal;
  coupon: Coupon | null;
  delivery_option: DeliveryOption | null;
}

export interface PriceRequestItem {
  variant_id: string;
  quantity: number;
}

type VariantWithProduct = ProductVariant & {
  product: {
    id: string;
    name_uz: string;
    slug: string;
    is_active: boolean;
    deleted_at: Date | null;
    images: { url: string }[];
  };
};

/**
 * Buyurtma summalarini hisoblashning YAGONA manbai.
 *
 * Mijozdan faqat `variant_id` va `quantity` qabul qilinadi. Narx, chegirma,
 * yetkazib berish haqi va yakuniy summa DOIM shu yerda, ma'lumotlar bazasidagi
 * joriy qiymatlardan hisoblanadi. Brauzer yuborgan hech qanday narx ishlatilmaydi.
 *
 * Xuddi shu servis checkout oldindan ko'rish (preview) va buyurtma yaratishda
 * ishlatiladi — shuning uchun mijoz ko'rgan summa bilan yozilgan summa
 * bir xil bo'lishi kafolatlanadi.
 */
@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  async price(
    items: PriceRequestItem[],
    options: {
      deliveryOptionCode?: string;
      couponCode?: string;
      userId?: string;
      /** true bo'lsa zaxira yetishmasa xato tashlanadi (buyurtma yaratishda). */
      enforceStock?: boolean;
      client?: Prisma.TransactionClient;
    } = {},
  ): Promise<PricedOrder> {
    const db = options.client ?? this.prisma;

    this.assertNoDuplicates(items);

    const variantIds = items.map((i) => i.variant_id);

    const variants = (await db.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: {
        product: {
          select: {
            id: true,
            name_uz: true,
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
    })) as VariantWithProduct[];

    const byId = new Map(variants.map((v) => [v.id, v]));

    const lines: PricedLine[] = [];

    for (const item of items) {
      const variant = byId.get(item.variant_id);

      if (!variant) {
        throw new NotFoundException(`Mahsulot varianti topilmadi: ${item.variant_id}`);
      }

      if (!variant.is_active || !variant.product.is_active || variant.product.deleted_at) {
        throw new BadRequestException(
          `"${variant.product.name_uz}" hozircha sotuvda emas`,
        );
      }

      if (options.enforceStock && variant.stock < item.quantity) {
        throw new BadRequestException(
          variant.stock === 0
            ? `"${variant.product.name_uz}" tugagan`
            : `"${variant.product.name_uz}" uchun faqat ${variant.stock} dona qoldi`,
        );
      }

      const lineTotal = round(multiply(variant.price, item.quantity));

      lines.push({
        variant_id: variant.id,
        product_id: variant.product.id,
        quantity: item.quantity,
        unit_price: variant.price,
        unit_cost: variant.cost_price,
        line_total: lineTotal,
        product_name: variant.product.name_uz,
        product_slug: variant.product.slug,
        variant_sku: variant.sku,
        variant_volume: variant.volume,
        image_url: variant.product.images[0]?.url ?? null,
      });
    }

    const subtotal = round(add(...lines.map((l) => l.line_total)));

    // ── Kupon ──
    let coupon: Coupon | null = null;
    let discount = ZERO;

    if (options.couponCode) {
      coupon = await this.validateCoupon(options.couponCode, subtotal, options.userId, db);
      discount = this.calculateDiscount(coupon, subtotal);
    }

    // ── Yetkazib berish ──
    const deliveryOption = options.deliveryOptionCode
      ? await this.resolveDeliveryOption(options.deliveryOptionCode, db)
      : null;

    const shipping = this.calculateShipping(deliveryOption, subtract(subtotal, discount));

    const total = round(add(subtract(subtotal, discount), shipping));

    return { lines, subtotal, discount, shipping, total, coupon, delivery_option: deliveryOption };
  }

  /**
   * Yetkazib berish haqi jadvaldagi qiymatdan hisoblanadi.
   * Bepul chegara chegirmadan KEYINGI summaga qo'llanadi — aks holda mijoz
   * kupon bilan summani tushirib, baribir bepul yetkazishni olardi.
   */
  private calculateShipping(
    option: DeliveryOption | null,
    payableSubtotal: Prisma.Decimal,
  ): Prisma.Decimal {
    if (!option) return ZERO;

    if (option.free_threshold !== null && gte(payableSubtotal, option.free_threshold)) {
      return ZERO;
    }

    return round(option.fee);
  }

  private async resolveDeliveryOption(
    code: string,
    db: Prisma.TransactionClient | PrismaService,
  ): Promise<DeliveryOption> {
    const option = await db.deliveryOption.findUnique({ where: { code } });

    if (!option || !option.is_active) {
      throw new BadRequestException('Yetkazib berish usuli topilmadi yoki mavjud emas');
    }

    return option;
  }

  private async validateCoupon(
    code: string,
    subtotal: Prisma.Decimal,
    userId: string | undefined,
    db: Prisma.TransactionClient | PrismaService,
  ): Promise<Coupon> {
    const coupon = await db.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon || !coupon.is_active) {
      throw new BadRequestException('Kupon kodi topilmadi yoki nofaol');
    }

    const now = new Date();

    if (coupon.starts_at && coupon.starts_at > now) {
      throw new BadRequestException('Kupon hali kuchga kirmagan');
    }

    if (coupon.expires_at && coupon.expires_at < now) {
      throw new BadRequestException('Kupon muddati tugagan');
    }

    // Global max_uses is enforced atomically in orders.service.ts via a
    // conditional SQL UPDATE. The in-app check here would race under concurrency
    // and is intentionally removed.

    if (coupon.min_order_amount && !gte(subtotal, coupon.min_order_amount)) {
      throw new BadRequestException(
        `Bu kupon uchun minimal buyurtma summasi: ${coupon.min_order_amount.toFixed(0)} so'm`,
      );
    }

    // Foydalanuvchi bo'yicha limit — bir mijoz bitta kuponni cheksiz
    // ishlatib yubormasligi uchun.
    if (coupon.max_uses_per_user !== null && userId) {
      const usedByUser = await db.couponUse.count({
        where: { coupon_id: coupon.id, user_id: userId },
      });

      if (usedByUser >= coupon.max_uses_per_user) {
        throw new BadRequestException('Siz bu kupondan foydalanib bo\'lgansiz');
      }
    }

    return coupon;
  }

  private calculateDiscount(coupon: Coupon, subtotal: Prisma.Decimal): Prisma.Decimal {
    let discount: Prisma.Decimal;

    if (coupon.discount_type === DiscountType.PERCENTAGE) {
      discount = multiply(subtotal, money(coupon.discount_value).div(100));
      if (coupon.max_discount) {
        discount = min(discount, coupon.max_discount);
      }
    } else {
      discount = money(coupon.discount_value);
    }

    // Chegirma hech qachon summadan oshmaydi — aks holda total manfiy bo'ladi.
    return round(min(discount, subtotal));
  }

  /**
   * Bir xil variant ikki qatorda kelsa jamlanma noto'g'ri bo'ladi va zaxira
   * ikki marta ayiriladi. Mijoz "Mahsulot × 5" yuborishi kerak, "Mahsulot"
   * ni besh marta emas.
   */
  private assertNoDuplicates(items: PriceRequestItem[]): void {
    const seen = new Set<string>();
    for (const item of items) {
      if (seen.has(item.variant_id)) {
        throw new BadRequestException(
          'Bir xil mahsulot bir necha marta yuborilgan — miqdorni birlashtiring',
        );
      }
      seen.add(item.variant_id);
    }
  }
}
