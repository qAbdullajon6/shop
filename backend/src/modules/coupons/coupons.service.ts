import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CouponQueryDto } from './dto/coupon-query.dto';
import { CouponResponseDto } from './dto/coupon-response.dto';

const TRANSFORM_OPTIONS = { excludeExtraneousValues: true };

export interface PaginatedCouponsResponse {
  data: CouponResponseDto[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: CouponQueryDto): Promise<PaginatedCouponsResponse> {
    const { is_active, discount_type, search, page = 1, limit = 20 } = query;

    const where = {
      ...(is_active !== undefined && { is_active }),
      ...(discount_type !== undefined && { discount_type }),
      ...(search && {
        code: { contains: search, mode: 'insensitive' as const },
      }),
    };

    const skip = (page - 1) * limit;

    const [coupons, total] = await this.prisma.$transaction([
      this.prisma.coupon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.coupon.count({ where }),
    ]);

    return {
      data: plainToInstance(CouponResponseDto, coupons, TRANSFORM_OPTIONS),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<CouponResponseDto> {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Kupon topilmadi');
    return plainToInstance(CouponResponseDto, coupon, TRANSFORM_OPTIONS);
  }

  async create(dto: CreateCouponDto): Promise<CouponResponseDto> {
    const code = dto.code.toUpperCase();

    const existing = await this.prisma.coupon.findUnique({ where: { code } });
    if (existing) {
      throw new ConflictException('Bu kod bilan kupon allaqachon mavjud');
    }

    const coupon = await this.prisma.coupon.create({
      data: {
        code,
        discount_type: dto.discount_type,
        discount_value: dto.discount_value,
        min_order_amount: dto.min_order_amount ?? null,
        max_discount: dto.max_discount ?? null,
        max_uses: dto.max_uses ?? null,
        expires_at: dto.expires_at ?? null,
        is_active: dto.is_active ?? true,
      },
    });

    return plainToInstance(CouponResponseDto, coupon, TRANSFORM_OPTIONS);
  }

  async update(id: string, dto: UpdateCouponDto): Promise<CouponResponseDto> {
    const hasChanges =
      dto.code !== undefined ||
      dto.discount_type !== undefined ||
      dto.discount_value !== undefined ||
      dto.min_order_amount !== undefined ||
      dto.max_discount !== undefined ||
      dto.max_uses !== undefined ||
      dto.expires_at !== undefined ||
      dto.is_active !== undefined;

    if (!hasChanges) {
      throw new BadRequestException('Yangilash uchun kamida bitta maydon yuborilishi kerak');
    }

    const existing = await this.prisma.coupon.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Kupon topilmadi');

    const newCode = dto.code ? dto.code.toUpperCase() : undefined;

    if (newCode && newCode !== existing.code) {
      const conflict = await this.prisma.coupon.findUnique({ where: { code: newCode } });
      if (conflict) {
        throw new ConflictException('Bu kod bilan kupon allaqachon mavjud');
      }
    }

    const coupon = await this.prisma.coupon.update({
      where: { id },
      data: {
        ...(newCode !== undefined && { code: newCode }),
        ...(dto.discount_type !== undefined && { discount_type: dto.discount_type }),
        ...(dto.discount_value !== undefined && { discount_value: dto.discount_value }),
        ...(dto.min_order_amount !== undefined && { min_order_amount: dto.min_order_amount }),
        ...(dto.max_discount !== undefined && { max_discount: dto.max_discount }),
        ...(dto.max_uses !== undefined && { max_uses: dto.max_uses }),
        ...(dto.expires_at !== undefined && { expires_at: dto.expires_at }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
      },
    });

    return plainToInstance(CouponResponseDto, coupon, TRANSFORM_OPTIONS);
  }

  async remove(id: string): Promise<void> {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Kupon topilmadi');

    const usesCount = await this.prisma.couponUse.count({ where: { coupon_id: id } });
    if (usesCount > 0) {
      throw new ConflictException("Bu kupondan foydalanilgan, o'chirib bo'lmaydi");
    }

    await this.prisma.coupon.delete({ where: { id } });
  }
}
