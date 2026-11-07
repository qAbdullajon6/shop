import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ example: 3, description: "Yangi miqdor (absolyut qiymat)" })
  @Type(() => Number)
  @IsInt({ message: "Miqdor butun son bo'lishi kerak" })
  @Min(1, { message: "Miqdor kamida 1 bo'lishi kerak" })
  @Max(20, { message: "Bir mahsulotdan ko'pi bilan 20 dona olish mumkin" })
  quantity!: number;
}
