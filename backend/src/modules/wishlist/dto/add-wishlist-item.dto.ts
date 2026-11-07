import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddWishlistItemDto {
  @ApiProperty({ example: 'clx1234abc', description: 'Mahsulot ID' })
  @IsNotEmpty({ message: "Mahsulot ID bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Mahsulot ID matn bo'lishi kerak" })
  product_id!: string;

  @ApiPropertyOptional({
    example: 'clx5678def',
    description:
      "Ixtiyoriy: mijoz afzal ko'rgan hajm/variant. Berilmasa mahsulot " +
      'umumiy holda saqlanadi.',
  })
  @IsOptional()
  @IsString({ message: "Variant ID matn bo'lishi kerak" })
  variant_id?: string;
}
