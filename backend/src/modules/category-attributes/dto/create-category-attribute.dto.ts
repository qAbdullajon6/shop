import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { AttributeType } from '../../../../generated/prisma/client';

export class CreateCategoryAttributeDto {
  @ApiProperty({ description: 'Kategoriya ID' })
  @IsNotEmpty({ message: "Kategoriya ID bo'sh bo'lmasligi kerak" })
  @IsString()
  category_id!: string;

  @ApiProperty({ example: 'Operativ xotira' })
  @IsNotEmpty({ message: "O'zbekcha nom bo'sh bo'lmasligi kerak" })
  @IsString({ message: "O'zbekcha nom matn bo'lishi kerak" })
  @MaxLength(100)
  name_uz!: string;

  @ApiProperty({ example: 'Оперативная память' })
  @IsNotEmpty({ message: "Ruscha nom bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Ruscha nom matn bo'lishi kerak" })
  @MaxLength(100)
  name_ru!: string;

  @ApiProperty({ example: 'RAM' })
  @IsNotEmpty({ message: "Inglizcha nom bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Inglizcha nom matn bo'lishi kerak" })
  @MaxLength(100)
  name_en!: string;

  @ApiProperty({ example: 'ram', description: 'Filter uchun ishlatiladi (kichik harf, chiziqcha)' })
  @IsNotEmpty({ message: "Slug bo'sh bo'lmasligi kerak" })
  @IsString()
  @Matches(/^[a-z0-9_-]+$/, { message: "Slug faqat kichik harf, raqam, _ va - bo'lishi kerak" })
  @MaxLength(60)
  slug!: string;

  @ApiProperty({ enum: AttributeType, example: AttributeType.TEXT })
  @IsEnum(AttributeType, { message: "Noto'g'ri tur" })
  type!: AttributeType;

  @ApiPropertyOptional({ example: 'GB', description: "O'lchov birligi (NUMBER uchun)" })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean({ message: "is_required boolean bo'lishi kerak" })
  is_required?: boolean;

  @ApiPropertyOptional({
    type: [String],
    example: ['8GB', '16GB', '32GB'],
    description: 'SELECT va MULTI_SELECT uchun ruxsat etilgan qiymatlar',
  })
  @IsOptional()
  @IsArray({ message: "options massiv bo'lishi kerak" })
  @IsString({ each: true, message: "Har bir variant matn bo'lishi kerak" })
  options?: string[];

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsNumber({}, { message: "Tartib raqami son bo'lishi kerak" })
  @Min(0)
  sort_order?: number;
}
