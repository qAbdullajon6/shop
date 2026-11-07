import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CategoryAttributeResponseDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() category_id!: string;
  @ApiProperty({ example: 'Operativ xotira' }) @Expose() name_uz!: string;
  @ApiProperty({ example: 'Оперативная память' }) @Expose() name_ru!: string;
  @ApiProperty({ example: 'RAM' }) @Expose() name_en!: string;
  @ApiProperty({ example: 'ram' }) @Expose() slug!: string;
  @ApiProperty({ example: 'TEXT', enum: ['TEXT', 'NUMBER', 'BOOLEAN', 'SELECT', 'MULTI_SELECT'] })
  @Expose() type!: string;
  @ApiPropertyOptional({ nullable: true, example: 'GB' }) @Expose() unit!: string | null;
  @ApiProperty({ example: false }) @Expose() is_required!: boolean;
  @ApiProperty({ type: [String], example: [] }) @Expose() options!: string[];
  @ApiProperty() @Expose() sort_order!: number;
  @ApiProperty() @Expose() created_at!: Date;
  @ApiProperty() @Expose() updated_at!: Date;
}
