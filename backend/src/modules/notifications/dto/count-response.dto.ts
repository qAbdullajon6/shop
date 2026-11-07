import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CountResponseDto {
  @ApiProperty({ example: 5 })
  @Expose()
  count!: number;
}
