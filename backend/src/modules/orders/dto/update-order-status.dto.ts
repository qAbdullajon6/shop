import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { OrderStatus, PaymentStatus } from '../../../../generated/prisma/client';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
    description:
      "Faqat ruxsat etilgan o'tishlar qabul qilinadi (order-state-machine.ts). " +
      "Masalan CANCELLED yakuniy holat — undan chiqib bo'lmaydi.",
  })
  @IsNotEmpty({ message: "Status bo'sh bo'lmasligi kerak" })
  @IsEnum(OrderStatus, { message: "Noto'g'ri buyurtma holati" })
  status!: OrderStatus;

  @ApiPropertyOptional({
    example: "Mijoz bilan bog'lanildi, tasdiqlandi",
    description: 'Holat tarixiga yoziladigan izoh',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class CancelOrderDto {
  @ApiPropertyOptional({ example: "Fikrimdan qaytdim" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class UpdatePaymentStatusDto {
  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PAID })
  @IsNotEmpty({ message: "To'lov holati bo'sh bo'lmasligi kerak" })
  @IsEnum(PaymentStatus, { message: "Noto'g'ri to'lov holati" })
  payment_status!: PaymentStatus;

  @ApiPropertyOptional({ example: 'Naqd pul qabul qilindi' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
