import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class CategoryParentDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty({ example: 'Elektronika' }) @Expose() name_uz!: string;
  @ApiProperty({ example: 'Электроника' }) @Expose() name_ru!: string;
  @ApiProperty({ example: 'Electronics' }) @Expose() name_en!: string;
  @ApiProperty() @Expose() slug!: string;
}

export class CategoryResponseDto {
  @ApiProperty({ example: 'clx1234abc' }) @Expose() id!: string;
  @ApiProperty({ example: 'Laptoplar' }) @Expose() name_uz!: string;
  @ApiProperty({ example: 'Ноутбуки' }) @Expose() name_ru!: string;
  @ApiProperty({ example: 'Laptops' }) @Expose() name_en!: string;
  @ApiProperty({ example: 'laptoplar' }) @Expose() slug!: string;
  @ApiPropertyOptional({ nullable: true }) @Expose() description_uz!: string | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() description_ru!: string | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() description_en!: string | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() image_uz!: string | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() image_ru!: string | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() image_en!: string | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() parent_id!: string | null;
  @ApiProperty({ example: true }) @Expose() is_active!: boolean;
  @ApiProperty({ example: 0 }) @Expose() sort_order!: number;
  @ApiProperty() @Expose() created_at!: Date;
  @ApiProperty() @Expose() updated_at!: Date;

  @ApiPropertyOptional({ type: () => CategoryParentDto, nullable: true })
  @Expose()
  @Type(() => CategoryParentDto)
  parent?: CategoryParentDto | null;

  @ApiPropertyOptional({ type: () => [CategoryResponseDto] })
  @Expose()
  @Type(() => CategoryResponseDto)
  children?: CategoryResponseDto[];
}
