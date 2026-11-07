import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Ali' })
  @IsOptional()
  @IsString({ message: "Ism matn bo'lishi kerak" })
  @MaxLength(100, { message: "Ism 100 ta belgidan oshmasligi kerak" })
  name?: string;

  @ApiPropertyOptional({ example: 'Valiyev' })
  @IsOptional()
  @IsString({ message: "Familiya matn bo'lishi kerak" })
  @MaxLength(100, { message: "Familiya 100 ta belgidan oshmasligi kerak" })
  last_name?: string;

  @ApiPropertyOptional({ example: 'ali@example.com' })
  @IsOptional()
  @IsEmail({}, { message: "Email noto'g'ri formatda" })
  email?: string;
}
