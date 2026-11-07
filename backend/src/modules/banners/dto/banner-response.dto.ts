import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class BannerResponseDto {
  @ApiProperty({ example: 'clx1234abc' })
  @Expose()
  id!: string;

  @ApiPropertyOptional({ example: 'Yozgi chegirmalar', nullable: true })
  @Expose()
  title_uz!: string | null;

  @ApiPropertyOptional({ example: 'Летние скидки', nullable: true })
  @Expose()
  title_ru!: string | null;

  @ApiPropertyOptional({ example: 'Summer Sale', nullable: true })
  @Expose()
  title_en!: string | null;

  @ApiPropertyOptional({ example: "Eng yaxshi narxlar", nullable: true })
  @Expose()
  subtitle_uz!: string | null;

  @ApiPropertyOptional({ example: 'Лучшие цены', nullable: true })
  @Expose()
  subtitle_ru!: string | null;

  @ApiPropertyOptional({ example: 'Best prices', nullable: true })
  @Expose()
  subtitle_en!: string | null;

  @ApiPropertyOptional({ example: 'uploads/banners/uuid.jpg', nullable: true, description: "O'zbek tilidagi rasm" })
  @Expose()
  image_uz!: string | null;

  @ApiPropertyOptional({ example: 'uploads/banners/uuid.jpg', nullable: true, description: 'Rus tilidagi rasm' })
  @Expose()
  image_ru!: string | null;

  @ApiPropertyOptional({ example: 'uploads/banners/uuid.jpg', nullable: true, description: 'Ingliz tilidagi rasm' })
  @Expose()
  image_en!: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/sale', nullable: true })
  @Expose()
  link!: string | null;

  @ApiProperty({ example: 0 })
  @Expose()
  sort_order!: number;

  @ApiProperty({ example: true })
  @Expose()
  is_active!: boolean;

  @ApiProperty()
  @Expose()
  created_at!: Date;

  @ApiProperty()
  @Expose()
  updated_at!: Date;
}
