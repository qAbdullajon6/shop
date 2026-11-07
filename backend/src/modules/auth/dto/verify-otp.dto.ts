import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class VerifyOtpDto {
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

  @ApiProperty({
    example: '482913',
    description:
      "Tasdiqlash kodi. Uzunlik VERIFICATION_CODE_LENGTH bilan sozlanadi (standart 6).",
  })
  @IsNotEmpty({ message: "Kod bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Kod matn ko'rinishida bo'lishi kerak" })
  @Length(4, 8, { message: "Kod 4-8 ta raqamdan iborat bo'lishi kerak" })
  @Matches(/^[0-9]+$/, { message: "Kod faqat raqamlardan iborat bo'lishi kerak" })
  code!: string;
}
