import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import { PaymentMethod } from '@prisma/client';

/** Bitta qatorda ruxsat etilgan maksimal miqdor — chakana savdo uchun aqlli chegara. */
const MAX_QUANTITY_PER_ITEM = 20;
/** Bitta buyurtmadagi maksimal turli mahsulotlar soni. */
const MAX_ITEMS_PER_ORDER = 50;

export class CreateOrderItemDto {
  @ApiProperty({ example: 'clx1234abc', description: 'Mahsulot variant ID' })
  @IsNotEmpty({ message: "Variant ID bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Variant ID matn bo'lishi kerak" })
  variant_id!: string;

  @ApiProperty({
    example: 5,
    minimum: 1,
    maximum: MAX_QUANTITY_PER_ITEM,
    description:
      'Miqdor. Bir mahsulotdan bir nechta olish uchun shu maydonni oshiring — ' +
      'bir xil variantni bir necha qator qilib yubormang.',
  })
  @Type(() => Number)
  @IsInt({ message: "Miqdor butun son bo'lishi kerak" })
  @Min(1, { message: "Miqdor kamida 1 bo'lishi kerak" })
  @Max(MAX_QUANTITY_PER_ITEM, {
    message: `Bir mahsulotdan ko'pi bilan ${MAX_QUANTITY_PER_ITEM} dona olish mumkin`,
  })
  quantity!: number;
}

/** Buyurtma yaratmasdan yakuniy summani hisoblash uchun. */
export class PreviewOrderDto {
  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1, { message: "Kamida 1 ta mahsulot bo'lishi kerak" })
  @ArrayMaxSize(MAX_ITEMS_PER_ORDER)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @ApiPropertyOptional({
    example: 'COURIER',
    description: "Yetkazib berish usuli kodi (GET /delivery-options dan olinadi)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  delivery_method?: string;

  @ApiPropertyOptional({ example: 'ZAHABI10' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  coupon_code?: string;
}

export class CreateOrderDto extends PreviewOrderDto {
  @ApiPropertyOptional({ example: 'clx5678def', description: 'Yetkazib berish manzili ID' })
  @IsOptional()
  @IsString({ message: "Manzil ID matn bo'lishi kerak" })
  address_id?: string;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
    description: "To'lov usuli",
  })
  @IsEnum(PaymentMethod, { message: "To'lov usuli noto'g'ri" })
  payment_method: PaymentMethod = PaymentMethod.CASH;

  @ApiPropertyOptional({
    example: '+998901234567',
    description: "Aloqa uchun raqam. Berilmasa profildagi raqam olinadi.",
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+998[0-9]{9}$/, {
    message: "Telefon raqam +998XXXXXXXXX formatida bo'lishi kerak",
  })
  customer_phone?: string;

  @ApiPropertyOptional({ example: 'Alisher Karimov' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  customer_name?: string;

  @ApiPropertyOptional({ example: "Eshik oldiga qo'yib keting" })
  @IsOptional()
  @IsString({ message: "Izoh matn bo'lishi kerak" })
  @MaxLength(500, { message: "Izoh 500 belgidan oshmasligi kerak" })
  notes?: string;

  @ApiPropertyOptional({
    example: '9f1c2b3a-4d5e-6f70-8192-a3b4c5d6e7f8',
    description:
      "Takroriy yuborishdan himoya. Mijoz checkout boshlanganda bitta UUID " +
      "yaratadi va qayta urinishlarda AYNAN o'shani yuboradi — shunda tarmoq " +
      "uzilishi yoki ikki marta bosish ikkinchi buyurtma yaratmaydi.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  idempotency_key?: string;
}
