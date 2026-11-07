import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateBrandDto {
  @ApiPropertyOptional({ example: 'MSI', description: 'Yangi brand nomi' })
  @IsOptional()
  @IsString({ message: "Brand nomi matn bo'lishi kerak" })
  @MaxLength(100, { message: "Brand nomi 100 ta belgidan oshmasligi kerak" })
  name?: string;

  @ApiPropertyOptional({ example: 'msi', description: 'Yangi slug' })
  @IsOptional()
  @IsString({ message: "Slug matn bo'lishi kerak" })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug faqat kichik harf, raqam va '-' dan iborat bo'lishi kerak",
  })
  @MaxLength(120, { message: "Slug 120 ta belgidan oshmasligi kerak" })
  slug?: string;

  @ApiPropertyOptional({ example: "Yangilangan tavsif (o'zbek tilida)" })
  @IsOptional()
  @IsString({ message: "O'zbekcha tavsif matn bo'lishi kerak" })
  description_uz?: string;

  @ApiPropertyOptional({ example: 'Обновлённое описание (русский)' })
  @IsOptional()
  @IsString({ message: "Ruscha tavsif matn bo'lishi kerak" })
  description_ru?: string;

  @ApiPropertyOptional({ example: 'Updated description (English)' })
  @IsOptional()
  @IsString({ message: "Inglizcha tavsif matn bo'lishi kerak" })
  description_en?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: "is_active boolean bo'lishi kerak" })
  is_active?: boolean;
}
