import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { StockTransactionType } from '@prisma/client';

export class CreateStockTransactionDto {
  @ApiProperty({ example: 'clvariant000001' })
  @IsNotEmpty({ message: "Variant ID bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Variant ID matn bo'lishi kerak" })
  variant_id!: string;

  @ApiProperty({ enum: StockTransactionType, example: StockTransactionType.IN })
  @IsEnum(StockTransactionType, { message: "Tranzaksiya turi noto'g'ri" })
  type!: StockTransactionType;

  @ApiProperty({ example: 5, minimum: 1 })
  @IsInt({ message: "Miqdor butun son bo'lishi kerak" })
  @Min(1, { message: "Miqdor 1 dan kichik bo'lmasligi kerak" })
  quantity!: number;

  @ApiProperty({ example: 45000.0, description: 'Birlik tannarx' })
  @Type(() => Number)
  @IsNumber({}, { message: "Birlik narxi raqam bo'lishi kerak" })
  @IsPositive({ message: "Birlik narxi musbat bo'lishi kerak" })
  unit_cost!: number;

  @ApiPropertyOptional({ example: 'purchase-abc123' })
  @IsOptional()
  @IsString({ message: "Referens matn bo'lishi kerak" })
  reference?: string;

  @ApiPropertyOptional({ example: 'Qo\'lda kiritildi' })
  @IsOptional()
  @IsString({ message: "Izoh matn bo'lishi kerak" })
  notes?: string;
}
