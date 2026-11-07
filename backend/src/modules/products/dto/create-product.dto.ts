import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import {
  FragranceConcentration,
  FragranceGender,
} from '../../../../generated/prisma/client';

/** multipart/form-data da murakkab maydonlar JSON satri sifatida keladi. */
const parseJson = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const toBool = ({ value }: { value: unknown }) => {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return value;
};

export class ProductAttributeInputDto {
  @ApiProperty({ description: 'CategoryAttribute ID' })
  @IsNotEmpty({ message: "Xususiyat ID bo'sh bo'lmasligi kerak" })
  @IsString()
  attribute_id!: string;

  @ApiProperty({ example: 'Sharqona', description: 'Qiymat (doim satr sifatida)' })
  @IsNotEmpty({ message: "Qiymat bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Qiymat matn bo'lishi kerak" })
  value!: string;
}

export class CreateProductVariantDto {
  @ApiProperty({ example: 'ZP-DS-100' })
  @IsNotEmpty({ message: "SKU bo'sh bo'lmasligi kerak" })
  @IsString({ message: "SKU matn bo'lishi kerak" })
  @MaxLength(64)
  sku!: string;

  @ApiPropertyOptional({ example: '4820000000001' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  barcode?: string;

  @ApiPropertyOptional({ example: '100ml', description: 'Hajm' })
  @IsOptional()
  @IsString({ message: "Hajm matn bo'lishi kerak" })
  @MaxLength(32)
  volume?: string;

  @ApiPropertyOptional({ example: 'Oltin' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  color?: string;

  @ApiPropertyOptional({ example: '#B88A3B' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Rang kodi #RRGGBB formatida bo\'lishi kerak' })
  color_hex?: string;

  @ApiProperty({ example: 1750000, description: "Joriy sotuv narxi (so'm)" })
  @Type(() => Number)
  @IsNumber({}, { message: "Narx son bo'lishi kerak" })
  @Min(1, { message: "Narx 0 dan katta bo'lishi kerak" })
  price!: number;

  @ApiPropertyOptional({
    example: 2100000,
    description:
      "Chegirmagacha narx. Joriy narxdan KATTA bo'lishi shart — aks holda " +
      "kartochkada soxta chegirma ko'rinadi. null — chegirma yo'q.",
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  compare_at_price?: number | null;

  @ApiProperty({ example: 670000, description: 'Tan narxi — faqat admin uchun' })
  @Type(() => Number)
  @IsNumber({}, { message: "Tan narxi son bo'lishi kerak" })
  @Min(0, { message: "Tan narxi manfiy bo'lmasligi kerak" })
  cost_price!: number;

  @ApiPropertyOptional({ example: 25, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Zaxira butun son bo'lishi kerak" })
  @Min(0, { message: "Zaxira manfiy bo'lmasligi kerak" })
  stock?: number;

  @ApiPropertyOptional({ example: 3, default: 3, description: 'Zaxira ogohlantirish chegarasi' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  low_stock_threshold?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @Transform(toBool)
  @IsBoolean({ message: "is_active boolean bo'lishi kerak" })
  is_active?: boolean;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Dior Sauvage EDP' })
  @IsNotEmpty({ message: "O'zbekcha nom bo'sh bo'lmasligi kerak" })
  @IsString()
  @MaxLength(200)
  name_uz!: string;

  @ApiProperty({ example: 'Dior Sauvage EDP' })
  @IsNotEmpty({ message: "Ruscha nom bo'sh bo'lmasligi kerak" })
  @IsString()
  @MaxLength(200)
  name_ru!: string;

  @ApiProperty({ example: 'Dior Sauvage EDP' })
  @IsNotEmpty({ message: "Inglizcha nom bo'sh bo'lmasligi kerak" })
  @IsString()
  @MaxLength(200)
  name_en!: string;

  @ApiPropertyOptional({
    example: 'dior-sauvage-edp',
    description:
      "Berilmasa name_uz dan avtomatik yaratiladi (kirill va o'zbek " +
      'diakritiklari transliteratsiya qilinadi).',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: "Slug faqat kichik harf, raqam va tire bo'lishi kerak" })
  slug?: string;

  @ApiPropertyOptional({ description: 'Kartochka uchun qisqa matn (1-2 gap)' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  short_uz?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  short_ru?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  short_en?: string;

  @ApiPropertyOptional({ example: "Yovvoyi va erkin. Bergamot, qalampir va ambroksan." })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description_uz?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description_ru?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description_en?: string;

  @ApiProperty({ example: 'clx1234abc', description: 'Kategoriya ID' })
  @IsNotEmpty({ message: "Kategoriya ID bo'sh bo'lmasligi kerak" })
  @IsString()
  category_id!: string;

  @ApiPropertyOptional({ example: 'clx5678def', description: 'Brend ID' })
  @IsOptional()
  @IsString()
  brand_id?: string;

  // ── Parfyumeriya metama'lumotlari ──

  @ApiPropertyOptional({ enum: FragranceGender, default: FragranceGender.NOT_APPLICABLE })
  @IsOptional()
  @IsEnum(FragranceGender)
  gender?: FragranceGender;

  @ApiPropertyOptional({
    enum: FragranceConcentration,
    default: FragranceConcentration.NOT_APPLICABLE,
  })
  @IsOptional()
  @IsEnum(FragranceConcentration)
  concentration?: FragranceConcentration;

  @ApiPropertyOptional({
    type: [String],
    example: ['Bergamot', 'Qalampir'],
    description: 'Yuqori notalar (multipart uchun JSON satri)',
  })
  @IsOptional()
  @Transform(parseJson)
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(12)
  top_notes?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Lavanda', 'Muskat'] })
  @IsOptional()
  @Transform(parseJson)
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(12)
  heart_notes?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Ambroksan', 'Sadr'] })
  @IsOptional()
  @Transform(parseJson)
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(12)
  base_notes?: string[];

  @ApiPropertyOptional({ example: 4, minimum: 1, maximum: 5, description: 'Hid davomiyligi' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  longevity?: number;

  @ApiPropertyOptional({ example: 4, minimum: 1, maximum: 5, description: 'Hid shlefi' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  sillage?: number;

  @ApiPropertyOptional({ example: 'Fransiya' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  country?: string;

  @ApiPropertyOptional({ example: 2015 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  release_year?: number;

  // ── Xususiyatlar ──

  @ApiPropertyOptional({
    example: '[{"attribute_id":"abc123","value":"Sharqona"}]',
    description: 'JSON array (multipart uchun satr sifatida)',
  })
  @IsOptional()
  @Transform(parseJson)
  @IsArray({ message: "attributes massiv bo'lishi kerak" })
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeInputDto)
  attributes?: ProductAttributeInputDto[];

  // ── Merchandising ──

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  is_bestseller?: boolean;

  @ApiPropertyOptional({ default: true, description: 'Yangi kelganlar blokida chiqsinmi' })
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  is_new_arrival?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  is_featured?: boolean;

  // ── Variantlar ──

  @ApiProperty({
    example:
      '[{"sku":"ZP-DS-60","volume":"60ml","price":1150000,"cost_price":440000,"stock":30}]',
    description: 'JSON array (multipart uchun satr sifatida). Birinchisi standart variant.',
  })
  @Transform(parseJson)
  @IsArray({ message: "Variantlar massiv bo'lishi kerak" })
  @ArrayMinSize(1, { message: "Kamida bitta variant bo'lishi kerak" })
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants!: CreateProductVariantDto[];
}
