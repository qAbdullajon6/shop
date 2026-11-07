import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReviewStatus } from '@prisma/client';

export class ModerateReviewDto {
  @ApiProperty({ enum: ReviewStatus, example: ReviewStatus.APPROVED })
  @IsEnum(ReviewStatus, { message: "Noto'g'ri sharh holati" })
  status!: ReviewStatus;

  @ApiPropertyOptional({ example: 'Haqoratli so\'zlar uchun rad etildi' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  admin_note?: string;
}

export class VoteReviewDto {
  @ApiPropertyOptional({ example: true, description: 'Sharh foydali bo\'ldimi' })
  @IsOptional()
  is_helpful?: boolean;
}
