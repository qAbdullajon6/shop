import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { PurchaseStatus } from '../../../../generated/prisma/client';

function decimalToString({ value }: { value: { toString(): string } | null | undefined }): string | null {
  if (value === null || value === undefined) return null;
  return value.toString();
}

// ─── Nested DTOs ─────────────────────────────────────────────────────────────

export class PurchaseSupplierDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() name!: string;
}

export class PurchaseCreatorDto {
  @ApiProperty() @Expose() id!: string;
  @ApiPropertyOptional({ nullable: true }) @Expose() name!: string | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() last_name!: string | null;
}

export class PurchaseProductDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() name_uz!: string;
  @ApiProperty() @Expose() name_ru!: string;
  @ApiProperty() @Expose() name_en!: string;
}

export class PurchaseVariantDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() sku!: string;

  @ApiProperty({ type: PurchaseProductDto })
  @Expose()
  @Type(() => PurchaseProductDto)
  product!: PurchaseProductDto;
}

export class PurchaseItemResponseDto {
  @ApiProperty() @Expose() id!: string;

  @ApiProperty({ type: PurchaseVariantDto })
  @Expose()
  @Type(() => PurchaseVariantDto)
  variant!: PurchaseVariantDto;

  @ApiProperty() @Expose() quantity!: number;

  @ApiProperty({ description: 'Birlik xarid narxi' })
  @Expose()
  @Type(() => String)
  @Transform(decimalToString)
  unit_cost!: string;
}

// ─── Main Response ───────────────────────────────────────────────────────────

export class PurchaseResponseDto {
  @ApiProperty() @Expose() id!: string;

  @ApiProperty({ type: PurchaseSupplierDto })
  @Expose()
  @Type(() => PurchaseSupplierDto)
  supplier!: PurchaseSupplierDto;

  @ApiProperty({ enum: PurchaseStatus }) @Expose() status!: PurchaseStatus;

  @ApiProperty({ description: 'Jami summa' })
  @Expose()
  @Type(() => String)
  @Transform(decimalToString)
  total_amount!: string;

  @ApiPropertyOptional({ nullable: true }) @Expose() notes!: string | null;

  @ApiPropertyOptional({ type: PurchaseCreatorDto, nullable: true })
  @Expose()
  @Type(() => PurchaseCreatorDto)
  creator!: PurchaseCreatorDto | null;

  @ApiProperty() @Expose() created_at!: Date;
  @ApiProperty() @Expose() updated_at!: Date;

  @ApiProperty({ type: [PurchaseItemResponseDto] })
  @Expose()
  @Type(() => PurchaseItemResponseDto)
  items!: PurchaseItemResponseDto[];
}
