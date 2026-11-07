import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ProductIdParamDto {
  @ApiProperty({ example: 'clx1234abc', description: 'Mahsulot ID' })
  @IsNotEmpty({ message: "Mahsulot ID bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Mahsulot ID matn bo'lishi kerak" })
  productId!: string;
}
