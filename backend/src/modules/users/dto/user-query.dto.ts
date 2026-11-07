import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Role } from '@prisma/client';

export class UserQueryDto {
  @ApiPropertyOptional({ example: 'Ali', description: "Ism, familiya, telefon yoki email bo'yicha qidiruv" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: Role, description: "Role bo'yicha filter" })
  @IsOptional()
  @IsEnum(Role, { message: "Role noto'g'ri" })
  role?: Role;

  @ApiPropertyOptional({ example: true, description: "Faol/nofaol bo'yicha filter" })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: "is_active true yoki false bo'lishi kerak" })
  is_active?: boolean;

  @ApiPropertyOptional({ example: 1, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
