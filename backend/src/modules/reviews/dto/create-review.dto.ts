import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    example: 'clx1234abc',
    description:
      'Baholanayotgan XARID QATORI (order item). Mahsulot ID emas — sharh ' +
      'aniq bir yetkazib berilgan xaridga bog\'lanadi, shuning uchun server ' +
      'huquqni mustaqil tekshira oladi.',
  })
  @IsNotEmpty({ message: "Xarid ID bo'sh bo'lmasligi kerak" })
  @IsString()
  order_item_id!: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5, description: 'Umumiy baho' })
  @Type(() => Number)
  @IsInt({ message: "Baho butun son bo'lishi kerak" })
  @Min(1, { message: 'Baho 1 dan 5 gacha' })
  @Max(5, { message: 'Baho 1 dan 5 gacha' })
  rating!: number;

  @ApiPropertyOptional({ example: 'Ajoyib hid, uzoq turadi' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional({ example: 'Kutganimdan ham yaxshi chiqdi...' })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Sharh 2000 belgidan oshmasligi kerak' })
  comment?: string;

  @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 5, description: 'Hid davomiyligi' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating_longevity?: number;

  @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 5, description: 'Sifat' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating_quality?: number;

  @ApiPropertyOptional({ example: 4, minimum: 1, maximum: 5, description: 'Qadoqlash' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating_packaging?: number;

  @ApiPropertyOptional({ example: 4, minimum: 1, maximum: 5, description: 'Narx-sifat nisbati' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating_value?: number;
}
