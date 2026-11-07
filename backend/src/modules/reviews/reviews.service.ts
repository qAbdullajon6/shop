import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import {
  OrderStatus,
  Prisma,
  ReviewStatus,
  Role,
} from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AdminReviewQueryDto } from './dto/admin-review-query.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { ReviewQueryDto, ReviewSort } from './dto/review-query.dto';
import {
  PaginatedReviewsResponseDto,
  PendingReviewDto,
  ProductRatingSummaryDto,
  ReviewResponseDto,
} from './dto/review-response.dto';

const TRANSFORM_OPTIONS = { excludeExtraneousValues: true };

const REVIEW_INCLUDE = {
  user: { select: { id: true, name: true, last_name: true, avatar: true } },
  order_item: { select: { variant_volume: true, variant_sku: true } },
} satisfies Prisma.ReviewInclude;

/**
 * Sharh tizimi.
 *
 * Asosiy biznes qoidasi: TASDIQLANGAN XARID sharhini faqat mahsulotni
 * haqiqatan sotib olgan va YETKAZIB BERILGAN buyurtmaga ega mijoz yozadi.
 *
 * Bu qoida uch qavatda majburlanadi:
 *   1. Servis — huquq tekshiruvi (quyida)
 *   2. Sxema  — `order_item_id` unique, ya'ni bitta xarid qatoriga bitta sharh
 *   3. DB     — `chk_review_verified_has_order_item` CHECK cheklovi
 *
 * Frontend hech qanday tekshiruvda ishtirok etmaydi.
 */
