import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Laptoplar', description: "O'zbek tilidagi nom" })
  @IsOptional()
  @IsString({ message: "O'zbekcha nom matn bo'lishi kerak" })
  name_uz?: string;

  @ApiPropertyOptional({ example: 'Ноутбуки', description: 'Ruscha nom' })
  @IsOptional()
  @IsString({ message: "Ruscha nom matn bo'lishi kerak" })
  name_ru?: string;

  @ApiPropertyOptional({ example: 'Laptops', description: 'Inglizcha nom' })
  @IsOptional()
  @IsString({ message: "Inglizcha nom matn bo'lishi kerak" })
  name_en?: string;

  @ApiPropertyOptional({
    example: 'laptoplar',
    description: 'Avtomatik generatsiya qilinadi name_uz asosida (ixtiyoriy)',
  })
  @IsOptional()
  @IsString({ message: "Slug matn bo'lishi kerak" })
  @Matches(/^[a-z0-9-]+$/, {
    message: "Slug faqat kichik harf, raqam va tire bo'lishi kerak",
  })
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

  @ApiPropertyOptional({ example: 'clx1234abc', description: 'Ota-kategoriya ID' })
  @IsOptional()
  @IsString({ message: "Ota-kategoriya ID matn bo'lishi kerak" })
  parent_id?: string;

  @ApiPropertyOptional({ example: 0, description: 'Saralash tartibi' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Tartib raqam butun son bo'lishi kerak" })
  @Min(0, { message: "Tartib raqam 0 dan kichik bo'lmasligi kerak" })
  sort_order?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: "is_active boolean bo'lishi kerak" })
  is_active?: boolean;
}
