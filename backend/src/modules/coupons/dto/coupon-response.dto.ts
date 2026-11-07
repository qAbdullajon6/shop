import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { DiscountType } from '../../../../generated/prisma/client';

function decimalToString({
  value,
}: {
  value: { toString(): string } | null | undefined;
}): string | null {
  if (value === null || value === undefined) return null;
  return value.toString();
}

export class CouponResponseDto {
  @ApiProperty({ example: 'clx1234abc' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'SUMMER20' })
  @Expose()
  code!: string;

  @ApiProperty({ enum: DiscountType, example: DiscountType.PERCENTAGE })
  @Expose()
  discount_type!: DiscountType;

  @ApiProperty({ example: '20.00', description: "Chegirma miqdori (Decimal string)" })
  @Expose()
  @Type(() => String)
  @Transform(decimalToString)
  discount_value!: string;

  @ApiPropertyOptional({ example: '50000.00', nullable: true, description: "Minimal buyurtma summasi" })
  @Expose()
  @Type(() => String)
  @Transform(decimalToString)
  min_order_amount!: string | null;

  @ApiPropertyOptional({ example: '30000.00', nullable: true, description: "Maksimal chegirma summasi (PERCENTAGE uchun)" })
  @Expose()
  @Type(() => String)
  @Transform(decimalToString)
  max_discount!: string | null;

  @ApiPropertyOptional({ example: 100, nullable: true, description: "Maksimal foydalanish soni" })
  @Expose()
  max_uses!: number | null;

  @ApiProperty({ example: 0, description: "Foydalanilgan marta" })
  @Expose()
  used_count!: number;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59.000Z', nullable: true, description: "Amal qilish muddati" })
  @Expose()
  expires_at!: Date | null;

  @ApiProperty({ example: true })
  @Expose()
  is_active!: boolean;

  @ApiProperty()
  @Expose()
  created_at!: Date;

  @ApiProperty()
  @Expose()
  updated_at!: Date;
}
