import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { StockTransactionType } from '../../../../generated/prisma/client';

function decimalToString({ value }: { value: { toString(): string } | null | undefined }): string | null {
  if (value === null || value === undefined) return null;
  return value.toString();
}

// ─── Nested DTOs ─────────────────────────────────────────────────────────────

export class StockVariantProductDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() name_uz!: string;
  @ApiProperty() @Expose() name_ru!: string;
  @ApiProperty() @Expose() name_en!: string;
}

export class StockVariantDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() sku!: string;

  @ApiProperty({ type: StockVariantProductDto })
  @Expose()
  @Type(() => StockVariantProductDto)
  product!: StockVariantProductDto;
}

export class StockCreatorDto {
  @ApiProperty() @Expose() id!: string;
  @ApiPropertyOptional({ nullable: true }) @Expose() name!: string | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() last_name!: string | null;
}

// ─── Main Response ───────────────────────────────────────────────────────────

export class StockTransactionResponseDto {
  @ApiProperty() @Expose() id!: string;

  @ApiProperty({ type: StockVariantDto })
  @Expose()
  @Type(() => StockVariantDto)
  variant!: StockVariantDto;

  @ApiProperty({ enum: StockTransactionType }) @Expose() type!: StockTransactionType;

  @ApiProperty() @Expose() quantity!: number;

  @ApiProperty({ description: 'Birlik tannarx' })
  @Expose()
  @Type(() => String)
  @Transform(decimalToString)
  unit_cost!: string;

  @ApiPropertyOptional({ nullable: true }) @Expose() reference!: string | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() notes!: string | null;

  @ApiPropertyOptional({ type: StockCreatorDto, nullable: true })
  @Expose()
  @Type(() => StockCreatorDto)
  creator!: StockCreatorDto | null;

  @ApiProperty() @Expose() created_at!: Date;
}
