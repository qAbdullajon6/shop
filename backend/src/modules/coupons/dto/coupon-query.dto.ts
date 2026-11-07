import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { DiscountType } from '../../../../generated/prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CouponQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: true, description: "Faollik holati bo'yicha filter" })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: "is_active boolean bo'lishi kerak" })
  is_active?: boolean;

  @ApiPropertyOptional({ enum: DiscountType, description: "Chegirma turi bo'yicha filter" })
  @IsOptional()
  @IsEnum(DiscountType, { message: "Chegirma turi noto'g'ri" })
  discount_type?: DiscountType;

  @ApiPropertyOptional({ example: 'SUMMER', description: "Kod bo'yicha qidiruv" })
  @IsOptional()
  @IsString({ message: "Qidiruv matni matn bo'lishi kerak" })
  search?: string;
}
