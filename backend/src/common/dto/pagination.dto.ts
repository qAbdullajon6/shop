import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({ example: 1, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Sahifa raqam butun son bo'lishi kerak" })
  @Min(1, { message: "Sahifa raqam 1 dan kichik bo'lmasligi kerak" })
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Limit butun son bo'lishi kerak" })
  @Min(1, { message: "Limit 1 dan kichik bo'lmasligi kerak" })
  @Max(100, { message: "Limit 100 dan katta bo'lmasligi kerak" })
  limit?: number = 20;
}
