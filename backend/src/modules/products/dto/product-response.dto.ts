import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  FragranceConcentration,
  FragranceGender,
} from '@prisma/client';

export class ProductImageResponseDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() url!: string;
  @ApiPropertyOptional({ nullable: true }) @Expose() alt!: string | null;
  @ApiProperty() @Expose() is_primary!: boolean;
  @ApiProperty() @Expose() sort_order!: number;

  @ApiPropertyOptional({
    nullable: true,
    description: "To'ldirilgan bo'lsa — rasm shu variantga xos",
  })
  @Expose()
  variant_id?: string | null;
}

/** `cost_price` ataylab yo'q — bu ichki ma'lumot, mijozga chiqmaydi. */
export class ProductVariantResponseDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() sku!: string;

  @ApiPropertyOptional({ nullable: true, example: '100ml' })
  @Expose()
  volume!: string | null;

  @ApiPropertyOptional({ nullable: true }) @Expose() color!: string | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() color_hex!: string | null;

  @ApiProperty({ example: '1750000.00', description: "Joriy sotuv narxi" })
  @Expose()
  price!: string;

  @ApiPropertyOptional({
    example: '2100000.00',
    nullable: true,
    description: 'Chegirmagacha bo\'lgan narx. null — chegirma yo\'q.',
  })
  @Expose()
  compare_at_price!: string | null;

  @ApiPropertyOptional({
    example: 17,
    nullable: true,
    description: 'Chegirma foizi — SERVERDA hisoblanadi.',
  })
  @Expose()
  discount_percent!: number | null;

  @ApiProperty() @Expose() stock!: number;
  @ApiProperty() @Expose() in_stock!: boolean;
  @ApiProperty({ description: 'Kartochkada ko\'rsatiladigan asosiy variant' })
  @Expose()
  is_default!: boolean;
  @ApiProperty() @Expose() is_active!: boolean;
}

export class ProductCategoryDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty({ example: 'Erkaklar atiri' }) @Expose() name_uz!: string;
  @ApiProperty({ example: 'Духи для мужчин' }) @Expose() name_ru!: string;
  @ApiProperty({ example: "Men's Fragrances" }) @Expose() name_en!: string;
  @ApiProperty() @Expose() slug!: string;
}

export class ProductBrandDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() name!: string;
  @ApiProperty() @Expose() slug!: string;
  @ApiPropertyOptional({ nullable: true }) @Expose() logo!: string | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() description_uz?: string | null;
}

export class ProductTagDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() name!: string;
  @ApiProperty() @Expose() slug!: string;
}

export class ProductAttributeValueDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() attribute_id!: string;
  @ApiProperty() @Expose() name_uz!: string;
  @ApiProperty() @Expose() name_ru!: string;
  @ApiProperty() @Expose() name_en!: string;
  @ApiProperty() @Expose() slug!: string;
  @ApiProperty({ enum: ['TEXT', 'NUMBER', 'BOOLEAN', 'SELECT', 'MULTI_SELECT'] })
  @Expose()
  type!: string;
  @ApiPropertyOptional({ nullable: true }) @Expose() unit!: string | null;
  @ApiProperty() @Expose() value!: string;
}

