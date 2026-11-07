import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import {
  NotificationType,
  OrderSource,
  OrderStatus,
  PaymentStatus,
  Prisma,
  StockTransactionType,
} from '../../../generated/prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateOrderDto, PreviewOrderDto } from './dto/create-order.dto';
import { OrderFiltersDto, UserOrderFiltersDto } from './dto/order-filters.dto';
import {
  OrderPreviewResponseDto,
  OrderResponseDto,
  PaginatedOrdersResponseDto,
} from './dto/order-response.dto';
import {
  CancelOrderDto,
  UpdateOrderStatusDto,
  UpdatePaymentStatusDto,
} from './dto/update-order-status.dto';
import {
  assertTransition,
  CUSTOMER_CANCELLABLE,
  stockEffectOf,
  unlocksReview,
} from './order-state-machine';
import { PricedOrder, PricingService } from './pricing.service';

const TRANSFORM_OPTIONS = { excludeExtraneousValues: true };

const ORDER_INCLUDE = {
  user: { select: { id: true, name: true, last_name: true, phone_number: true } },
  address: true,
  delivery_option: { select: { id: true, code: true, name_uz: true, min_days: true, max_days: true } },
  items: {
    include: {
      review: { select: { id: true, rating: true } },
    },
  },
  coupon_use: { include: { coupon: { select: { id: true, code: true } } } },
  status_events: {
    orderBy: { created_at: 'asc' as const },
    select: {
      id: true,
      from_status: true,
      to_status: true,
      note: true,
      created_at: true,
    },
  },
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: PricingService,
  ) {}

  // ─── Checkout oldindan ko'rish ─────────────────────────────────────────────

  /**
   * Buyurtma yaratmasdan yakuniy summani hisoblaydi.
   *
   * Checkout sahifasi shu endpointga tayanadi — shunda mijoz ko'rgan summa
   * serverdagi hisob bilan bir xil bo'ladi. Frontend'dagi mustaqil hisob-kitob
   * (masalan, "500 000 dan yuqori bo'lsa yetkazish bepul" qoidasini brauzerda
   * takrorlash) summalar farq qilishiga olib kelgan edi.
   */
  async previewOrder(userId: string, dto: PreviewOrderDto): Promise<OrderPreviewResponseDto> {
    const priced = await this.pricing.price(dto.items, {
      deliveryOptionCode: dto.delivery_method,
      couponCode: dto.coupon_code,
      userId,
      enforceStock: false,
    });

    return this.toPreviewDto(priced);
  }

  // ─── Buyurtma yaratish ─────────────────────────────────────────────────────

  /**
   * Buyurtma yaratadi.
   *
   * Xavfsizlik va to'g'rilik kafolatlari:
   *   • Barcha summalar serverda hisoblanadi (PricingService)
   *   • Zaxira SHARTLI yangilash bilan ayiriladi — bir vaqtda kelgan ikki
   *     buyurtma oxirgi donani ikkalasi ham sotib yubora olmaydi
   *   • Idempotentlik kaliti takroriy yuborishni to'xtatadi
   *   • Savat o'sha tranzaksiyada tozalanadi (qurilmalar orasida ham)
   */
  async createOrder(
    userId: string,
    dto: CreateOrderDto,
    ipAddress: string,
    source: OrderSource = OrderSource.WEB,
  ): Promise<OrderResponseDto> {
    // ── Idempotentlik: bir xil kalitli takroriy so'rov mavjud buyurtmani qaytaradi ──
    if (dto.idempotency_key) {
      const existing = await this.prisma.order.findUnique({
        where: { idempotency_key: dto.idempotency_key },
        include: ORDER_INCLUDE,
      });

      if (existing) {
        if (existing.user_id !== userId) {
          throw new ConflictException('Bu idempotentlik kaliti band');
        }
        return plainToInstance(OrderResponseDto, existing, TRANSFORM_OPTIONS);
      }
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, name: true, last_name: true, phone_number: true },
    });

    // Telegram orqali kirgan, lekin raqamini hali tasdiqlamagan foydalanuvchi.
    const customerPhone = dto.customer_phone ?? user.phone_number;
    if (customerPhone.startsWith('tg:')) {
      throw new BadRequestException(
        "Buyurtma berish uchun telefon raqamingizni tasdiqlang",
      );
    }

    const address = dto.address_id
      ? await this.prisma.address.findFirst({
          where: { id: dto.address_id, user_id: userId },
        })
      : null;

    if (dto.address_id && !address) {
      throw new NotFoundException('Manzil topilmadi');
    }

    // Retry loop handles two P2002 races:
    //   1. order_number collision (count-based generation, concurrent orders same second) — retry
    //   2. idempotency_key collision (two identical concurrent requests both passed outer check) — return winner
    let order: Record<string, unknown> | undefined;
    for (let orderAttempt = 0; ; orderAttempt++) {
      try {
        order = await this.prisma.$transaction(
          async (tx) => {
            // Narxlash tranzaksiya ichida — variant tashqarida o'zgarib ketmasligi uchun.
        const priced = await this.pricing.price(dto.items, {
          deliveryOptionCode: dto.delivery_method,
          couponCode: dto.coupon_code,
          userId,
          enforceStock: true,
          client: tx,
        });

        if (priced.delivery_option?.requires_address && !address) {
          throw new BadRequestException(
            'Tanlangan yetkazib berish usuli uchun manzil kerak',
          );
        }

        const orderNumber = await this.generateOrderNumber(tx);

        const created = await tx.order.create({
          data: {
            order_number: orderNumber,
            user_id: userId,
            address_id: address?.id ?? null,
            idempotency_key: dto.idempotency_key ?? null,
            source,
            ip_address: ipAddress,
            notes: dto.notes,
            payment_method: dto.payment_method,

            customer_name:
              dto.customer_name ??
              ([user.name, user.last_name].filter(Boolean).join(' ') || null),
            customer_phone: customerPhone,

            ship_city: address?.city ?? null,
            ship_district: address?.district ?? null,
            ship_street: address?.street ?? null,
            ship_zip: address?.zip_code ?? null,
            ship_lat: address?.lat ?? null,
            ship_lon: address?.lon ?? null,

            delivery_option_id: priced.delivery_option?.id ?? null,
            delivery_name: priced.delivery_option?.name_uz ?? null,

            subtotal_amount: priced.subtotal,
            discount_amount: priced.discount,
            shipping_fee: priced.shipping,
            total_amount: priced.total,

            items: {
              create: priced.lines.map((line) => ({
                variant_id: line.variant_id,
                product_id: line.product_id,
                quantity: line.quantity,
                unit_price: line.unit_price,
                unit_cost: line.unit_cost,
                line_total: line.line_total,
                product_name: line.product_name,
                product_slug: line.product_slug,
                variant_sku: line.variant_sku,
                variant_volume: line.variant_volume,
                image_url: line.image_url,
              })),
            },

            status_events: {
              create: {
                from_status: null,
                to_status: OrderStatus.PENDING,
                note: 'Buyurtma yaratildi',
              },
            },
          },
        });

        await this.reserveStock(tx, priced, created.id, orderNumber);

        if (priced.coupon) {
          // Record the use first. The partial unique index
          // uq_coupon_use_per_user guards against per-user double-use even
          // under concurrent transactions (P2002 = unique-constraint violation).
          try {
            await tx.couponUse.create({
              data: {
                coupon_id: priced.coupon.id,
                order_id: created.id,
                user_id: userId,
                discount: priced.discount,
              },
            });
          } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
              throw new ConflictException('Siz bu kupondan allaqachon foydalangansiz');
            }
            throw e;
          }

          // Atomic conditional increment: only succeeds when used_count has not
          // yet reached max_uses. If another transaction won the race the count
          // will be at max and this UPDATE matches 0 rows → roll back.
          const updated = await tx.$executeRaw`
            UPDATE coupons
            SET used_count = used_count + 1
            WHERE id = ${priced.coupon.id}
              AND (max_uses IS NULL OR used_count < max_uses)
          `;
          if (updated === 0) {
            throw new BadRequestException('Kupon ishlatish limiti tugagan');
          }
        }

        // Buyurtma qilingan mahsulotlarni savatdan olib tashlaymiz —
        // serverda, shunda boshqa qurilmadagi savat ham yangilanadi.
        await tx.cartItem.deleteMany({
          where: {
            cart: { user_id: userId },
            variant_id: { in: priced.lines.map((l) => l.variant_id) },
          },
        });

        return tx.order.findUniqueOrThrow({
          where: { id: created.id },
          include: ORDER_INCLUDE,
        });
      },
          { timeout: 15_000, isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted },
        );
        break;
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
          // @prisma/adapter-pg puts constraint fields in driverAdapterError.cause.constraint.fields
          // rather than the standard meta.target — handle both.
          const target = e.meta?.target as string[] | string | undefined;
          const adapterFields = (e.meta as Record<string, unknown> | undefined)
            ?.driverAdapterError as { cause?: { constraint?: { fields?: string[] } } } | undefined;
          const effectiveTarget = adapterFields?.cause?.constraint?.fields ?? target;
          const fields = (
            Array.isArray(effectiveTarget) ? effectiveTarget
            : typeof effectiveTarget === 'string' ? [effectiveTarget]
            : []
          ).join(',');

          if (fields.includes('order_number') && orderAttempt < 2) continue;

          if (fields.includes('idempotency_key') && dto.idempotency_key) {
            const concurrent = await this.prisma.order.findUnique({
              where: { idempotency_key: dto.idempotency_key },
              include: ORDER_INCLUDE,
            });
            if (concurrent?.user_id === userId) {
              return plainToInstance(OrderResponseDto, concurrent, TRANSFORM_OPTIONS);
            }
          }
        }
        throw e;
      }
    }

    this.logger.log(`Buyurtma yaratildi: ${(order as { order_number: string }).order_number} (${source})`);

    return plainToInstance(OrderResponseDto, order as Record<string, unknown>, TRANSFORM_OPTIONS);
  }

  /**
   * Zaxirani ayiradi. Har bir variant uchun SHARTLI yangilash ishlatiladi:
   * `WHERE id = ? AND stock >= ?`. Agar shart bajarilmasa (boshqa buyurtma
   * ulgurgan bo'lsa) `count = 0` qaytadi va butun tranzaksiya bekor qilinadi.
   *
   * Bu "avval tekshir, keyin yoz" yondashuvidagi poyga holatini yopadi.
   * DB darajasidagi `chk_variant_stock_non_negative` esa oxirgi to'siq.
   */
  private async reserveStock(
    tx: Prisma.TransactionClient,
    priced: PricedOrder,
    orderId: string,
    orderNumber: string,
  ): Promise<void> {
    for (const line of priced.lines) {
      const updated = await tx.productVariant.updateMany({
        where: { id: line.variant_id, stock: { gte: line.quantity } },
        data: { stock: { decrement: line.quantity } },
      });

      if (updated.count === 0) {
        throw new ConflictException(
          `"${line.product_name}" zaxirasi tugadi. Savatingizni yangilang.`,
        );
      }
    }

    await tx.stockTransaction.createMany({
      data: priced.lines.map((line) => ({
        variant_id: line.variant_id,
        type: StockTransactionType.OUT,
        quantity: line.quantity,
        unit_cost: line.unit_cost,
        reference: orderId,
        notes: `Buyurtma #${orderNumber}`,
      })),
    });

    await this.refreshProductStock(
      tx,
      priced.lines.map((l) => l.product_id),
    );
  }

  /** Zaxirani omborga qaytaradi (bekor qilish / qaytarilgan tovar). */
  private async releaseStock(
    tx: Prisma.TransactionClient,
    orderId: string,
    orderNumber: string,
    reason: string,
  ): Promise<void> {
    const items = await tx.orderItem.findMany({
      where: { order_id: orderId, variant_id: { not: null } },
      select: {
        variant_id: true,
        product_id: true,
        quantity: true,
        unit_cost: true,
      },
    });

    if (items.length === 0) return;

    await Promise.all(
      items.map((item) =>
        tx.productVariant.update({
          where: { id: item.variant_id! },
          data: { stock: { increment: item.quantity } },
        }),
      ),
    );

    await tx.stockTransaction.createMany({
      data: items.map((item) => ({
        variant_id: item.variant_id!,
        type: StockTransactionType.RETURN,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        reference: orderId,
        notes: `Buyurtma #${orderNumber} — ${reason}`,
      })),
    });

    await this.refreshProductStock(
      tx,
      items.map((i) => i.product_id).filter((id): id is string => id !== null),
    );
  }

  /** Mahsulotdagi denormalizatsiyalangan `total_stock` ni qayta hisoblaydi. */
  private async refreshProductStock(
    tx: Prisma.TransactionClient,
    productIds: string[],
  ): Promise<void> {
    const unique = [...new Set(productIds)];
    if (unique.length === 0) return;

    await tx.$executeRaw`
      UPDATE "products" p
      SET "total_stock" = COALESCE(agg.total, 0)
      FROM (
        SELECT pr."id" AS product_id,
               (SELECT COALESCE(SUM(v."stock"), 0)
                  FROM "product_variants" v
                 WHERE v."product_id" = pr."id" AND v."is_active" = TRUE) AS total
        FROM "products" pr
        WHERE pr."id" = ANY(${unique})
      ) agg
      WHERE p."id" = agg.product_id
    `;
  }

  /**
   * Inson o'qiy oladigan buyurtma raqami: ZP-YYMMDD-NNNN.
   * Mijoz uni telefonda aytishi kerak — cuid buning uchun yaroqsiz.
   */
  private async generateOrderNumber(tx: Prisma.TransactionClient): Promise<string> {
    const now = new Date();
    const datePart =
      String(now.getFullYear()).slice(2) +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0');

    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayCount = await tx.order.count({ where: { created_at: { gte: startOfDay } } });

    return `ZP-${datePart}-${String(todayCount + 1).padStart(4, '0')}`;
  }

  // ─── Mijoz uchun ───────────────────────────────────────────────────────────

  async findMyOrders(
    userId: string,
    filters: UserOrderFiltersDto,
  ): Promise<PaginatedOrdersResponseDto> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    const where: Prisma.OrderWhereInput = { user_id: userId };
    if (filters.status) where.status = filters.status;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: ORDER_INCLUDE,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return this.paginate(orders, total, page, limit);
  }

  async findMyOrder(userId: string, orderId: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, user_id: userId },
      include: ORDER_INCLUDE,
    });

    if (!order) throw new NotFoundException('Buyurtma topilmadi');

    return plainToInstance(OrderResponseDto, order, TRANSFORM_OPTIONS);
  }

  async cancelOrder(
    userId: string,
    orderId: string,
    dto: CancelOrderDto,
  ): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, user_id: userId },
      select: { id: true, status: true, order_number: true },
    });

    if (!order) throw new NotFoundException('Buyurtma topilmadi');

    if (!CUSTOMER_CANCELLABLE.includes(order.status)) {
      throw new ForbiddenException(
        "Bu buyurtma yig'ishga o'tgan — bekor qilish uchun operator bilan bog'laning",
      );
    }

    await this.applyStatusChange({
      orderId: order.id,
      orderNumber: order.order_number,
      from: order.status,
      to: OrderStatus.CANCELLED,
      actorId: userId,
      note: dto.reason ?? 'Mijoz bekor qildi',
      cancelReason: dto.reason,
    });

    return this.findMyOrder(userId, orderId);
  }

  // ─── Admin uchun ───────────────────────────────────────────────────────────

  async findAllAdmin(filters: OrderFiltersDto): Promise<PaginatedOrdersResponseDto> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    const where: Prisma.OrderWhereInput = {
      ...(filters.status && { status: filters.status }),
      ...(filters.payment_status && { payment_status: filters.payment_status }),
      ...(filters.user_id && { user_id: filters.user_id }),
      ...(filters.source && { source: filters.source }),
      ...(filters.search && {
        OR: [
          { order_number: { contains: filters.search, mode: 'insensitive' } },
          { customer_phone: { contains: filters.search } },
          { customer_name: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
      ...((filters.from || filters.to) && {
        created_at: {
          ...(filters.from ? { gte: new Date(filters.from) } : {}),
          ...(filters.to ? { lte: new Date(filters.to) } : {}),
        },
      }),
    };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: ORDER_INCLUDE,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return this.paginate(orders, total, page, limit);
  }

  async findOneAdmin(orderId: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: ORDER_INCLUDE,
    });

    if (!order) throw new NotFoundException('Buyurtma topilmadi');

    return plainToInstance(OrderResponseDto, order, TRANSFORM_OPTIONS);
  }

  async updateStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
    actorId: string,
  ): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, order_number: true, user_id: true },
    });

    if (!order) throw new NotFoundException('Buyurtma topilmadi');

    // Ruxsat etilmagan o'tish bu yerda to'xtaydi. Eski kod har qanday
    // o'tishga ruxsat berardi va CANCELLED → DELIVERED zaxirani buzardi.
    assertTransition(order.status, dto.status);

    await this.applyStatusChange({
      orderId: order.id,
      orderNumber: order.order_number,
      customerId: order.user_id,
      from: order.status,
      to: dto.status,
      actorId,
      note: dto.note,
      cancelReason: dto.status === OrderStatus.CANCELLED ? dto.note : undefined,
    });

    return this.findOneAdmin(orderId);
  }

  /**
   * To'lanmagan eski buyurtmalarni avtomatik bekor qiladi.
   * Texnik xizmat xizmati tomonidan kuniga bir necha marta chaqiriladi.
   */
  async expireUnpaidOrders(olderThanHours: number): Promise<number> {
    const cutoff = new Date(Date.now() - olderThanHours * 3_600_000);

    const expired = await this.prisma.order.findMany({
      where: {
        status: { in: [OrderStatus.PENDING, OrderStatus.CONFIRMED] },
        payment_status: 'UNPAID',
        created_at: { lt: cutoff },
      },
      select: { id: true, order_number: true, status: true },
    });

    let cancelled = 0;
    for (const order of expired) {
      try {
        await this.applyStatusChange({
          orderId: order.id,
          orderNumber: order.order_number,
          from: OrderStatus.PENDING,
          to: OrderStatus.CANCELLED,
          actorId: null,
          note: "To'lov muddati tugadi — avtomatik bekor qilish",
          cancelReason: "To'lov muddati tugadi",
        });
        cancelled++;
      } catch (e) {
        this.logger.warn(
          `Muddati o'tgan buyurtmani bekor qilishda xato: ${order.order_number}`,
          e,
        );
      }
    }

    return cancelled;
  }

  /**
   * Holat o'zgarishini atomik qo'llaydi: buyurtma yozuvi, zaxira samarasi,
   * tarix yozuvi va mijoz bildirishnomasi bitta tranzaksiyada.
   */
  private async applyStatusChange(params: {
    orderId: string;
    orderNumber: string;
    customerId?: string;
    from: OrderStatus;
    to: OrderStatus;
    actorId: string | null;
    note?: string;
    cancelReason?: string;
  }): Promise<void> {
    const { orderId, orderNumber, from, to, actorId, note, cancelReason } = params;
    const effect = stockEffectOf(from, to);
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      // Shartli yangilash: holat biz o'qiganidan keyin o'zgargan bo'lsa
      // (boshqa admin ulgurgan bo'lsa) hech narsa yozilmaydi.
      const updated = await tx.order.updateMany({
        where: { id: orderId, status: from },
        data: {
          status: to,
          ...(to === OrderStatus.CONFIRMED && { confirmed_at: now }),
          ...(to === OrderStatus.DELIVERED && {
            delivered_at: now,
            // Yetkazib berilgan buyurtma to'langan hisoblanadi (naqd pul).
            payment_status: PaymentStatus.PAID,
          }),
          ...(to === OrderStatus.CANCELLED && {
            cancelled_at: now,
            cancel_reason: cancelReason ?? null,
          }),
        },
      });

      if (updated.count === 0) {
        throw new ConflictException(
          'Buyurtma holati boshqa foydalanuvchi tomonidan o\'zgartirildi — sahifani yangilang',
        );
      }

      if (effect === 'RELEASE') {
        await this.releaseStock(tx, orderId, orderNumber, to.toLowerCase());

        // Reverse the coupon use so the coupon slot becomes available again.
        // A customer who cancels or returns an order should not permanently
        // consume one of the coupon's limited uses.
        const couponUse = await tx.couponUse.findUnique({ where: { order_id: orderId } });
        if (couponUse) {
          await tx.couponUse.delete({ where: { order_id: orderId } });
          await tx.$executeRaw`
            UPDATE coupons
            SET used_count = GREATEST(0, used_count - 1)
            WHERE id = ${couponUse.coupon_id}
          `;
        }
      }

      await tx.orderStatusEvent.create({
        data: {
          order_id: orderId,
          from_status: from,
          to_status: to,
          actor_id: actorId,
          note: note ?? null,
        },
      });

      if (to === OrderStatus.DELIVERED) {
        await this.onDelivered(tx, orderId, orderNumber, params.customerId);
      }
    });
  }

  /**
   * Yetkazib berilgandan keyin: sotilgan miqdorni yangilash va mijozni
   * sharh yozishga taklif qilish. Sharh huquqi shu yerdan boshlanadi.
   */
  private async onDelivered(
    tx: Prisma.TransactionClient,
    orderId: string,
    orderNumber: string,
    customerId?: string,
  ): Promise<void> {
    const items = await tx.orderItem.findMany({
      where: { order_id: orderId, product_id: { not: null } },
      select: { product_id: true, quantity: true },
    });

    for (const item of items) {
      await tx.product.update({
        where: { id: item.product_id! },
        data: { sold_count: { increment: item.quantity } },
      });
    }

    if (!customerId || !unlocksReview(OrderStatus.DELIVERED)) return;

    await tx.notification.create({
      data: {
        user_id: customerId,
        type: NotificationType.REVIEW_REQUEST,
        order_id: orderId,
        title_uz: 'Buyurtmangiz yetkazib berildi',
        title_ru: 'Ваш заказ доставлен',
        title_en: 'Your order has been delivered',
        body_uz: `#${orderNumber} buyurtma yetkazib berildi. Mahsulotni baholashni xohlaysizmi?`,
        body_ru: `Заказ #${orderNumber} доставлен. Хотите оценить товар?`,
        body_en: `Order #${orderNumber} delivered. Would you like to rate the product?`,
        link: `/profile?tab=orders&order=${orderId}&action=review`,
      },
    });
  }

  async updatePaymentStatus(
    orderId: string,
    dto: UpdatePaymentStatusDto,
  ): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, total_amount: true, payment_method: true },
    });

    if (!order) throw new NotFoundException('Buyurtma topilmadi');

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { payment_status: dto.payment_status },
      });

      // To'lov holati va `payments` jadvali bir-biridan ajralib ketmasligi
      // uchun har bir o'zgarish yozuv sifatida qayd etiladi.
      if (dto.payment_status === PaymentStatus.PAID) {
        const alreadyPaid = await tx.payment.findFirst({
          where: { order_id: orderId, status: PaymentStatus.PAID },
        });

        if (!alreadyPaid) {
          await tx.payment.create({
            data: {
              order_id: orderId,
              method: order.payment_method,
              status: PaymentStatus.PAID,
              amount: order.total_amount,
              paid_at: new Date(),
              notes: dto.note,
            },
          });
        }
      }
    });

    return this.findOneAdmin(orderId);
  }

  // ─── Yordamchilar ──────────────────────────────────────────────────────────

  private paginate(
    orders: unknown[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedOrdersResponseDto {
    return {
      data: plainToInstance(OrderResponseDto, orders, TRANSFORM_OPTIONS),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  private toPreviewDto(priced: PricedOrder): OrderPreviewResponseDto {
    return {
      items: priced.lines.map((line) => ({
        variant_id: line.variant_id,
        product_name: line.product_name,
        product_slug: line.product_slug,
        variant_volume: line.variant_volume,
        image_url: line.image_url,
        quantity: line.quantity,
        unit_price: line.unit_price.toFixed(2),
        line_total: line.line_total.toFixed(2),
      })),
      subtotal_amount: priced.subtotal.toFixed(2),
      discount_amount: priced.discount.toFixed(2),
      shipping_fee: priced.shipping.toFixed(2),
      total_amount: priced.total.toFixed(2),
      coupon_code: priced.coupon?.code ?? null,
      delivery_name: priced.delivery_option?.name_uz ?? null,
    };
  }
}
