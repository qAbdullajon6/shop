import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({ example: 'clx1234abc', description: 'Variant ID' })
  @IsNotEmpty({ message: "Variant ID bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Variant ID matn bo'lishi kerak" })
  variant_id!: string;

  @ApiPropertyOptional({ example: 1, default: 1, description: "Qo'shiladigan miqdor" })
  @Type(() => Number)
  @IsInt({ message: "Miqdor butun son bo'lishi kerak" })
  @Min(1, { message: "Miqdor kamida 1 bo'lishi kerak" })
  @Max(20, { message: "Bir mahsulotdan ko'pi bilan 20 dona olish mumkin" })
  quantity: number = 1;
}
