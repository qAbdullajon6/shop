import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { DiscountType } from '@prisma/client';

export class CreateCouponDto {
  @ApiProperty({ example: 'SUMMER20', description: "Kupon kodi — katta harf, raqam, _ yoki - (3–30 belgi)" })
  @IsString({ message: "Kupon kodi matn bo'lishi kerak" })
  @Matches(/^[A-Z0-9_-]{3,30}$/, {
    message: "Kupon kodi faqat katta harf, raqam, _ yoki - dan iborat bo'lishi va 3–30 belgidan iborat bo'lishi kerak",
  })
  code!: string;

  @ApiProperty({ enum: DiscountType, example: DiscountType.PERCENTAGE })
  @IsEnum(DiscountType, { message: "Chegirma turi noto'g'ri" })
  discount_type!: DiscountType;

  @ApiProperty({ example: 20, description: "Chegirma miqdori" })
  @Type(() => Number)
  @IsPositive({ message: "Chegirma miqdori musbat bo'lishi kerak" })
  discount_value!: number;

  @ApiPropertyOptional({ example: 50000, description: "Minimal buyurtma summasi (ixtiyoriy)" })
  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: "Minimal buyurtma summasi musbat bo'lishi kerak" })
  min_order_amount?: number;

  @ApiPropertyOptional({ example: 30000, description: "Maksimal chegirma summasi — PERCENTAGE turi uchun (ixtiyoriy)" })
  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: "Maksimal chegirma summasi musbat bo'lishi kerak" })
  max_discount?: number;

  @ApiPropertyOptional({ example: 100, description: "Maksimal foydalanish soni (ixtiyoriy)" })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Maksimal foydalanish soni butun son bo'lishi kerak" })
  @Min(1, { message: "Maksimal foydalanish soni 1 dan kichik bo'lmasligi kerak" })
  max_uses?: number;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59.000Z', description: "Amal qilish muddati (ixtiyoriy)" })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: "Amal qilish muddati to'g'ri sana bo'lishi kerak" })
  expires_at?: Date;

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
