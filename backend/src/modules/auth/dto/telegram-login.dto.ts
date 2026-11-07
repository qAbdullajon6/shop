import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches, MaxLength } from 'class-validator';

export class TelegramLoginDto {
  @ApiProperty({
    description:
      "Telegram WebApp bergan XOM initData satri (window.Telegram.WebApp.initData). " +
      "Server uni HMAC-SHA256 bilan tekshiradi — initDataUnsafe YUBORILMAYDI.",
    example: 'query_id=AAH...&user=%7B%22id%22%3A123%7D&auth_date=1700000000&hash=abc...',
  })
  @IsNotEmpty({ message: "initData bo'sh bo'lmasligi kerak" })
  @IsString()
  @MaxLength(4096, { message: 'initData juda uzun' })
  init_data!: string;
}

export class TelegramLinkDto {
  @ApiProperty({ example: '+998901234567' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+998[0-9]{9}$/, {
    message: "Telefon raqam +998XXXXXXXXX formatida bo'lishi kerak",
  })
  phone_number!: string;

  @ApiProperty({ example: '482913', description: 'Tasdiqlash kodi' })
  @IsNotEmpty()
  @IsString()
  @Length(4, 8)
  @Matches(/^[0-9]+$/, { message: "Kod faqat raqamlardan iborat bo'lishi kerak" })
  code!: string;
}

export class SendLinkCodeDto {
  @ApiProperty({ example: '+998901234567' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+998[0-9]{9}$/, {
    message: "Telefon raqam +998XXXXXXXXX formatida bo'lishi kerak",
  })
  phone_number!: string;
}
