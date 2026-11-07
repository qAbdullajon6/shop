import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class CreateBannerDto {
  @ApiPropertyOptional({ example: 'Yozgi chegirmalar' })
  @IsOptional()
  @IsString({ message: "O'zbekcha sarlavha matn bo'lishi kerak" })
  title_uz?: string;

  @ApiPropertyOptional({ example: 'Летние скидки' })
  @IsOptional()
  @IsString({ message: "Ruscha sarlavha matn bo'lishi kerak" })
  title_ru?: string;

  @ApiPropertyOptional({ example: 'Summer Sale' })
  @IsOptional()
  @IsString({ message: "Inglizcha sarlavha matn bo'lishi kerak" })
  title_en?: string;

  @ApiPropertyOptional({ example: "Eng yaxshi narxlar" })
  @IsOptional()
  @IsString({ message: "O'zbekcha subtitle matn bo'lishi kerak" })
  subtitle_uz?: string;

  @ApiPropertyOptional({ example: 'Лучшие цены' })
  @IsOptional()
  @IsString({ message: "Ruscha subtitle matn bo'lishi kerak" })
  subtitle_ru?: string;

  @ApiPropertyOptional({ example: 'Best prices' })
  @IsOptional()
  @IsString({ message: "Inglizcha subtitle matn bo'lishi kerak" })
  subtitle_en?: string;

  @ApiPropertyOptional({ example: 'https://example.com/sale', description: 'Bosish havolasi (ixtiyoriy)' })
  @IsOptional()
  @IsUrl({}, { message: "Havola to'g'ri URL bo'lishi kerak" })
  link?: string;

  @ApiPropertyOptional({ example: 0, default: 0, description: 'Tartib raqami — kichik raqam birinchi' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Tartib raqam butun son bo'lishi kerak" })
  @Min(0, { message: "Tartib raqam manfiy bo'lmasligi kerak" })
  sort_order?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: "is_active boolean bo'lishi kerak" })
  is_active?: boolean;
}
