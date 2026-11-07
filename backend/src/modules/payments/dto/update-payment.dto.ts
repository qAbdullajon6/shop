import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentStatus } from '../../../../generated/prisma/client';

export class UpdatePaymentDto {
  @ApiPropertyOptional({ enum: PaymentStatus, example: PaymentStatus.PAID, description: "To'lov holati" })
  @IsOptional()
  @IsEnum(PaymentStatus, { message: "Noto'g'ri to'lov holati" })
  status?: PaymentStatus;

  @ApiPropertyOptional({ example: 'TXN-12345', description: "Tranzaksiya ID" })
  @IsOptional()
  @IsString({ message: "Tranzaksiya ID matn bo'lishi kerak" })
  transaction_id?: string;

  @ApiPropertyOptional({ example: "To'lov tasdiqlandi", description: "Izoh" })
  @IsOptional()
  @IsString({ message: "Izoh matn bo'lishi kerak" })
  notes?: string;
}