export class ProductResponseDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty({ example: 'Dior Sauvage EDP' }) @Expose() name_uz!: string;
  @ApiProperty() @Expose() name_ru!: string;
  @ApiProperty() @Expose() name_en!: string;
  @ApiProperty() @Expose() slug!: string;

  @ApiPropertyOptional({ nullable: true, description: 'Kartochka uchun qisqa matn' })
  @Expose()
  short_uz!: string | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() short_ru!: string | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() short_en!: string | null;

  @ApiPropertyOptional({ nullable: true }) @Expose() description_uz!: string | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() description_ru!: string | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() description_en!: string | null;

  // ── Parfyumeriya ma'lumotlari ──
  @ApiProperty({ enum: FragranceGender }) @Expose() gender!: FragranceGender;
  @ApiProperty({ enum: FragranceConcentration })
  @Expose()
  concentration!: FragranceConcentration;

  @ApiProperty({ type: [String], example: ['Bergamot', 'Qalampir'] })
  @Expose()
  top_notes!: string[];

  @ApiProperty({ type: [String], example: ['Lavanda', 'Muskat'] })
  @Expose()
  heart_notes!: string[];

  @ApiProperty({ type: [String], example: ['Ambroksan', 'Sadr'] })
  @Expose()
  base_notes!: string[];

  @ApiPropertyOptional({ nullable: true, example: 4, description: 'Hid davomiyligi (1-5)' })
  @Expose()
  longevity!: number | null;

  @ApiPropertyOptional({ nullable: true, example: 4, description: 'Hid shlefi (1-5)' })
  @Expose()
  sillage!: number | null;

  @ApiPropertyOptional({ nullable: true, example: 'Fransiya' }) @Expose() country!: string | null;
  @ApiPropertyOptional({ nullable: true, example: 2015 }) @Expose() release_year!: number | null;

  // ── Merchandising ──
  @ApiProperty() @Expose() is_active!: boolean;
  @ApiProperty() @Expose() is_bestseller!: boolean;
  @ApiProperty() @Expose() is_new_arrival!: boolean;
  @ApiProperty() @Expose() is_featured!: boolean;

  // ── Narx va zaxira xulosasi ──
  @ApiPropertyOptional({ example: '1150000.00', nullable: true, description: 'Eng arzon variant narxi' })
  @Expose()
  min_price!: string | null;

  @ApiPropertyOptional({ example: '2650000.00', nullable: true })
  @Expose()
  max_price!: string | null;

  @ApiProperty({ example: 63, description: 'Barcha faol variantlar zaxirasi' })
  @Expose()
  total_stock!: number;

  @ApiProperty() @Expose() in_stock!: boolean;

  @ApiPropertyOptional({
    nullable: true,
    example: 17,
    description: 'Standart variantdagi chegirma foizi',
  })
  @Expose()
  discount_percent!: number | null;

  @ApiPropertyOptional({ nullable: true, description: 'Savatga qo\'shish uchun standart variant' })
  @Expose()
  default_variant_id!: string | null;

  // ── Ijtimoiy dalil ──
  @ApiProperty({
    example: 4.6,
    description: "O'rtacha baho — FAQAT tasdiqlangan sharhlardan",
  })
  @Expose()
  rating_avg!: number;

  @ApiProperty({ example: 41, description: 'Tasdiqlangan sharhlar soni' })
  @Expose()
  rating_count!: number;

  @ApiProperty({ example: 128, description: 'Yetkazib berilgan buyurtmalarda sotilgan dona' })
  @Expose()
  sold_count!: number;

  @ApiProperty() @Expose() view_count!: number;

  // ── Bog'lanishlar ──
  @ApiProperty({ type: () => ProductCategoryDto })
  @Expose()
  @Type(() => ProductCategoryDto)
  category!: ProductCategoryDto;

  @ApiPropertyOptional({ type: () => ProductBrandDto, nullable: true })
  @Expose()
  @Type(() => ProductBrandDto)
  brand!: ProductBrandDto | null;

  @ApiProperty({ type: [ProductImageResponseDto], description: 'Mahsulot galereyasi' })
  @Expose()
  @Type(() => ProductImageResponseDto)
  images!: ProductImageResponseDto[];

  @ApiProperty({ type: [ProductVariantResponseDto] })
  @Expose()
  @Type(() => ProductVariantResponseDto)
  variants!: ProductVariantResponseDto[];

  @ApiProperty({ type: [ProductTagDto] })
  @Expose()
  @Type(() => ProductTagDto)
  tags!: ProductTagDto[];

  @ApiProperty({ type: [ProductAttributeValueDto] })
  @Expose()
  @Type(() => ProductAttributeValueDto)
  attributes!: ProductAttributeValueDto[];

  @ApiProperty() @Expose() created_at!: Date;
  @ApiProperty() @Expose() updated_at!: Date;
}

export class ProductListResponseDto {
  @ApiProperty({ type: [ProductResponseDto] }) data!: ProductResponseDto[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() total_pages!: number;
}

export class ProductFacetBrandDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiProperty({ example: 12 }) count!: number;
}

export class ProductFacetCategoryDto {
  @ApiProperty() id!: string;
  @ApiProperty() slug!: string;
  @ApiProperty() name_uz!: string;
  @ApiProperty() name_ru!: string;
  @ApiProperty() name_en!: string;
  @ApiProperty({ example: 12 }) count!: number;
}

/** Katalog filtr panelini to'ldirish uchun mavjud qiymatlar. */
export class ProductFacetsDto {
  @ApiProperty({ example: 45000 }) min_price!: number;
  @ApiProperty({ example: 4200000 }) max_price!: number;
  @ApiProperty({ example: 155 }) total!: number;
  @ApiProperty({ type: [String], example: ['30ml', '50ml', '100ml'] }) volumes!: string[];
  @ApiProperty({ type: [ProductFacetBrandDto] }) brands!: ProductFacetBrandDto[];
  @ApiProperty({ type: [ProductFacetCategoryDto] }) categories!: ProductFacetCategoryDto[];
}
