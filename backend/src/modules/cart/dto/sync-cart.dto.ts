import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsString, Max, Min, ValidateNested } from 'class-validator';

export class SyncCartItemDto {
  @ApiProperty({ example: 'clx1234abc', description: 'Variant ID' })
  @IsNotEmpty({ message: "Variant ID bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Variant ID matn bo'lishi kerak" })
  variant_id!: string;

  @ApiProperty({ example: 2, description: 'LocalStoragedagi miqdor' })
  @Type(() => Number)
  @IsInt({ message: "Miqdor butun son bo'lishi kerak" })
  @Min(1, { message: "Miqdor kamida 1 bo'lishi kerak" })
  @Max(999, { message: "Miqdor 999 dan oshmasligi kerak" })
  quantity!: number;
}

export class SyncCartDto {
  @ApiProperty({
    type: [SyncCartItemDto],
    description: "LocalStoragedagi cart itemlar — mavjud itemlar bilan max() orqali birlashtiriladi",
  })
  @IsArray({ message: "items massiv bo'lishi kerak" })
  @ValidateNested({ each: true })
  @Type(() => SyncCartItemDto)
  items!: SyncCartItemDto[];
}
