import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { OrdersService } from '../../modules/orders/orders.service';
import { PrismaService } from '../prisma/prisma.service';

/** To'lanmagan buyurtmalar qancha soatdan keyin avtomatik bekor qilinadi. */
const UNPAID_ORDER_EXPIRE_HOURS = 48;

/**
 * Davriy tozalash vazifalari.
 *
 * Sessiyalar, tasdiqlash kodlari va mehmon savatlari cheksiz to'planib
 * borardi — ularni hech narsa tozalamas edi. Bu jadvallar vaqt o'tishi
 * bilan o'sib, so'rovlarni sekinlashtiradi.
 */
@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly orders: OrdersService,
  ) {}

  @Cron('0 */2 * * *') // Har 2 soatda — to'lanmagan buyurtmalar muddatini tekshirish.
  async expireUnpaidOrders(): Promise<void> {
    const cancelled = await this.orders.expireUnpaidOrders(UNPAID_ORDER_EXPIRE_HOURS);
    if (cancelled > 0) {
      this.logger.log(`${cancelled} ta to'lanmagan buyurtma avtomatik bekor qilindi`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanup(): Promise<void> {
    const now = new Date();

    const [sessions, codes, guestCarts] = await Promise.all([
      // Muddati o'tgan sessiyalar — refresh token allaqachon yaroqsiz.
      this.prisma.session.deleteMany({ where: { expires_at: { lt: now } } }),

      // Bir kundan eski tasdiqlash kodlari (ishlatilgani ham, ishlatilmagani ham).
      this.prisma.verificationCode.deleteMany({
        where: { created_at: { lt: new Date(now.getTime() - 86_400_000) } },
      }),

      // Muddati o'tgan mehmon savatlari.
      this.prisma.cart.deleteMany({
        where: { user_id: null, expires_at: { lt: now } },
      }),
    ]);

    if (sessions.count || codes.count || guestCarts.count) {
      this.logger.log(
        `Tozalandi — sessiyalar: ${sessions.count}, ` +
          `kodlar: ${codes.count}, mehmon savatlari: ${guestCarts.count}`,
      );
    }
  }

  /**
   * Denormalizatsiyalangan hisoblagichlarni haqiqiy ma'lumot bilan solishtiradi.
   *
   * Ular yozish paytida yangilanadi, lekin qo'lda SQL aralashuvi yoki
   * migratsiya ularni chalkashtirib yuborishi mumkin. Kunlik moslashtirish
   * arzon va nomuvofiqlikni o'z-o'zidan tuzatadi.
   */
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async reconcileProductCounters(): Promise<void> {
    const updated = await this.prisma.$executeRaw`
      UPDATE "products" p
      SET "min_price"    = agg.min_price,
          "max_price"    = agg.max_price,
          "total_stock"  = agg.total_stock,
          "rating_avg"   = agg.rating_avg,
          "rating_count" = agg.rating_count,
          "sold_count"   = agg.sold_count
      FROM (
        SELECT
          pr."id" AS product_id,
          (SELECT MIN(v."price") FROM "product_variants" v
            WHERE v."product_id" = pr."id" AND v."is_active") AS min_price,
          (SELECT MAX(v."price") FROM "product_variants" v
            WHERE v."product_id" = pr."id" AND v."is_active") AS max_price,
          (SELECT COALESCE(SUM(v."stock"), 0)::int FROM "product_variants" v
            WHERE v."product_id" = pr."id" AND v."is_active") AS total_stock,
          (SELECT COALESCE(AVG(r."rating"), 0)::numeric(3,2) FROM "reviews" r
            WHERE r."product_id" = pr."id" AND r."status" = 'APPROVED') AS rating_avg,
          (SELECT COUNT(*)::int FROM "reviews" r
            WHERE r."product_id" = pr."id" AND r."status" = 'APPROVED') AS rating_count,
          (SELECT COALESCE(SUM(oi."quantity"), 0)::int
             FROM "order_items" oi
             JOIN "orders" o ON o."id" = oi."order_id"
            WHERE oi."product_id" = pr."id" AND o."status" = 'DELIVERED') AS sold_count
        FROM "products" pr
        WHERE pr."deleted_at" IS NULL
      ) agg
      WHERE p."id" = agg.product_id
        AND (p."min_price"    IS DISTINCT FROM agg.min_price
          OR p."max_price"    IS DISTINCT FROM agg.max_price
          OR p."total_stock"  IS DISTINCT FROM agg.total_stock
          OR p."rating_avg"   IS DISTINCT FROM agg.rating_avg
          OR p."rating_count" IS DISTINCT FROM agg.rating_count
          OR p."sold_count"   IS DISTINCT FROM agg.sold_count)
    `;

    if (updated > 0) {
      this.logger.warn(
        `${updated} ta mahsulotning hisoblagichlari mos kelmadi va tuzatildi`,
      );
    }
  }
}
