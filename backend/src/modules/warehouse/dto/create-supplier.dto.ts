import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({ example: 'Mega Optom', maxLength: 200 })
  @IsNotEmpty({ message: "Ta'minotchi nomi bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Ta'minotchi nomi matn bo'lishi kerak" })
  @MaxLength(200, { message: "Ta'minotchi nomi 200 ta belgidan oshmasligi kerak" })
  name!: string;

  @ApiPropertyOptional({ example: '+998901234567', maxLength: 20 })
  @IsOptional()
  @IsString({ message: "Telefon raqam matn bo'lishi kerak" })
  @MaxLength(20, { message: 'Telefon raqam 20 ta belgidan oshmasligi kerak' })
  phone?: string;

  @ApiPropertyOptional({ example: 'supplier@example.com' })
  @IsOptional()
  @IsEmail({}, { message: "Email manzil noto'g'ri formatda" })
  email?: string;

  @ApiPropertyOptional({ example: 'Toshkent, Chilonzor tumani' })
  @IsOptional()
  @IsString({ message: "Manzil matn bo'lishi kerak" })
  address?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean({ message: "is_active boolean bo'lishi kerak" })
  is_active?: boolean;
}
