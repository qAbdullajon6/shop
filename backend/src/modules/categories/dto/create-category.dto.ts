import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Laptoplar', description: "O'zbek tilidagi nom" })
  @IsNotEmpty({ message: "O'zbekcha nom bo'sh bo'lmasligi kerak" })
  @IsString({ message: "O'zbekcha nom matn bo'lishi kerak" })
  name_uz!: string;

  @ApiProperty({ example: 'Ноутбуки', description: 'Ruscha nom' })
  @IsNotEmpty({ message: "Ruscha nom bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Ruscha nom matn bo'lishi kerak" })
  name_ru!: string;

  @ApiProperty({ example: 'Laptops', description: 'Inglizcha nom' })
  @IsNotEmpty({ message: "Inglizcha nom bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Inglizcha nom matn bo'lishi kerak" })
  name_en!: string;

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

  @ApiPropertyOptional({ example: "Barcha turdagi laptoplar", description: "O'zbek tilidagi tavsif" })
  @IsOptional()
  @IsString({ message: "O'zbekcha tavsif matn bo'lishi kerak" })
  description_uz?: string;

  @ApiPropertyOptional({ example: 'Все виды ноутбуков', description: 'Ruscha tavsif' })
  @IsOptional()
  @IsString({ message: "Ruscha tavsif matn bo'lishi kerak" })
  description_ru?: string;

  @ApiPropertyOptional({ example: 'All kinds of laptops', description: 'Inglizcha tavsif' })
  @IsOptional()
  @IsString({ message: "Inglizcha tavsif matn bo'lishi kerak" })
  description_en?: string;

  @ApiPropertyOptional({ example: 'clx1234abc', description: 'Ota-kategoriya ID' })
  @IsOptional()
  @IsString({ message: "Ota-kategoriya ID matn bo'lishi kerak" })
  parent_id?: string;

  @ApiPropertyOptional({ example: 0, default: 0, description: 'Saralash tartibi' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Tartib raqam butun son bo'lishi kerak" })
  @Min(0, { message: "Tartib raqam 0 dan kichik bo'lmasligi kerak" })
  sort_order?: number;

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
