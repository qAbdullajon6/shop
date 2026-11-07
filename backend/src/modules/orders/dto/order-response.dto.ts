import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import {
  OrderSource,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../../../generated/prisma/client';

function decimalToString({
  value,
}: {
  value: { toString(): string } | null | undefined;
}): string | null {
  if (value === null || value === undefined) return null;
  return value.toString();
}

// ─── Nested DTOs ─────────────────────────────────────────────────────────────

export class OrderUserDto {
  @ApiProperty() @Expose() id!: string;
  @ApiPropertyOptional({ nullable: true }) @Expose() name!: string | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() last_name!: string | null;
  @ApiProperty() @Expose() phone_number!: string;
}

export class OrderAddressDto {
  @ApiProperty() @Expose() id!: string;
  @ApiPropertyOptional({ nullable: true }) @Expose() title!: string | null;
  @ApiProperty() @Expose() city!: string;
  @ApiPropertyOptional({ nullable: true }) @Expose() district!: string | null;
  @ApiProperty() @Expose() street!: string;

  @ApiPropertyOptional({ example: '41.2995000', nullable: true })
  @Expose()
  @Type(() => String)
  @Transform(decimalToString)
  lat!: string | null;

  @ApiPropertyOptional({ example: '69.2401000', nullable: true })
  @Expose()
  @Type(() => String)
  @Transform(decimalToString)
  lon!: string | null;
}

export class OrderDeliveryOptionDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty({ example: 'COURIER' }) @Expose() code!: string;
  @ApiProperty() @Expose() name_uz!: string;
  @ApiProperty({ example: 1 }) @Expose() min_days!: number;
  @ApiProperty({ example: 2 }) @Expose() max_days!: number;
}

export class OrderItemReviewDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty({ example: 5 }) @Expose() rating!: number;
}

/**
 * Buyurtma qatori — barcha mahsulot ma'lumotlari SOTUV VAQTIDAGI snapshot.
 * Mahsulot keyin qayta nomlangan, narxi o'zgargan yoki o'chirilgan bo'lsa ham
 * hisob-faktura o'zgarmaydi.
 */
export class OrderItemResponseDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() quantity!: number;

  @ApiPropertyOptional({ nullable: true, description: 'Joriy variant (o\'chirilgan bo\'lishi mumkin)' })
  @Expose()
  variant_id!: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  product_id!: string | null;

  @ApiProperty({ example: 'Dior Sauvage EDP' }) @Expose() product_name!: string;
  @ApiProperty({ example: 'dior-sauvage-edp' }) @Expose() product_slug!: string;
  @ApiProperty({ example: 'DS-100' }) @Expose() variant_sku!: string;

  @ApiPropertyOptional({ example: '100ml', nullable: true })
  @Expose()
  variant_volume!: string | null;

  @ApiPropertyOptional({ nullable: true }) @Expose() image_url!: string | null;

  @ApiProperty({ description: 'Birlik narxi (sotuv vaqtidagi snapshot)' })
  @Expose()
  @Type(() => String)
  @Transform(decimalToString)
  unit_price!: string;

  @ApiProperty({ description: 'Qator jami: unit_price × quantity' })
  @Expose()
  @Type(() => String)
  @Transform(decimalToString)
  line_total!: string;

  @ApiPropertyOptional({
    type: OrderItemReviewDto,
    nullable: true,
    description:
      'Shu xaridga yozilgan sharh. null bo\'lsa va buyurtma DELIVERED bo\'lsa — ' +
      'mijoz baho berishi mumkin.',
  })
  @Expose()
  @Type(() => OrderItemReviewDto)
  review!: OrderItemReviewDto | null;
}

export class OrderCouponDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() code!: string;
}

export class OrderCouponUseDto {
  @ApiProperty() @Expose() id!: string;

  @ApiProperty()
  @Expose()
  @Type(() => String)
  @Transform(decimalToString)
  discount!: string;

  @ApiProperty({ type: OrderCouponDto })
  @Expose()
  @Type(() => OrderCouponDto)
  coupon!: OrderCouponDto;
}

export class OrderStatusEventDto {
  @ApiProperty() @Expose() id!: string;
  @ApiPropertyOptional({ enum: OrderStatus, nullable: true })
  @Expose()
  from_status!: OrderStatus | null;
  @ApiProperty({ enum: OrderStatus }) @Expose() to_status!: OrderStatus;
  @ApiPropertyOptional({ nullable: true }) @Expose() note!: string | null;
  @ApiProperty() @Expose() created_at!: Date;
}

// ─── Main Response ───────────────────────────────────────────────────────────

export class OrderResponseDto {
  @ApiProperty() @Expose() id!: string;

  @ApiProperty({ example: 'ZP-260828-0007', description: "Mijoz aytadigan raqam" })
  @Expose()
  order_number!: string;

