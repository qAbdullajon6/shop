import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum ReviewSort {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  RATING_HIGH = 'rating_high',
  RATING_LOW = 'rating_low',
  HELPFUL = 'helpful',
}

const toBool = ({ value }: { value: unknown }) =>
  value === true || value === 'true' || value === '1';

export class ReviewQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'clx1234abc', description: 'Mahsulot ID' })
  @IsNotEmpty({ message: 'product_id majburiy' })
  @IsString()
  product_id!: string;

  @ApiPropertyOptional({ enum: ReviewSort, default: ReviewSort.NEWEST })
  @IsOptional()
  @IsEnum(ReviewSort)
  sort?: ReviewSort = ReviewSort.NEWEST;

  @ApiPropertyOptional({ example: 5, description: 'Faqat shu yulduzli sharhlar' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ description: 'Faqat tasdiqlangan xarid sharhlari' })
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  only_verified?: boolean;

  @ApiPropertyOptional({ description: 'Faqat matnli sharhlar' })
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  with_comment?: boolean;
}
