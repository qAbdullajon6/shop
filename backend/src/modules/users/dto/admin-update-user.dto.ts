import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Role } from '@prisma/client';

export class AdminUpdateUserDto {
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

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean({ message: "is_active boolean bo'lishi kerak" })
  is_active?: boolean;

  @ApiPropertyOptional({ enum: Role, example: Role.USER })
  @IsOptional()
  @IsEnum(Role, { message: "Role noto'g'ri" })
  role?: Role;
}
