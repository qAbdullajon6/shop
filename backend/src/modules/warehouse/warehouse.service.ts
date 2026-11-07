import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  Prisma,
  PurchaseStatus,
  StockTransactionType,
} from '../../../generated/prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { CreateStockTransactionDto } from './dto/create-stock-transaction.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import {
  PurchaseResponseDto,
} from './dto/purchase-response.dto';
import {
  StockTransactionResponseDto,
} from './dto/stock-transaction-response.dto';
import { SupplierResponseDto } from './dto/supplier-response.dto';
import { UpdatePurchaseStatusDto } from './dto/update-purchase-status.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { WarehouseQueryDto } from './dto/warehouse-query.dto';

const TRANSFORM_OPTIONS = { excludeExtraneousValues: true };

const PURCHASE_INCLUDE = {
  supplier: { select: { id: true, name: true } },
  creator: { select: { id: true, name: true, last_name: true } },
  items: {
    include: {
      variant: {
        include: {
          product: { select: { id: true, name_uz: true, name_ru: true, name_en: true } },
        },
      },
    },
  },
} satisfies Prisma.PurchaseInclude;

const STOCK_INCLUDE = {
  variant: {
    include: {
      product: { select: { id: true, name_uz: true, name_ru: true, name_en: true } },
    },
  },
  creator: { select: { id: true, name: true, last_name: true } },
} satisfies Prisma.StockTransactionInclude;

// ─── Response types ───────────────────────────────────────────────────────────

