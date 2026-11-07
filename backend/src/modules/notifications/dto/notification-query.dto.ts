import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class NotificationQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Sahifa raqam butun son bo'lishi kerak" })
  @Min(1, { message: "Sahifa raqam 1 dan kichik bo'lmasligi kerak" })
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Limit butun son bo'lishi kerak" })
  @Min(1, { message: "Limit 1 dan kichik bo'lmasligi kerak" })
  @Max(50, { message: "Limit 50 dan katta bo'lmasligi kerak" })
  limit?: number = 10;

  @ApiPropertyOptional({ example: false, description: "true — o'qilganlar, false — o'qilmaganlar, bo'sh — hammasi" })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: "is_read true yoki false bo'lishi kerak" })
  is_read?: boolean;
}
