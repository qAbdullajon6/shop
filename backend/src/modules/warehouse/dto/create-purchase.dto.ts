import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreatePurchaseItemDto {
  @ApiProperty({ example: 'clvariant000001' })
  @IsNotEmpty({ message: "Variant ID bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Variant ID matn bo'lishi kerak" })
  variant_id!: string;

  @ApiProperty({ example: 10, minimum: 1 })
  @IsInt({ message: "Miqdor butun son bo'lishi kerak" })
  @Min(1, { message: "Miqdor 1 dan kichik bo'lmasligi kerak" })
  quantity!: number;

  @ApiProperty({ example: 45000.0, description: 'Birlik xarid narxi' })
  @Type(() => Number)
  @IsNumber({}, { message: "Birlik narxi raqam bo'lishi kerak" })
  @IsPositive({ message: "Birlik narxi musbat bo'lishi kerak" })
  unit_cost!: number;
}

export class CreatePurchaseDto {
  @ApiProperty({ example: 'clsupplier000001' })
  @IsNotEmpty({ message: "Ta'minotchi ID bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Ta'minotchi ID matn bo'lishi kerak" })
  supplier_id!: string;

  @ApiPropertyOptional({ example: 'Yanvar oyi uchun xarid' })
  @IsOptional()
  @IsString({ message: "Izoh matn bo'lishi kerak" })
  notes?: string;

  @ApiProperty({ type: [CreatePurchaseItemDto], minItems: 1 })
  @IsArray({ message: "Mahsulotlar massiv bo'lishi kerak" })
  @ArrayMinSize(1, { message: "Kamida bitta mahsulot bo'lishi kerak" })
  @ValidateNested({ each: true, message: 'Mahsulot malumotlari noto\'g\'ri' })
  @Type(() => CreatePurchaseItemDto)
  items!: CreatePurchaseItemDto[];
}
