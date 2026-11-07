import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class UpdateCouponDto {
  @ApiPropertyOptional({ example: 'WINTER30', description: "Kupon kodi — katta harf, raqam, _ yoki - (3–30 belgi)" })
  @IsOptional()
  @IsString({ message: "Kupon kodi matn bo'lishi kerak" })
  @Matches(/^[A-Z0-9_-]{3,30}$/, {
    message: "Kupon kodi faqat katta harf, raqam, _ yoki - dan iborat bo'lishi va 3–30 belgidan iborat bo'lishi kerak",
  })
  code?: string;

  @ApiPropertyOptional({ enum: DiscountType, example: DiscountType.FIXED })
  @IsOptional()
  @IsEnum(DiscountType, { message: "Chegirma turi noto'g'ri" })
  discount_type?: DiscountType;

  @ApiPropertyOptional({ example: 30, description: "Chegirma miqdori" })
  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: "Chegirma miqdori musbat bo'lishi kerak" })
  discount_value?: number;

  @ApiPropertyOptional({ example: 50000, description: "Minimal buyurtma summasi" })
  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: "Minimal buyurtma summasi musbat bo'lishi kerak" })
  min_order_amount?: number;

  @ApiPropertyOptional({ example: 30000, description: "Maksimal chegirma summasi — PERCENTAGE turi uchun" })
  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: "Maksimal chegirma summasi musbat bo'lishi kerak" })
  max_discount?: number;

  @ApiPropertyOptional({ example: 200, description: "Maksimal foydalanish soni" })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Maksimal foydalanish soni butun son bo'lishi kerak" })
  @Min(1, { message: "Maksimal foydalanish soni 1 dan kichik bo'lmasligi kerak" })
  max_uses?: number;

  @ApiPropertyOptional({ example: '2025-06-30T23:59:59.000Z', description: "Amal qilish muddati" })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: "Amal qilish muddati to'g'ri sana bo'lishi kerak" })
  expires_at?: Date;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: "is_active boolean bo'lishi kerak" })
  is_active?: boolean;
}
