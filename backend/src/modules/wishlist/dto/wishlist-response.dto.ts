import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';

function decimalToString({
  value,
}: {
  value: { toString(): string } | null | undefined;
}): string | null {
  if (value === null || value === undefined) return null;
  return value.toString();
}

export class WishlistBrandDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() name!: string;
  @ApiProperty() @Expose() slug!: string;
}

export class WishlistCategoryDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() name_uz!: string;
  @ApiProperty() @Expose() slug!: string;
}

export class WishlistImageDto {
  @ApiProperty() @Expose() url!: string;
}

export class WishlistProductDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() name_uz!: string;
  @ApiProperty() @Expose() name_ru!: string;
  @ApiProperty() @Expose() name_en!: string;
  @ApiProperty() @Expose() slug!: string;

  @ApiPropertyOptional({ example: '1150000.00', nullable: true })
  @Expose()
  @Type(() => String)
  @Transform(decimalToString)
  min_price!: string | null;

  @ApiProperty({ example: 42, description: 'Faol variantlar zaxirasi yig\'indisi' })
  @Expose()
  total_stock!: number;

  @ApiProperty({ example: '4.60' })
  @Expose()
  @Type(() => String)
  @Transform(decimalToString)
  rating_avg!: string;

  @ApiProperty({ example: 18 }) @Expose() rating_count!: number;

  @ApiPropertyOptional({ type: WishlistBrandDto, nullable: true })
  @Expose()
  @Type(() => WishlistBrandDto)
  brand!: WishlistBrandDto | null;

  @ApiProperty({ type: WishlistCategoryDto })
  @Expose()
  @Type(() => WishlistCategoryDto)
  category!: WishlistCategoryDto;

  @ApiProperty({ type: [WishlistImageDto] })
  @Expose()
  @Type(() => WishlistImageDto)
  images!: WishlistImageDto[];
}

export class WishlistVariantDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() sku!: string;
  @ApiPropertyOptional({ nullable: true }) @Expose() volume!: string | null;

  @ApiProperty({ example: '1150000.00' })
  @Expose()
  @Type(() => String)
  @Transform(decimalToString)
  price!: string;

  @ApiPropertyOptional({ example: '1450000.00', nullable: true })
  @Expose()
  @Type(() => String)
  @Transform(decimalToString)
  compare_at_price!: string | null;

  @ApiProperty() @Expose() stock!: number;
}

export class WishlistItemResponseDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() product_id!: string;

  @ApiPropertyOptional({ nullable: true }) @Expose() variant_id!: string | null;

  @ApiProperty() @Expose() created_at!: Date;

  @ApiProperty({ type: () => WishlistProductDto })
  @Expose()
  @Type(() => WishlistProductDto)
  product!: WishlistProductDto;

  @ApiPropertyOptional({ type: () => WishlistVariantDto, nullable: true })
  @Expose()
  @Type(() => WishlistVariantDto)
  variant!: WishlistVariantDto | null;
}

export class WishlistResponseDto {
  @ApiProperty() @Expose() id!: string;

  @ApiProperty({ type: [WishlistItemResponseDto] })
  @Expose()
  @Type(() => WishlistItemResponseDto)
  items!: WishlistItemResponseDto[];

  @ApiProperty({ description: 'Sevimlilardagi mahsulotlar soni' })
  @Expose()
  total_items!: number;

  @ApiProperty() @Expose() created_at!: Date;
}
