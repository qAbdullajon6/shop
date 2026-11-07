import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReviewStatus } from '../../../../generated/prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class AdminReviewQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'clx1234abc' })
  @IsOptional()
  @IsString()
  product_id?: string;

  @ApiPropertyOptional({ enum: ReviewStatus, description: 'Moderatsiya holati' })
  @IsOptional()
  @IsEnum(ReviewStatus, { message: "Noto'g'ri sharh holati" })
  status?: ReviewStatus;
}
