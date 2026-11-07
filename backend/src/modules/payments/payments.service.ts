import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';
import {
  PaginatedPaymentsResponseDto,
  PaymentResponseDto,
} from './dto/payment-response.dto';

const TRANSFORM_OPTIONS = { excludeExtraneousValues: true };

const PAYMENT_INCLUDE = {
  order: {
    select: {
      id: true,
      order_number: true,
      total_amount: true,
      discount_amount: true,
      payment_status: true,
      user: { select: { id: true, phone_number: true, name: true, last_name: true } },
    },
  },
} satisfies Prisma.PaymentInclude;

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaymentQueryDto): Promise<PaginatedPaymentsResponseDto> {
    const { order_id, status, method, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {
      ...(order_id !== undefined && { order_id }),
      ...(status !== undefined && { status }),
      ...(method !== undefined && { method }),
    };

    const [payments, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: PAYMENT_INCLUDE,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: plainToInstance(PaymentResponseDto, payments, TRANSFORM_OPTIONS),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<PaymentResponseDto> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: PAYMENT_INCLUDE,
    });

    if (!payment) throw new NotFoundException("To'lov topilmadi");

    return plainToInstance(PaymentResponseDto, payment, TRANSFORM_OPTIONS);
  }

  async create(dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    // Idempotency: if transaction_id already recorded, return it.
    if (dto.transaction_id) {
      const existing = await this.prisma.payment.findUnique({
        where: { transaction_id: dto.transaction_id },
        include: PAYMENT_INCLUDE,
      });
      if (existing) return plainToInstance(PaymentResponseDto, existing, TRANSFORM_OPTIONS);
    }

    const order = await this.prisma.order.findUnique({
      where: { id: dto.order_id },
      select: { id: true, total_amount: true },
    });

    if (!order) throw new NotFoundException('Buyurtma topilmadi');

    // Admin xatosidan himoya: to'lov summasi buyurtma summasidan oshmasligi kerak.
    const orderTotal = Number(order.total_amount);
    if (dto.amount > orderTotal + 0.01) {
      throw new BadRequestException(
        `To'lov summasi buyurtma summasidan (${orderTotal.toFixed(2)}) oshmasligi kerak`,
      );
    }

    const payment = await this.prisma.$transaction(async (tx) => {
      const newPayment = await tx.payment.create({
        data: {
          order_id: dto.order_id,
          method: dto.method,
          amount: dto.amount,
          transaction_id: dto.transaction_id ?? null,
          notes: dto.notes ?? null,
        },
        include: PAYMENT_INCLUDE,
      });

      await this.recalculateOrderPaymentStatus(dto.order_id, tx);

      return newPayment;
    });

    return plainToInstance(PaymentResponseDto, payment, TRANSFORM_OPTIONS);
  }

  async update(id: string, dto: UpdatePaymentDto): Promise<PaymentResponseDto> {
    const existing = await this.prisma.payment.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("To'lov topilmadi");

    const hasChanges =
      dto.status !== undefined ||
      dto.transaction_id !== undefined ||
      dto.notes !== undefined;

    if (!hasChanges) {
      throw new BadRequestException(
        "Yangilash uchun kamida bitta maydon yuborilishi kerak",
      );
    }

    const payment = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id },
        data: {
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.status === 'PAID' && !existing.paid_at && { paid_at: new Date() }),
          ...(dto.transaction_id !== undefined && { transaction_id: dto.transaction_id }),
          ...(dto.notes !== undefined && { notes: dto.notes }),
        },
        include: PAYMENT_INCLUDE,
      });

      await this.recalculateOrderPaymentStatus(existing.order_id, tx);

      return updated;
    });

    return plainToInstance(PaymentResponseDto, payment, TRANSFORM_OPTIONS);
  }

  private async recalculateOrderPaymentStatus(
    orderId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const order = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      select: { total_amount: true },
    });

    const paidPayments = await tx.payment.aggregate({
      where: { order_id: orderId, status: PaymentStatus.PAID },
      _sum: { amount: true },
    });

    const paidSum = Number(paidPayments._sum.amount ?? 0);
    const totalAmount = Number(order.total_amount);

    let newStatus: PaymentStatus;

    if (paidSum >= totalAmount) {
      newStatus = PaymentStatus.PAID;
    } else if (paidSum > 0) {
      newStatus = PaymentStatus.PARTIALLY_PAID;
    } else {
      newStatus = PaymentStatus.UNPAID;
    }

    await tx.order.update({
      where: { id: orderId },
      data: { payment_status: newStatus },
    });
  }
}
