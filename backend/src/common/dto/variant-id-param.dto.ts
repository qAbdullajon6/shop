import { IsNotEmpty, IsString } from 'class-validator';

export class VariantIdParamDto {
  @IsNotEmpty({ message: "Variant ID bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Variant ID matn bo'lishi kerak" })
  variantId!: string;
}
