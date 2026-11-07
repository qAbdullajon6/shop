import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { AttributeType } from '../../../../generated/prisma/client';

export class UpdateCategoryAttributeDto {
  @ApiPropertyOptional({ example: 'Operativ xotira' })
  @IsOptional()
  @IsString({ message: "O'zbekcha nom matn bo'lishi kerak" })
  @MaxLength(100)
  name_uz?: string;

  @ApiPropertyOptional({ example: 'Оперативная память' })
  @IsOptional()
  @IsString({ message: "Ruscha nom matn bo'lishi kerak" })
  @MaxLength(100)
  name_ru?: string;

  @ApiPropertyOptional({ example: 'RAM' })
  @IsOptional()
  @IsString({ message: "Inglizcha nom matn bo'lishi kerak" })
  @MaxLength(100)
  name_en?: string;

  @ApiPropertyOptional({ example: 'ram' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9_-]+$/, { message: "Slug faqat kichik harf, raqam, _ va - bo'lishi kerak" })
  @MaxLength(60)
  slug?: string;

  @ApiPropertyOptional({ enum: AttributeType })
  @IsOptional()
  @IsEnum(AttributeType, { message: "Noto'g'ri tur" })
  type?: AttributeType;

  @ApiPropertyOptional({ example: 'GB' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean({ message: "is_required boolean bo'lishi kerak" })
  is_required?: boolean;

  @ApiPropertyOptional({ type: [String], example: ['8GB', '16GB', '32GB'] })
  @IsOptional()
  @IsArray({ message: "options massiv bo'lishi kerak" })
  @IsString({ each: true, message: "Har bir variant matn bo'lishi kerak" })
  options?: string[];

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber({}, { message: "Tartib raqami son bo'lishi kerak" })
  @Min(0)
  sort_order?: number;
}
