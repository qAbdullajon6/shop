import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class ReorderImagesDto {
  @ApiProperty({
    type: [String],
    example: ['img_2', 'img_1', 'img_3'],
    description: "Rasm ID'lari yangi tartibda. Barchasi shu mahsulotga tegishli bo'lishi shart.",
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  image_ids!: string[];
}
