import { IsNotEmpty, IsString } from 'class-validator';

export class ProductImageParamDto {
  @IsNotEmpty({ message: "Mahsulot ID bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Mahsulot ID matn bo'lishi kerak" })
  productId!: string;

  @IsNotEmpty({ message: "Rasm ID bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Rasm ID matn bo'lishi kerak" })
  imageId!: string;
}
