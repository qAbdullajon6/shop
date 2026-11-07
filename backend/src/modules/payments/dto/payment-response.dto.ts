import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

function decimalToString({ value }: { value: { toString(): string } | null | undefined }): string | null {
  if (value === null || value === undefined) return null;
  return value.toString();
}

// ─── Nested DTOs ─────────────────────────────────────────────────────────────

export class PaymentOrderUserDto {
  @ApiProperty({ example: 'clx1234abc' })
  @Expose()
  id!: string;

  @ApiProperty({ example: '+998901234567' })
  @Expose()
  phone_number!: string;

  @ApiPropertyOptional({ example: 'Nodir', nullable: true })
  @Expose()
  name!: string | null;

  @ApiPropertyOptional({ example: 'Isoqov', nullable: true })
  @Expose()
  last_name!: string | null;
}

export class PaymentOrderDto {
  @ApiProperty({ example: 'clx1234abc' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'ORD-0001' })
  @Expose()
  order_number!: string;

  @ApiProperty({ example: '250000.00', description: "Buyurtma jami summasi" })
  @Expose()
  @Type(() => String)
  @Transform(decimalToString)
  total_amount!: string;

  @ApiProperty({ example: '10000.00', description: "Chegirma summasi" })
  @Expose()
  @Type(() => String)
  @Transform(decimalToString)
  discount_amount!: string;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.UNPAID })
  @Expose()
  payment_status!: PaymentStatus;

  @ApiProperty({ type: PaymentOrderUserDto })
  @Expose()
  @Type(() => PaymentOrderUserDto)
  user!: PaymentOrderUserDto;
}

// ─── Main Response ────────────────────────────────────────────────────────────

export class PaymentResponseDto {
  @ApiProperty({ example: 'clx1234abc' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'clx0987xyz', description: "Buyurtma ID" })
  @Expose()
  order_id!: string;

  @ApiProperty({ type: PaymentOrderDto })
  @Expose()
  @Type(() => PaymentOrderDto)
  order!: PaymentOrderDto;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CARD })
  @Expose()
  method!: PaymentMethod;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PAID })
  @Expose()
  status!: PaymentStatus;

  @ApiProperty({ example: '150000.00', description: "To'lov miqdori (Decimal string)" })
  @Expose()
  @Type(() => String)
  @Transform(decimalToString)
  amount!: string;

  @ApiPropertyOptional({ example: 'TXN-12345', nullable: true, description: "Tranzaksiya ID" })
  @Expose()
  transaction_id!: string | null;

  @ApiPropertyOptional({ example: 'Naqd to\'lov qabul qilindi', nullable: true, description: "Izoh" })
  @Expose()
  notes!: string | null;

  @ApiProperty()
  @Expose()
  created_at!: Date;

  @ApiProperty()
  @Expose()
  updated_at!: Date;
}

// ─── Paginated ────────────────────────────────────────────────────────────────

export class PaginatedPaymentsResponseDto {
  @ApiProperty({ type: [PaymentResponseDto] }) data!: PaymentResponseDto[];
  @ApiProperty({ example: 100 }) total!: number;
  @ApiProperty({ example: 1 }) page!: number;
  @ApiProperty({ example: 20 }) limit!: number;
  @ApiProperty({ example: 5 }) total_pages!: number;
}
