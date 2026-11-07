import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({
    example: '+998901234567',
    description: "O'zbekiston mobil telefon raqami (+998XXXXXXXXX)",
  })
  @IsNotEmpty({ message: "Telefon raqam bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Telefon raqam matn ko'rinishida bo'lishi kerak" })
  @Matches(/^\+998[0-9]{9}$/, {
    message: "Telefon raqam +998XXXXXXXXX formatida bo'lishi kerak",
  })
  phone_number!: string;
}
