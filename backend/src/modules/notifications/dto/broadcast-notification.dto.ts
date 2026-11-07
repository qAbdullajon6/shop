import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BroadcastNotificationDto {
  @ApiProperty({ example: 'Yangilik!' })
  @IsNotEmpty({ message: "O'zbekcha sarlavha bo'sh bo'lmasligi kerak" })
  @IsString({ message: "O'zbekcha sarlavha matn bo'lishi kerak" })
  title_uz!: string;

  @ApiProperty({ example: 'Новость!' })
  @IsNotEmpty({ message: "Ruscha sarlavha bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Ruscha sarlavha matn bo'lishi kerak" })
  title_ru!: string;

  @ApiProperty({ example: 'News!' })
  @IsNotEmpty({ message: "Inglizcha sarlavha bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Inglizcha sarlavha matn bo'lishi kerak" })
  title_en!: string;

  @ApiProperty({ example: 'Barcha foydalanuvchilarga xabar.' })
  @IsNotEmpty({ message: "O'zbekcha matn bo'sh bo'lmasligi kerak" })
  @IsString({ message: "O'zbekcha matn string bo'lishi kerak" })
  body_uz!: string;

  @ApiProperty({ example: 'Сообщение для всех пользователей.' })
  @IsNotEmpty({ message: "Ruscha matn bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Ruscha matn string bo'lishi kerak" })
  body_ru!: string;

  @ApiProperty({ example: 'Message for all users.' })
  @IsNotEmpty({ message: "Inglizcha matn bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Inglizcha matn string bo'lishi kerak" })
  body_en!: string;
}