@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Ommaviy o'qish ────────────────────────────────────────────────────────

  async findByProduct(query: ReviewQueryDto): Promise<PaginatedReviewsResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const where: Prisma.ReviewWhereInput = {
      product_id: query.product_id,
      status: ReviewStatus.APPROVED,
      ...(query.rating && { rating: query.rating }),
      ...(query.only_verified && { is_verified: true }),
      ...(query.with_comment && { comment: { not: null } }),
    };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: REVIEW_INCLUDE,
        orderBy: this.buildOrderBy(query.sort),
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data: plainToInstance(ReviewResponseDto, reviews, TRANSFORM_OPTIONS),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  /**
   * Mahsulotning baho xulosasi: o'rtacha, jami va yulduzlar bo'yicha taqsimot.
   * Faqat TASDIQLANGAN sharhlar hisobga olinadi.
   */
  async getRatingSummary(productId: string): Promise<ProductRatingSummaryDto> {
    const [product, distribution, dimensions] = await this.prisma.$transaction(
      async (tx) =>
        Promise.all([
          tx.product.findFirst({
            where: { id: productId, deleted_at: null },
            select: { rating_avg: true, rating_count: true },
          }),
          tx.review.groupBy({
            by: ['rating'],
            where: { product_id: productId, status: ReviewStatus.APPROVED },
            _count: { rating: true },
            orderBy: [],
          }),
          tx.review.aggregate({
            where: { product_id: productId, status: ReviewStatus.APPROVED },
            _avg: {
              rating_longevity: true,
              rating_quality: true,
              rating_packaging: true,
              rating_value: true,
            },
          }),
        ]),
    );

    if (!product) throw new NotFoundException('Mahsulot topilmadi');

    const byStar: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const row of distribution) {
      byStar[row.rating] = row._count.rating;
    }

    const avg = (v: number | null): number | null =>
      v === null ? null : Math.round(v * 10) / 10;

    return {
      average: Number(product.rating_avg),
      total: product.rating_count,
      distribution: {
        five: byStar[5],
        four: byStar[4],
        three: byStar[3],
        two: byStar[2],
        one: byStar[1],
      },
      longevity: avg(dimensions._avg.rating_longevity),
      quality: avg(dimensions._avg.rating_quality),
      packaging: avg(dimensions._avg.rating_packaging),
      value: avg(dimensions._avg.rating_value),
    };
  }

  // ─── Sharh yozish huquqi ───────────────────────────────────────────────────

  /**
   * Mijoz baho bera oladigan xaridlar ro'yxati.
   *
   * Profil sahifasi "Buyurtmangiz yetkazib berildi. Mahsulotni baholashni
   * xohlaysizmi?" taklifini shu ro'yxatdan quradi.
   */
  async findPendingReviews(userId: string): Promise<PendingReviewDto[]> {
    const items = await this.prisma.orderItem.findMany({
      where: {
        order: { user_id: userId, status: OrderStatus.DELIVERED },
        // Sharh hali yozilmagan qatorlar
        review: null,
        product_id: { not: null },
      },
      select: {
        id: true,
        product_id: true,
        product_name: true,
        product_slug: true,
        variant_volume: true,
        image_url: true,
        order: {
          select: { id: true, order_number: true, delivered_at: true },
        },
      },
      orderBy: { order: { delivered_at: 'desc' } },
      take: 50,
    });

    return items.map((item) => ({
      order_item_id: item.id,
      product_id: item.product_id!,
      product_name: item.product_name,
      product_slug: item.product_slug,
      variant_volume: item.variant_volume,
      image_url: item.image_url,
      order_id: item.order.id,
      order_number: item.order.order_number,
      delivered_at: item.order.delivered_at,
    }));
  }

  // ─── Sharh yaratish ────────────────────────────────────────────────────────

  async create(userId: string, dto: CreateReviewDto): Promise<ReviewResponseDto> {
    // Yagona so'rovda huquqning BARCHA shartlari tekshiriladi:
    // qator mijozniki, buyurtma yetkazilgan, sharh hali yozilmagan.
    const orderItem = await this.prisma.orderItem.findFirst({
      where: {
        id: dto.order_item_id,
        order: { user_id: userId },
      },
      select: {
        id: true,
        product_id: true,
        order: { select: { status: true, delivered_at: true } },
        review: { select: { id: true } },
      },
    });

    if (!orderItem) {
      // Mavjud emas va "boshqa mijozniki" bir xil javob beradi — aks holda
      // endpoint boshqalarning buyurtma ID'larini tekshirish vositasiga aylanadi.
      throw new NotFoundException('Xarid topilmadi');
    }

    if (orderItem.order.status !== OrderStatus.DELIVERED) {
      throw new ForbiddenException(
        'Mahsulot yetkazib berilgandan keyin baho berish mumkin',
      );
    }

    if (orderItem.review) {
      throw new BadRequestException('Siz bu xaridga allaqachon baho bergansiz');
    }

    if (!orderItem.product_id) {
      throw new BadRequestException('Bu mahsulot endi katalogda mavjud emas');
    }

    // Sozlamaga qarab sharh darhol chop etiladi yoki moderatsiyaga tushadi.
    const autoApprove = await this.isAutoApproveEnabled();
    const status = autoApprove ? ReviewStatus.APPROVED : ReviewStatus.PENDING;

    const review = await this.prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          user_id: userId,
          product_id: orderItem.product_id!,
          order_item_id: orderItem.id,
          rating: dto.rating,
          title: dto.title,
          comment: dto.comment,
          rating_longevity: dto.rating_longevity,
          rating_quality: dto.rating_quality,
          rating_packaging: dto.rating_packaging,
          rating_value: dto.rating_value,
          is_verified: true,
          status,
        },
        include: REVIEW_INCLUDE,
      });

      if (status === ReviewStatus.APPROVED) {
        await this.recalculateProductRating(tx, orderItem.product_id!);
      }

      return created;
    });

    return plainToInstance(ReviewResponseDto, review, TRANSFORM_OPTIONS);
  }

  async update(
    userId: string,
    reviewId: string,
    dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, user_id: true, product_id: true, status: true },
    });

    if (!review) throw new NotFoundException('Baho topilmadi');
    if (review.user_id !== userId) throw new ForbiddenException('Ruxsat etilmagan');

    const autoApprove = await this.isAutoApproveEnabled();

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.review.update({
        where: { id: reviewId },
        data: {
          ...(dto.rating !== undefined && { rating: dto.rating }),
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.comment !== undefined && { comment: dto.comment }),
          ...(dto.rating_longevity !== undefined && {
            rating_longevity: dto.rating_longevity,
          }),
          ...(dto.rating_quality !== undefined && { rating_quality: dto.rating_quality }),
          ...(dto.rating_packaging !== undefined && {
            rating_packaging: dto.rating_packaging,
          }),
          ...(dto.rating_value !== undefined && { rating_value: dto.rating_value }),
          // Tahrirlangan sharh moderatsiyaga qaytadi — aks holda tasdiqdan
          // o'tgan matnni keyin o'zgartirib yuborish mumkin bo'lardi.
          status: autoApprove ? ReviewStatus.APPROVED : ReviewStatus.PENDING,
        },
        include: REVIEW_INCLUDE,
      });

      await this.recalculateProductRating(tx, review.product_id);
      return result;
    });

    return plainToInstance(ReviewResponseDto, updated, TRANSFORM_OPTIONS);
  }

  async remove(userId: string, userRole: Role, reviewId: string): Promise<void> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, user_id: true, product_id: true },
    });

    if (!review) throw new NotFoundException('Baho topilmadi');

    const isOwner = review.user_id === userId;
    const isAdmin = userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN;

    if (!isOwner && !isAdmin) throw new ForbiddenException('Ruxsat etilmagan');

    await this.prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id: reviewId } });
      await this.recalculateProductRating(tx, review.product_id);
    });
  }

  // ─── Foydali ovozlar ───────────────────────────────────────────────────────

  async vote(userId: string, reviewId: string, isHelpful: boolean): Promise<{ helpful_count: number }> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, user_id: true },
    });

    if (!review) throw new NotFoundException('Baho topilmadi');

    if (review.user_id === userId) {
      throw new BadRequestException("O'z sharhingizga ovoz bera olmaysiz");
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.reviewVote.upsert({
        where: { review_id_user_id: { review_id: reviewId, user_id: userId } },
        create: { review_id: reviewId, user_id: userId, is_helpful: isHelpful },
        update: { is_helpful: isHelpful },
      });

      const helpfulCount = await tx.reviewVote.count({
        where: { review_id: reviewId, is_helpful: true },
      });

      return tx.review.update({
        where: { id: reviewId },
        data: { helpful_count: helpfulCount },
        select: { helpful_count: true },
      });
    });

    return { helpful_count: updated.helpful_count };
  }

  // ─── Admin moderatsiyasi ───────────────────────────────────────────────────

  async findAllAdmin(query: AdminReviewQueryDto): Promise<PaginatedReviewsResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.ReviewWhereInput = {
      ...(query.product_id && { product_id: query.product_id }),
      ...(query.status && { status: query.status }),
    };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          ...REVIEW_INCLUDE,
          product: { select: { id: true, name_uz: true, slug: true } },
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data: plainToInstance(ReviewResponseDto, reviews, TRANSFORM_OPTIONS),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async moderate(
    reviewId: string,
    dto: ModerateReviewDto,
    moderatorId: string,
  ): Promise<ReviewResponseDto> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, product_id: true, user_id: true },
    });

    if (!review) throw new NotFoundException('Baho topilmadi');

    // An admin must not moderate their own review — prevents self-approval.
    if (review.user_id === moderatorId) {
      throw new ForbiddenException('Moderator o\'z bahosini tasdiqlashi yoki rad etishi mumkin emas');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.review.update({
        where: { id: reviewId },
        data: { status: dto.status, admin_note: dto.admin_note },
        include: REVIEW_INCLUDE,
      });

      // Tasdiqlash yoki rad etish o'rtacha bahoni o'zgartiradi.
      await this.recalculateProductRating(tx, review.product_id);
      return result;
    });

    return plainToInstance(ReviewResponseDto, updated, TRANSFORM_OPTIONS);
  }

  // ─── Ichki ─────────────────────────────────────────────────────────────────

  /**
   * Mahsulotning denormalizatsiyalangan `rating_avg` / `rating_count` ini
   * qayta hisoblaydi.
   *
   * Ilgari o'rtacha baho har bir ro'yxat so'rovida `groupBy` bilan hisoblanardi
   * va TASDIQLANMAGAN sharhlarni ham qo'shardi — mahsulot "4.8 (12)" ko'rsatib,
   * ostida bitta ham sharh chiqmasligi mumkin edi. Endi u faqat APPROVED
   * sharhlardan, o'zgarish paytida hisoblanadi.
   */
  private async recalculateProductRating(
    tx: Prisma.TransactionClient,
    productId: string,
  ): Promise<void> {
    const stats = await tx.review.aggregate({
      where: { product_id: productId, status: ReviewStatus.APPROVED },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await tx.product.update({
      where: { id: productId },
      data: {
        rating_avg: stats._avg.rating
          ? new Prisma.Decimal(stats._avg.rating).toDecimalPlaces(2)
          : new Prisma.Decimal(0),
        rating_count: stats._count.rating,
      },
    });
  }

  private async isAutoApproveEnabled(): Promise<boolean> {
    const setting = await this.prisma.setting.findUnique({
      where: { key: 'review.auto_approve' },
    });
    return setting?.value === 'true';
  }

  private buildOrderBy(sort?: ReviewSort): Prisma.ReviewOrderByWithRelationInput {
    switch (sort) {
      case ReviewSort.OLDEST:
        return { created_at: 'asc' };
      case ReviewSort.RATING_HIGH:
        return { rating: 'desc' };
      case ReviewSort.RATING_LOW:
        return { rating: 'asc' };
      case ReviewSort.HELPFUL:
        return { helpful_count: 'desc' };
      default:
        return { created_at: 'desc' };
    }
  }
}