  @ApiProperty({ enum: OrderStatus }) @Expose() status!: OrderStatus;
  @ApiProperty({ enum: PaymentStatus }) @Expose() payment_status!: PaymentStatus;
  @ApiProperty({ enum: PaymentMethod }) @Expose() payment_method!: PaymentMethod;
  @ApiProperty({ enum: OrderSource }) @Expose() source!: OrderSource;

  // ── Mijoz snapshot'i ──
  @ApiPropertyOptional({ nullable: true }) @Expose() customer_name!: string | null;
  @ApiProperty() @Expose() customer_phone!: string;

  // ── Manzil snapshot'i ──
  @ApiPropertyOptional({ nullable: true }) @Expose() ship_city!: string | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() ship_district!: string | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() ship_street!: string | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() ship_zip!: string | null;

  @ApiPropertyOptional({ nullable: true }) @Expose() delivery_name!: string | null;

  // ── Summalar (barchasi serverda hisoblangan) ──
  @ApiProperty({ description: 'Mahsulotlar jami (chegirmasiz)' })
  @Expose()
  @Type(() => String)
  @Transform(decimalToString)
  subtotal_amount!: string;

  @ApiProperty()
  @Expose()
  @Type(() => String)
  @Transform(decimalToString)
  discount_amount!: string;

  @ApiProperty()
  @Expose()
  @Type(() => String)
  @Transform(decimalToString)
  shipping_fee!: string;

  @ApiProperty({ description: 'To\'lanadigan yakuniy summa' })
  @Expose()
  @Type(() => String)
  @Transform(decimalToString)
  total_amount!: string;

  @ApiPropertyOptional({ nullable: true }) @Expose() notes!: string | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() cancel_reason!: string | null;

  @ApiPropertyOptional({ nullable: true }) @Expose() confirmed_at!: Date | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() delivered_at!: Date | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() cancelled_at!: Date | null;

  @ApiProperty() @Expose() created_at!: Date;
  @ApiProperty() @Expose() updated_at!: Date;

  @ApiProperty({ type: OrderUserDto })
  @Expose()
  @Type(() => OrderUserDto)
  user!: OrderUserDto;

  @ApiPropertyOptional({ type: OrderAddressDto, nullable: true })
  @Expose()
  @Type(() => OrderAddressDto)
  address!: OrderAddressDto | null;

  @ApiPropertyOptional({ type: OrderDeliveryOptionDto, nullable: true })
  @Expose()
  @Type(() => OrderDeliveryOptionDto)
  delivery_option!: OrderDeliveryOptionDto | null;

  @ApiProperty({ type: [OrderItemResponseDto] })
  @Expose()
  @Type(() => OrderItemResponseDto)
  items!: OrderItemResponseDto[];

  @ApiPropertyOptional({ type: OrderCouponUseDto, nullable: true })
  @Expose()
  @Type(() => OrderCouponUseDto)
  coupon_use!: OrderCouponUseDto | null;

  @ApiProperty({ type: [OrderStatusEventDto], description: 'Holat o\'zgarishlari tarixi' })
  @Expose()
  @Type(() => OrderStatusEventDto)
  status_events!: OrderStatusEventDto[];
}

// ─── Checkout preview ────────────────────────────────────────────────────────

export class OrderPreviewItemDto {
  @ApiProperty() variant_id!: string;
  @ApiProperty() product_name!: string;
  @ApiProperty() product_slug!: string;
  @ApiPropertyOptional({ nullable: true }) variant_volume!: string | null;
  @ApiPropertyOptional({ nullable: true }) image_url!: string | null;
  @ApiProperty() quantity!: number;
  @ApiProperty() unit_price!: string;
  @ApiProperty() line_total!: string;
}

/**
 * Checkout sahifasi ko'rsatadigan summalar. Mijoz tasdiqlaganda AYNAN
 * shu qiymatlar bilan buyurtma yaratiladi — frontend hech narsani
 * qayta hisoblamaydi.
 */
export class OrderPreviewResponseDto {
  @ApiProperty({ type: [OrderPreviewItemDto] }) items!: OrderPreviewItemDto[];
  @ApiProperty() subtotal_amount!: string;
  @ApiProperty() discount_amount!: string;
  @ApiProperty() shipping_fee!: string;
  @ApiProperty() total_amount!: string;
  @ApiPropertyOptional({ nullable: true }) coupon_code!: string | null;
  @ApiPropertyOptional({ nullable: true }) delivery_name!: string | null;
}

// ─── Paginated ───────────────────────────────────────────────────────────────

export class PaginatedOrdersResponseDto {
  @ApiProperty({ type: [OrderResponseDto] }) data!: OrderResponseDto[];
  @ApiProperty({ example: 100 }) total!: number;
  @ApiProperty({ example: 1 }) page!: number;
  @ApiProperty({ example: 20 }) limit!: number;
  @ApiProperty({ example: 5 }) total_pages!: number;
}
