import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DeliveryOptionDto {
  @ApiProperty() id!: string;
  @ApiProperty({ example: 'COURIER' }) code!: string;
  @ApiProperty() name_uz!: string;
  @ApiProperty() name_ru!: string;
  @ApiProperty() name_en!: string;
  @ApiPropertyOptional({ nullable: true }) description_uz!: string | null;
  @ApiPropertyOptional({ nullable: true }) description_ru!: string | null;
  @ApiPropertyOptional({ nullable: true }) description_en!: string | null;

  @ApiProperty({ example: '30000.00', description: 'Asosiy narx' })
  fee!: string;

  @ApiPropertyOptional({
    example: '500000.00',
    nullable: true,
    description: 'Shu summadan yuqorida yetkazish bepul. null — bepul bo\'lmaydi.',
  })
  free_threshold!: string | null;

  @ApiProperty({ example: 1 }) min_days!: number;
  @ApiProperty({ example: 2 }) max_days!: number;
  @ApiProperty({ example: true }) requires_address!: boolean;
}
