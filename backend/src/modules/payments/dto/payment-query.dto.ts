import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class PaymentQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'clx0987xyz', description: "Buyurtma ID bo'yicha filter" })
  @IsOptional()
  @IsString({ message: "Buyurtma ID matn bo'lishi kerak" })
  order_id?: string;

  @ApiPropertyOptional({ enum: PaymentStatus, description: "To'lov holati bo'yicha filter" })
  @IsOptional()
  @IsEnum(PaymentStatus, { message: "Noto'g'ri to'lov holati" })
  status?: PaymentStatus;

  @ApiPropertyOptional({ enum: PaymentMethod, description: "To'lov usuli bo'yicha filter" })
  @IsOptional()
  @IsEnum(PaymentMethod, { message: "Noto'g'ri to'lov usuli" })
  method?: PaymentMethod;
}
