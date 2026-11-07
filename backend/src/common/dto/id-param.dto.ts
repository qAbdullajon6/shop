import { IsNotEmpty, IsString } from 'class-validator';

export class IdParamDto {
  @IsNotEmpty({ message: "ID bo'sh bo'lmasligi kerak" })
  @IsString({ message: "ID matn bo'lishi kerak" })
  id!: string;
}
