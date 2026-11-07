import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';

export class AddressResponseDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() user_id!: string;

  @ApiPropertyOptional({ nullable: true, example: 'Uy' }) @Expose() title!: string | null;
  @ApiProperty({ example: 'Toshkent' }) @Expose() city!: string;
  @ApiPropertyOptional({ nullable: true, example: 'Yunusobod' }) @Expose() district!: string | null;
  @ApiProperty({ example: 'Amir Temur ko\'chasi 1' }) @Expose() street!: string;
  @ApiPropertyOptional({ nullable: true, example: '100000' }) @Expose() zip_code!: string | null;

  @ApiPropertyOptional({ nullable: true, example: '41.2995' })
  @Expose()
  @Type(() => String)
  @Transform(({ value }) => (value !== null && value !== undefined ? String(value) : null))
  lat!: string | null;

  @ApiPropertyOptional({ nullable: true, example: '69.2401' })
  @Expose()
  @Type(() => String)
  @Transform(({ value }) => (value !== null && value !== undefined ? String(value) : null))
  lon!: string | null;

  @ApiProperty({ example: true }) @Expose() is_default!: boolean;
  @ApiProperty() @Expose() created_at!: Date;
  @ApiProperty() @Expose() updated_at!: Date;
}
