import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { VerificationChannel } from '../../../../generated/prisma/client';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class TokensDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @Expose()
  access_token!: string;

  @ApiPropertyOptional({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description:
      'Web clientlar uchun token cookie sifatida yuboriladi (rt, httpOnly). ' +
      'Bu maydon faqat orqaga moslashish uchun saqlanadi.',
  })
  @Expose()
  refresh_token?: string;
}

export class AuthResponseDto {
  @ApiProperty({ type: UserResponseDto })
  @Expose()
  @Type(() => UserResponseDto)
  user!: UserResponseDto;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @Expose()
  access_token!: string;

  @ApiPropertyOptional({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description:
      'Web clientlar uchun token cookie sifatida yuboriladi (rt, httpOnly). ' +
      'Bu maydon faqat orqaga moslashish uchun saqlanadi.',
  })
  @Expose()
  refresh_token?: string;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Muvaffaqiyatli bajarildi' })
  @Expose()
  message!: string;
}

export class SendCodeResponseDto {
  @ApiProperty({ example: 'Tasdiqlash kodi Telegram orqali yuborildi' })
  @Expose()
  message!: string;

  @ApiProperty({ enum: VerificationChannel, example: VerificationChannel.TELEGRAM })
  @Expose()
  channel!: VerificationChannel;

  @ApiProperty({ example: 300, description: 'Kod amal qilish muddati (soniya)' })
  @Expose()
  expires_in_seconds!: number;

  @ApiPropertyOptional({
    example: '482913',
    description:
      'FAQAT development rejimida qaytariladi. Ishlab chiqarishda bu maydon hech qachon bo\'lmaydi.',
  })
  @Expose()
  debug_code?: string;
}
