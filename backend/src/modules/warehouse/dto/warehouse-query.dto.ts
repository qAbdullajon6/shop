import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import {
  PurchaseStatus,
  StockTransactionType,
} from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class WarehouseQueryDto extends PaginationDto {
  // ─── Supplier filter ───────────────────────────────────────────────────────

  @ApiPropertyOptional({ example: true, description: "Faollik holati bo'yicha filter (ta'minotchilar)" })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: "is_active boolean bo'lishi kerak" })
  is_active?: boolean;

  // ─── Purchase filters ──────────────────────────────────────────────────────

  @ApiPropertyOptional({ example: 'clsupplier000001', description: "Ta'minotchi bo'yicha filter" })
  @IsOptional()
  @IsString({ message: "Ta'minotchi ID matn bo'lishi kerak" })
  supplier_id?: string;

  @ApiPropertyOptional({ enum: PurchaseStatus, description: "Xarid holati bo'yicha filter" })
  @IsOptional()
  @IsEnum(PurchaseStatus, { message: "Xarid holati noto'g'ri" })
  status?: PurchaseStatus;

  // ─── Stock filters ─────────────────────────────────────────────────────────

  @ApiPropertyOptional({ example: 'clvariant000001', description: "Variant bo'yicha filter" })
  @IsOptional()
  @IsString({ message: "Variant ID matn bo'lishi kerak" })
  variant_id?: string;

  @ApiPropertyOptional({ enum: StockTransactionType, description: "Tranzaksiya turi bo'yicha filter" })
  @IsOptional()
  @IsEnum(StockTransactionType, { message: "Tranzaksiya turi noto'g'ri" })
  type?: StockTransactionType;
}
