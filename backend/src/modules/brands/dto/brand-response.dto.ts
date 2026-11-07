import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class BrandResponseDto {
  @ApiProperty({ example: 'clx1234abc' }) @Expose() id!: string;
  @ApiProperty({ example: 'ASUS' }) @Expose() name!: string;
  @ApiProperty({ example: 'asus' }) @Expose() slug!: string;

  @ApiPropertyOptional({
    example: 'uploads/brand-logos/uuid.jpg',
    nullable: true,
    description: 'Logo URL (serverdan olish uchun: /uploads/brand-logos/...)',
  })
  @Expose()
  logo!: string | null;

  @ApiPropertyOptional({ example: "Dunyo bo'ylab mashhur kompyuter brendi", nullable: true })
  @Expose()
  description_uz!: string | null;

  @ApiPropertyOptional({ example: 'Всемирно известный производитель компьютеров', nullable: true })
  @Expose()
  description_ru!: string | null;

  @ApiPropertyOptional({ example: 'World-renowned computer brand', nullable: true })
  @Expose()
  description_en!: string | null;

  @ApiProperty({ example: true }) @Expose() is_active!: boolean;
  @ApiProperty() @Expose() created_at!: Date;
  @ApiProperty() @Expose() updated_at!: Date;
}
