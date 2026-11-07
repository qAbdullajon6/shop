import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class UpdateBannerDto {
  @ApiPropertyOptional({ example: 'Yangilangan sarlavha (o\'zbek tilida)' })
  @IsOptional()
  @IsString({ message: "O'zbekcha sarlavha matn bo'lishi kerak" })
  title_uz?: string;

  @ApiPropertyOptional({ example: 'Обновлённый заголовок (русский)' })
  @IsOptional()
  @IsString({ message: "Ruscha sarlavha matn bo'lishi kerak" })
  title_ru?: string;

  @ApiPropertyOptional({ example: 'Updated title (English)' })
  @IsOptional()
  @IsString({ message: "Inglizcha sarlavha matn bo'lishi kerak" })
  title_en?: string;

  @ApiPropertyOptional({ example: "Yangilangan subtitle (o'zbek tilida)" })
  @IsOptional()
  @IsString({ message: "O'zbekcha subtitle matn bo'lishi kerak" })
  subtitle_uz?: string;

  @ApiPropertyOptional({ example: 'Обновлённый subtitle (русский)' })
  @IsOptional()
  @IsString({ message: "Ruscha subtitle matn bo'lishi kerak" })
  subtitle_ru?: string;

  @ApiPropertyOptional({ example: 'Updated subtitle (English)' })
  @IsOptional()
  @IsString({ message: "Inglizcha subtitle matn bo'lishi kerak" })
  subtitle_en?: string;

  @ApiPropertyOptional({ example: 'https://example.com/new-link', description: 'Yangi havola' })
  @IsOptional()
  @IsUrl({}, { message: "Havola to'g'ri URL bo'lishi kerak" })
  link?: string;

  @ApiPropertyOptional({ example: 1, description: 'Tartib raqami' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Tartib raqam butun son bo'lishi kerak" })
  @Min(0, { message: "Tartib raqam manfiy bo'lmasligi kerak" })
  sort_order?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: "is_active boolean bo'lishi kerak" })
  is_active?: boolean;
}
