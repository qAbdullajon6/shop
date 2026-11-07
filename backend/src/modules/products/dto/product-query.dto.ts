import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import {
  FragranceConcentration,
  FragranceGender,
} from '../../../../generated/prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum ProductSortBy {
  NAME = 'name',
  PRICE = 'price',
  CREATED_AT = 'created_at',
  VIEW_COUNT = 'view_count',
  RATING = 'rating',
  BEST_SELLER = 'best_seller',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

const toBool = ({ value }: { value: unknown }) => {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return value;
};

const toStringArray = ({ value }: { value: unknown }): string[] | undefined => {
  if (typeof value !== 'string' || value.trim() === '') return undefined;
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
};

export class ProductQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Qidiruv (nom, brend)', example: 'Sauvage' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ description: 'Kategoriya slug', example: 'erkaklar-atiri' })
  @IsOptional()
  @IsString()
  category_slug?: string;

  @ApiPropertyOptional({
    description: "Bir nechta kategoriya (vergul bilan)",
    example: 'shamlar,xona-aromalari',
  })
  @IsOptional()
  @Transform(toStringArray)
  category_slugs?: string[];

  @ApiPropertyOptional({ description: 'Brend slug', example: 'dior' })
  @IsOptional()
  @IsString()
  brand_slug?: string;

  @ApiPropertyOptional({ description: 'Bir nechta brend (vergul bilan)' })
  @IsOptional()
  @Transform(toStringArray)
  brand_slugs?: string[];

  @ApiPropertyOptional({ enum: FragranceGender, description: 'Kimga mo\'ljallangan' })
  @IsOptional()
  @IsEnum(FragranceGender)
  gender?: FragranceGender;

  @ApiPropertyOptional({ enum: FragranceConcentration, description: 'Konsentratsiya' })
  @IsOptional()
  @IsEnum(FragranceConcentration)
  concentration?: FragranceConcentration;

  @ApiPropertyOptional({
    description: 'Hid notalari bo\'yicha qidiruv (vergul bilan)',
    example: 'vanil,sandal',
  })
  @IsOptional()
  @Transform(toStringArray)
  notes?: string[];

  @ApiPropertyOptional({ description: "Minimal narx (so'm)", example: 500000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_price?: number;

  @ApiPropertyOptional({ description: "Maksimal narx (so'm)", example: 5000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_price?: number;

  @ApiPropertyOptional({ description: "Tag ID'lar (vergul bilan)" })
  @IsOptional()
  @Transform(toStringArray)
  tag_ids?: string[];

  @ApiPropertyOptional({ description: 'Hajm (vergul bilan)', example: '50ml,100ml' })
  @IsOptional()
  @Transform(toStringArray)
  volumes?: string[];

  @ApiPropertyOptional({
    description: "Xususiyatlar filtri — JSON: {\"slug\":\"qiymat\"}",
    example: '{"tur":"Sharqona"}',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  attributes?: string;

  @ApiPropertyOptional({ description: 'Yaratilgan sana — boshlanish (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  date_from?: string;

  @ApiPropertyOptional({ description: 'Yaratilgan sana — tugash (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  date_to?: string;

  @ApiPropertyOptional({ description: "Minimal o'rtacha reyting (0–5)", example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  min_rating?: number;

  @ApiPropertyOptional({ description: 'Minimal sharhlar soni', example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  min_review_count?: number;

  @ApiPropertyOptional({
    enum: ProductSortBy,
    default: ProductSortBy.CREATED_AT,
    description:
      "price — min_price ustuni bo'yicha (ishlaydi, ilgari jimgina created_at ga " +
      "tushib qolardi); best_seller — yetkazilgan buyurtmalardagi sold_count bo'yicha; " +
      'rating — faqat tasdiqlangan sharhlardan hisoblangan rating_avg bo\'yicha.',
  })
  @IsOptional()
  @IsEnum(ProductSortBy)
  sort_by?: ProductSortBy = ProductSortBy.CREATED_AT;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sort_order?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({ description: 'Faqat bestsellerlar' })
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  is_bestseller?: boolean;

  @ApiPropertyOptional({ description: 'Faqat yangi kelganlar' })
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  is_new_arrival?: boolean;

  @ApiPropertyOptional({ description: 'Faqat tanlangan (featured) mahsulotlar' })
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  is_featured?: boolean;

  @ApiPropertyOptional({ description: 'Faqat chegirmadagi mahsulotlar' })
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  on_sale?: boolean;

  @ApiPropertyOptional({ description: 'Faqat zaxirada bor mahsulotlar' })
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  in_stock?: boolean;

  @ApiPropertyOptional({
    description: "Admin: nofaol mahsulotlarni ham ko'rsatish (faqat admin marshrutida hisobga olinadi)",
  })
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  include_inactive?: boolean;
}
