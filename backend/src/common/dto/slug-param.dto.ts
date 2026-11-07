import { IsNotEmpty, IsString } from 'class-validator';

export class SlugParamDto {
  @IsNotEmpty({ message: "Slug bo'sh bo'lmasligi kerak" })
  @IsString({ message: "Slug matn bo'lishi kerak" })
  slug!: string;
}
