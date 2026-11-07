import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class NotificationResponseDto {
  @ApiProperty({ example: 'clx1234abc' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'clx1234abc' })
  @Expose()
  user_id!: string;

  @ApiProperty({ example: 'Buyurtma tasdiqlandi' })
  @Expose()
  title_uz!: string;

  @ApiProperty({ example: 'Заказ подтверждён' })
  @Expose()
  title_ru!: string;

  @ApiProperty({ example: 'Order confirmed' })
  @Expose()
  title_en!: string;

  @ApiProperty({ example: 'Sizning #1234 raqamli buyurtmangiz tasdiqlandi.' })
  @Expose()
  body_uz!: string;

  @ApiProperty({ example: 'Ваш заказ №1234 подтверждён.' })
  @Expose()
  body_ru!: string;

  @ApiProperty({ example: 'Your order #1234 has been confirmed.' })
  @Expose()
  body_en!: string;

  @ApiProperty({ example: false })
  @Expose()
  is_read!: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @Expose()
  created_at!: Date;
}

export class PaginatedNotificationsResponseDto {
  @ApiProperty({ type: [NotificationResponseDto] }) data!: NotificationResponseDto[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() total_pages!: number;
  @ApiProperty({ description: "O'qilmagan bildirishnomalar soni" }) unread_count!: number;
}
