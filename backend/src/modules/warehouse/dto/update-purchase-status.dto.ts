import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PurchaseStatus } from '../../../../generated/prisma/client';

export class UpdatePurchaseStatusDto {
  @ApiProperty({
    enum: PurchaseStatus,
    example: PurchaseStatus.RECEIVED,
    description: "Yangi holat — faqat RECEIVED yoki CANCELLED qabul qilinadi",
  })
  @IsEnum(PurchaseStatus, { message: "Holat noto'g'ri qiymat" })
  status!: PurchaseStatus;
}
