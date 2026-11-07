import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class CartItemProductDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() name_uz!: string;
  @ApiProperty() @Expose() name_ru!: string;
  @ApiProperty() @Expose() name_en!: string;
  @ApiProperty() @Expose() slug!: string;

  @ApiPropertyOptional({ nullable: true, description: 'Asosiy rasm' })
  @Expose()
  image_url!: string | null;
}

export class CartItemVariantDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() sku!: string;
  @ApiPropertyOptional({ nullable: true, example: '100ml' }) @Expose() volume!: string | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() color!: string | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() color_hex!: string | null;

  @ApiProperty({ example: '1750000.00' }) @Expose() price!: string;

  @ApiPropertyOptional({ example: '2100000.00', nullable: true })
  @Expose()
  compare_at_price!: string | null;

  @ApiPropertyOptional({ example: 17, nullable: true })
  @Expose()
  discount_percent!: number | null;

  @ApiProperty() @Expose() stock!: number;

  @ApiProperty({ type: () => CartItemProductDto })
  @Expose()
  @Type(() => CartItemProductDto)
  product!: CartItemProductDto;
}

export class CartItemResponseDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() variant_id!: string;
  @ApiProperty() @Expose() quantity!: number;

  @ApiProperty({ example: '3500000.00', description: 'price × quantity' })
  @Expose()
  line_total!: string;

  @ApiProperty({
    description:
      "Zaxira yetarlimi. false bo'lsa mijoz checkout'ga o'tishdan oldin " +
      "miqdorni kamaytirishi kerak.",
  })
  @Expose()
  is_available!: boolean;

  @ApiProperty({ example: 3, description: 'Hozirda mavjud zaxira' })
  @Expose()
  available_stock!: number;

  @ApiProperty() @Expose() created_at!: Date;

  @ApiProperty({ type: () => CartItemVariantDto })
  @Expose()
  @Type(() => CartItemVariantDto)
  variant!: CartItemVariantDto;
}

export class CartResponseDto {
  @ApiProperty() @Expose() id!: string;

  @ApiPropertyOptional({
    nullable: true,
    description:
      "Mehmon savati identifikatori. Mijoz uni saqlab qo'yadi va keyingi " +
      "so'rovlarda X-Cart-Token sarlavhasida yuboradi.",
  })
  @Expose()
  session_token!: string | null;

  @ApiProperty({ type: [CartItemResponseDto] })
  @Expose()
  @Type(() => CartItemResponseDto)
  items!: CartItemResponseDto[];

  @ApiProperty({ description: "Miqdorlar yig'indisi" })
  @Expose()
  total_items!: number;

  @ApiProperty({ example: '3500000.00', description: 'Mavjud mahsulotlar jami' })
  @Expose()
  total_price!: string;

  @ApiProperty({ example: '450000.00', description: 'Chegirmalar hisobiga tejalgan summa' })
  @Expose()
  total_savings!: string;

  @ApiProperty({ description: "Savatda zaxirasi yetmaydigan mahsulot bormi" })
  @Expose()
  has_unavailable_items!: boolean;

  @ApiProperty() @Expose() created_at!: Date;
  @ApiProperty() @Expose() updated_at!: Date;
}
