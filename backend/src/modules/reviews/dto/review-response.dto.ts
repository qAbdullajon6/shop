import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ReviewStatus } from '../../../../generated/prisma/client';

export class ReviewUserDto {
  @ApiProperty() @Expose() id!: string;
  @ApiPropertyOptional({ nullable: true }) @Expose() name!: string | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() last_name!: string | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() avatar!: string | null;
}

export class ReviewProductDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() name_uz!: string;
  @ApiProperty() @Expose() slug!: string;
}

export class ReviewOrderItemDto {
  @ApiPropertyOptional({ nullable: true, description: "Sotib olingan hajm" })
  @Expose()
  variant_volume!: string | null;

  @ApiProperty() @Expose() variant_sku!: string;
}

export class ReviewResponseDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() product_id!: string;
  @ApiProperty({ example: 5 }) @Expose() rating!: number;

  @ApiPropertyOptional({ nullable: true }) @Expose() title!: string | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() comment!: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'Hid davomiyligi (1-5)' })
  @Expose()
  rating_longevity!: number | null;

  @ApiPropertyOptional({ nullable: true, description: 'Sifat (1-5)' })
  @Expose()
  rating_quality!: number | null;

  @ApiPropertyOptional({ nullable: true, description: 'Qadoqlash (1-5)' })
  @Expose()
  rating_packaging!: number | null;

  @ApiPropertyOptional({ nullable: true, description: 'Narx-sifat (1-5)' })
  @Expose()
  rating_value!: number | null;

  @ApiProperty({
    description:
      "Tasdiqlangan xarid belgisi — sharh yetkazib berilgan buyurtmaga bog'langan",
  })
  @Expose()
  is_verified!: boolean;

  @ApiProperty({ enum: ReviewStatus }) @Expose() status!: ReviewStatus;
  @ApiProperty({ example: 12 }) @Expose() helpful_count!: number;

  @ApiProperty() @Expose() created_at!: Date;
  @ApiProperty() @Expose() updated_at!: Date;

  @ApiProperty({ type: ReviewUserDto })
  @Expose()
  @Type(() => ReviewUserDto)
  user!: ReviewUserDto;

  @ApiPropertyOptional({ type: ReviewOrderItemDto, nullable: true })
  @Expose()
  @Type(() => ReviewOrderItemDto)
  order_item!: ReviewOrderItemDto | null;

  @ApiPropertyOptional({
    type: ReviewProductDto,
    nullable: true,
    description: 'Faqat admin ro\'yxatida to\'ldiriladi',
  })
  @Expose()
  @Type(() => ReviewProductDto)
  product?: ReviewProductDto;
}

export class PaginatedReviewsResponseDto {
  @ApiProperty({ type: [ReviewResponseDto] }) data!: ReviewResponseDto[];
  @ApiProperty({ example: 42 }) total!: number;
  @ApiProperty({ example: 1 }) page!: number;
  @ApiProperty({ example: 10 }) limit!: number;
  @ApiProperty({ example: 5 }) total_pages!: number;
}

export class RatingDistributionDto {
  @ApiProperty({ example: 28 }) five!: number;
  @ApiProperty({ example: 9 }) four!: number;
  @ApiProperty({ example: 3 }) three!: number;
  @ApiProperty({ example: 1 }) two!: number;
  @ApiProperty({ example: 0 }) one!: number;
}

/** Mahsulot sahifasidagi baho bloki uchun — faqat TASDIQLANGAN sharhlardan. */
export class ProductRatingSummaryDto {
  @ApiProperty({ example: 4.6 }) average!: number;
  @ApiProperty({ example: 41 }) total!: number;

  @ApiProperty({ type: RatingDistributionDto })
  distribution!: RatingDistributionDto;

  @ApiPropertyOptional({ example: 4.4, nullable: true }) longevity!: number | null;
  @ApiPropertyOptional({ example: 4.8, nullable: true }) quality!: number | null;
  @ApiPropertyOptional({ example: 4.5, nullable: true }) packaging!: number | null;
  @ApiPropertyOptional({ example: 4.1, nullable: true }) value!: number | null;
}

/**
 * Mijoz baho bera oladigan xarid.
 * Profil sahifasidagi "Mahsulotni baholashni xohlaysizmi?" taklifi manbasi.
 */
export class PendingReviewDto {
  @ApiProperty({ description: 'Sharh yaratishda yuboriladigan ID' })
  order_item_id!: string;

  @ApiProperty() product_id!: string;
  @ApiProperty({ example: 'Dior Sauvage EDP' }) product_name!: string;
  @ApiProperty({ example: 'dior-sauvage-edp' }) product_slug!: string;

  @ApiPropertyOptional({ example: '100ml', nullable: true })
  variant_volume!: string | null;

  @ApiPropertyOptional({ nullable: true }) image_url!: string | null;

  @ApiProperty() order_id!: string;
  @ApiProperty({ example: 'ZP-260828-0007' }) order_number!: string;
  @ApiPropertyOptional({ nullable: true }) delivered_at!: Date | null;
}

export class ReviewVoteResponseDto {
  @ApiProperty({ example: 13 }) helpful_count!: number;
}
