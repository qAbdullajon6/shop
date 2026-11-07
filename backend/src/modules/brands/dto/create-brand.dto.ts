import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ example: 'ASUS', description: 'Brand nomi (unikal, tarjima kerak emas)' })
  @IsNotEmpty({ message: "Brand nomi bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Brand nomi matn bo'lishi kerak" })
  @MaxLength(100, { message: "Brand nomi 100 ta belgidan oshmasligi kerak" })
  name!: string;

  @ApiPropertyOptional({
    example: 'asus',
    description: "Slug — ko'rsatilmasa avtomatik generatsiya qilinadi",
  })
  @IsOptional()
  @IsString({ message: "Slug matn bo'lishi kerak" })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug faqat kichik harf, raqam va '-' dan iborat bo'lishi kerak",
  })
  @MaxLength(120, { message: "Slug 120 ta belgidan oshmasligi kerak" })
  slug?: string;

  @ApiPropertyOptional({ example: "Dunyo bo'ylab mashhur kompyuter brendi", description: "O'zbek tilidagi tavsif" })
  @IsOptional()
  @IsString({ message: "O'zbekcha tavsif matn bo'lishi kerak" })
  description_uz?: string;

  @ApiPropertyOptional({ example: 'Всемирно известный производитель компьютеров', description: 'Ruscha tavsif' })
  @IsOptional()
  @IsString({ message: "Ruscha tavsif matn bo'lishi kerak" })
  description_ru?: string;

  @ApiPropertyOptional({ example: 'World-renowned computer brand', description: 'Inglizcha tavsif' })
  @IsOptional()
  @IsString({ message: "Inglizcha tavsif matn bo'lishi kerak" })
  description_en?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: "is_active boolean bo'lishi kerak" })
  is_active?: boolean;
}
