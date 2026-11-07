import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SupplierResponseDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() name!: string;

  @ApiPropertyOptional({ nullable: true }) @Expose() phone!: string | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() email!: string | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() address!: string | null;

  @ApiProperty() @Expose() is_active!: boolean;
  @ApiProperty() @Expose() created_at!: Date;
  @ApiProperty() @Expose() updated_at!: Date;
}
