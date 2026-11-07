import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { PaymentMethod } from '../../../../generated/prisma/client';

export class CreatePaymentDto {
  @ApiProperty({ example: 'clx0987xyz', description: "Buyurtma ID" })
  @IsNotEmpty({ message: "Buyurtma ID bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Buyurtma ID matn bo'lishi kerak" })
  order_id!: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CARD, description: "To'lov usuli" })
  @IsEnum(PaymentMethod, { message: "Noto'g'ri to'lov usuli" })
  method!: PaymentMethod;

  @ApiProperty({ example: 150000, description: "To'lov miqdori (minimal 0.01)" })
  @Type(() => Number)
  @IsNumber({}, { message: "To'lov miqdori son bo'lishi kerak" })
  @IsPositive({ message: "To'lov miqdori musbat bo'lishi kerak" })
  @Min(0.01, { message: "To'lov miqdori 0.01 dan kichik bo'lmasligi kerak" })
  amount!: number;

  @ApiPropertyOptional({ example: 'TXN-12345', description: "Tranzaksiya ID (ixtiyoriy)" })
  @IsOptional()
  @IsString({ message: "Tranzaksiya ID matn bo'lishi kerak" })
  transaction_id?: string;

  @ApiPropertyOptional({ example: "Naqd to'lov qabul qilindi", description: "Izoh (ixtiyoriy)" })
  @IsOptional()
  @IsString({ message: "Izoh matn bo'lishi kerak" })
  notes?: string;
}
