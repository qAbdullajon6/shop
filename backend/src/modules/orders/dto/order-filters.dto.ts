import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  OrderSource,
  OrderStatus,
  PaymentStatus,
} from '../../../../generated/prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class OrderFiltersDto extends PaginationDto {
  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus, { message: "Noto'g'ri buyurtma holati" })
  status?: OrderStatus;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus, { message: "Noto'g'ri to'lov holati" })
  payment_status?: PaymentStatus;

  @ApiPropertyOptional({ enum: OrderSource, description: 'Buyurtma kanali' })
  @IsOptional()
  @IsEnum(OrderSource, { message: "Noto'g'ri buyurtma manbasi" })
  source?: OrderSource;

  @ApiPropertyOptional({ example: 'clx1234abc', description: 'Foydalanuvchi ID' })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiPropertyOptional({
    example: 'ZP-260828',
    description: 'Buyurtma raqami, mijoz ismi yoki telefon raqami bo\'yicha qidiruv',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ example: '2026-01-01', description: 'Boshlanish sanasi (ISO 8601)' })
  @IsOptional()
  @IsDateString({}, { message: "Sana to'g'ri formatda bo'lishi kerak (ISO 8601)" })
  from?: string;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'Tugash sanasi (ISO 8601)' })
  @IsOptional()
  @IsDateString({}, { message: "Sana to'g'ri formatda bo'lishi kerak (ISO 8601)" })
  to?: string;
}

export class UserOrderFiltersDto extends PaginationDto {
  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus, { message: "Noto'g'ri buyurtma holati" })
  status?: OrderStatus;
}
