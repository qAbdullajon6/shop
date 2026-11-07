import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateAddressDto {
  @ApiPropertyOptional({ example: 'Uy', maxLength: 100 })
  @IsOptional()
  @IsString({ message: "Sarlavha matn bo'lishi kerak" })
  @MaxLength(100, { message: "Sarlavha 100 ta belgidan oshmasligi kerak" })
  title?: string;

  @ApiPropertyOptional({ example: 'Toshkent' })
  @IsOptional()
  @IsString({ message: "Shahar matn bo'lishi kerak" })
  @MinLength(1, { message: "Shahar bo'sh bo'lmasligi kerak" })
  @MaxLength(100, { message: "Shahar nomi 100 ta belgidan oshmasligi kerak" })
  city?: string;

  @ApiPropertyOptional({ example: 'Yunusobod' })
  @IsOptional()
  @IsString({ message: "Tuman matn bo'lishi kerak" })
  @MaxLength(100, { message: "Tuman nomi 100 ta belgidan oshmasligi kerak" })
  district?: string;

  @ApiPropertyOptional({ example: "Amir Temur ko'chasi 1" })
  @IsOptional()
  @IsString({ message: "Ko'cha manzili matn bo'lishi kerak" })
  @MinLength(1, { message: "Ko'cha manzili bo'sh bo'lmasligi kerak" })
  @MaxLength(255, { message: "Ko'cha manzili 255 ta belgidan oshmasligi kerak" })
  street?: string;

  @ApiPropertyOptional({ example: '100000', maxLength: 20 })
  @IsOptional()
  @IsString({ message: "Pochta indeksi matn bo'lishi kerak" })
  @MaxLength(20, { message: "Pochta indeksi 20 ta belgidan oshmasligi kerak" })
  zip_code?: string;

  @ApiPropertyOptional({ example: 41.2995, minimum: -90, maximum: 90 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Kenglik (lat) raqam bo'lishi kerak" })
  @Min(-90, { message: "Kenglik -90 dan kichik bo'lmasligi kerak" })
  @Max(90, { message: "Kenglik 90 dan katta bo'lmasligi kerak" })
  lat?: number;

  @ApiPropertyOptional({ example: 69.2401, minimum: -180, maximum: 180 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Uzunlik (lon) raqam bo'lishi kerak" })
  @Min(-180, { message: "Uzunlik -180 dan kichik bo'lmasligi kerak" })
  @Max(180, { message: "Uzunlik 180 dan katta bo'lmasligi kerak" })
  lon?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean({ message: "is_default true yoki false bo'lishi kerak" })
  is_default?: boolean;
}