export interface PaginatedSuppliersResponse {
  data: SupplierResponseDto[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PaginatedPurchasesResponse {
  data: PurchaseResponseDto[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PaginatedStockResponse {
  data: StockTransactionResponseDto[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

@Injectable()
export class WarehouseService {
  constructor(private readonly prisma: PrismaService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // SUPPLIERS
  // ═══════════════════════════════════════════════════════════════════════════

  async findAllSuppliers(query: WarehouseQueryDto): Promise<PaginatedSuppliersResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.SupplierWhereInput = {};
    if (query.is_active !== undefined) where.is_active = query.is_active;

    const [suppliers, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return {
      data: plainToInstance(SupplierResponseDto, suppliers, TRANSFORM_OPTIONS),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async findOneSupplier(id: string): Promise<SupplierResponseDto> {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundException("Ta'minotchi topilmadi");
    return plainToInstance(SupplierResponseDto, supplier, TRANSFORM_OPTIONS);
  }

  async createSupplier(dto: CreateSupplierDto): Promise<SupplierResponseDto> {
    const supplier = await this.prisma.supplier.create({ data: dto });
    return plainToInstance(SupplierResponseDto, supplier, TRANSFORM_OPTIONS);
  }

  async updateSupplier(id: string, dto: UpdateSupplierDto): Promise<SupplierResponseDto> {
    const hasFields = Object.keys(dto).length > 0;
    if (!hasFields) {
      throw new BadRequestException('Yangilash uchun kamida bitta maydon yuborilishi kerak');
    }

    const existing = await this.prisma.supplier.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Ta'minotchi topilmadi");

    const updated = await this.prisma.supplier.update({ where: { id }, data: dto });
    return plainToInstance(SupplierResponseDto, updated, TRANSFORM_OPTIONS);
  }

  async removeSupplier(id: string): Promise<void> {
    const existing = await this.prisma.supplier.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Ta'minotchi topilmadi");

    const purchaseCount = await this.prisma.purchase.count({
      where: { supplier_id: id },
    });
    if (purchaseCount > 0) {
      throw new ConflictException("Bu ta'minotchining xarid yozuvlari mavjud");
    }

    await this.prisma.supplier.delete({ where: { id } });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PURCHASES
  // ═══════════════════════════════════════════════════════════════════════════

  async findAllPurchases(query: WarehouseQueryDto): Promise<PaginatedPurchasesResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PurchaseWhereInput = {};
    if (query.supplier_id) where.supplier_id = query.supplier_id;
    if (query.status) where.status = query.status;

    const [purchases, total] = await Promise.all([
      this.prisma.purchase.findMany({
        where,
        skip,
        take: limit,
        include: PURCHASE_INCLUDE,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.purchase.count({ where }),
    ]);

    return {
      data: plainToInstance(PurchaseResponseDto, purchases, TRANSFORM_OPTIONS),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async findOnePurchase(id: string): Promise<PurchaseResponseDto> {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: PURCHASE_INCLUDE,
    });
    if (!purchase) throw new NotFoundException('Xarid topilmadi');
    return plainToInstance(PurchaseResponseDto, purchase, TRANSFORM_OPTIONS);
  }

  async createPurchase(userId: string, dto: CreatePurchaseDto): Promise<PurchaseResponseDto> {
    // Verify supplier exists and is active
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: dto.supplier_id },
    });
    if (!supplier) throw new NotFoundException("Ta'minotchi topilmadi");
    if (!supplier.is_active) {
      throw new BadRequestException("Ta'minotchi nofaol holda, xarid qilish mumkin emas");
    }

    // Verify all variants exist
    const variantIds = dto.items.map((i) => i.variant_id);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      select: { id: true },
    });
    if (variants.length !== variantIds.length) {
      throw new NotFoundException("Ba'zi mahsulot variantlari topilmadi");
    }

    // Calculate total amount
    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_cost,
      0,
    );

    const purchase = await this.prisma.$transaction(async (tx) => {
      const created = await tx.purchase.create({
        data: {
          supplier_id: dto.supplier_id,
          notes: dto.notes,
          total_amount: totalAmount,
          created_by: userId,
          items: {
            create: dto.items.map((item) => ({
              variant_id: item.variant_id,
              quantity: item.quantity,
              unit_cost: item.unit_cost,
            })),
          },
        },
      });

      return tx.purchase.findUniqueOrThrow({
        where: { id: created.id },
        include: PURCHASE_INCLUDE,
      });
    });

    return plainToInstance(PurchaseResponseDto, purchase, TRANSFORM_OPTIONS);
  }

  async updatePurchaseStatus(
    id: string,
    dto: UpdatePurchaseStatusDto,
    userId: string,
  ): Promise<PurchaseResponseDto> {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!purchase) throw new NotFoundException('Xarid topilmadi');

    // Only allow PENDING → RECEIVED or PENDING → CANCELLED
    if (purchase.status !== PurchaseStatus.PENDING) {
      throw new BadRequestException(
        "Faqat 'PENDING' holatidagi xarid holatini o'zgartirish mumkin",
      );
    }
    if (
      dto.status !== PurchaseStatus.RECEIVED &&
      dto.status !== PurchaseStatus.CANCELLED
    ) {
      throw new BadRequestException(
        "Faqat RECEIVED yoki CANCELLED holatga o'tkazish mumkin",
      );
    }

    await this.prisma.$transaction(async (tx) => {
      if (dto.status === PurchaseStatus.RECEIVED) {
        for (const item of purchase.items) {
          await tx.productVariant.update({
            where: { id: item.variant_id },
            data: { stock: { increment: item.quantity } },
          });

          await tx.stockTransaction.create({
            data: {
              variant_id: item.variant_id,
              type: StockTransactionType.IN,
              quantity: item.quantity,
              unit_cost: item.unit_cost,
              reference: purchase.id,
              notes: `Xarid #${purchase.id} qabul qilindi`,
              created_by: userId,
            },
          });
        }
      }

      await tx.purchase.update({
        where: { id },
        data: { status: dto.status },
      });
    });

    return this.findOnePurchase(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STOCK TRANSACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  async findAllStock(query: WarehouseQueryDto): Promise<PaginatedStockResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.StockTransactionWhereInput = {};
    if (query.variant_id) where.variant_id = query.variant_id;
    if (query.type) where.type = query.type;

    const [transactions, total] = await Promise.all([
      this.prisma.stockTransaction.findMany({
        where,
        skip,
        take: limit,
        include: STOCK_INCLUDE,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.stockTransaction.count({ where }),
    ]);

    return {
      data: plainToInstance(StockTransactionResponseDto, transactions, TRANSFORM_OPTIONS),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async createStockTransaction(
    userId: string,
    dto: CreateStockTransactionDto,
  ): Promise<StockTransactionResponseDto> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variant_id },
      select: { id: true, stock: true },
    });
    if (!variant) throw new NotFoundException('Mahsulot varianti topilmadi');

    const isDecrement =
      dto.type === StockTransactionType.OUT ||
      dto.type === StockTransactionType.DAMAGED;

    if (isDecrement && variant.stock < dto.quantity) {
      throw new BadRequestException(
        `Yetarli zaxira yo'q. Mavjud: ${variant.stock}, so'ralgan: ${dto.quantity}`,
      );
    }

    const transaction = await this.prisma.$transaction(async (tx) => {
      const stockDelta =
        dto.type === StockTransactionType.IN ||
        dto.type === StockTransactionType.RETURN ||
        dto.type === StockTransactionType.ADJUSTMENT
          ? { increment: dto.quantity }
          : { decrement: dto.quantity };

      await tx.productVariant.update({
        where: { id: dto.variant_id },
        data: { stock: stockDelta },
      });

      const created = await tx.stockTransaction.create({
        data: {
          variant_id: dto.variant_id,
          type: dto.type,
          quantity: dto.quantity,
          unit_cost: dto.unit_cost,
          reference: dto.reference,
          notes: dto.notes,
          created_by: userId,
        },
      });

      return tx.stockTransaction.findUniqueOrThrow({
        where: { id: created.id },
        include: STOCK_INCLUDE,
      });
    });

    return plainToInstance(StockTransactionResponseDto, transaction, TRANSFORM_OPTIONS);
  }
}
