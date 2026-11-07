import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ example: 'clx1234abc', description: 'Xabar yuborila yotgan foydalanuvchi ID' })
  @IsNotEmpty({ message: "Foydalanuvchi ID bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Foydalanuvchi ID matn bo'lishi kerak" })
  user_id!: string;

  @ApiProperty({ example: 'Buyurtma tasdiqlandi' })
  @IsNotEmpty({ message: "O'zbekcha sarlavha bo'sh bo'lmasligi kerak" })
  @IsString({ message: "O'zbekcha sarlavha matn bo'lishi kerak" })
  title_uz!: string;

  @ApiProperty({ example: 'Заказ подтверждён' })
  @IsNotEmpty({ message: "Ruscha sarlavha bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Ruscha sarlavha matn bo'lishi kerak" })
  title_ru!: string;

  @ApiProperty({ example: 'Order confirmed' })
  @IsNotEmpty({ message: "Inglizcha sarlavha bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Inglizcha sarlavha matn bo'lishi kerak" })
  title_en!: string;

  @ApiProperty({ example: 'Sizning #1234 raqamli buyurtmangiz tasdiqlandi.' })
  @IsNotEmpty({ message: "O'zbekcha matn bo'sh bo'lmasligi kerak" })
  @IsString({ message: "O'zbekcha matn string bo'lishi kerak" })
  body_uz!: string;

  @ApiProperty({ example: 'Ваш заказ №1234 подтверждён.' })
  @IsNotEmpty({ message: "Ruscha matn bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Ruscha matn string bo'lishi kerak" })
  body_ru!: string;

  @ApiProperty({ example: 'Your order #1234 has been confirmed.' })
  @IsNotEmpty({ message: "Inglizcha matn bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Inglizcha matn string bo'lishi kerak" })
  body_en!: string;
}
