import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Role } from '../../../../generated/prisma/client';

export class UserResponseDto {
  @ApiProperty({ example: 'clx1234abc' })
  @Expose()
  id!: string;

  @ApiProperty({ example: '+998901234567' })
  @Expose()
  phone_number!: string;

  @ApiProperty({ example: 'Ali', nullable: true })
  @Expose()
  name!: string | null;

  @ApiProperty({ example: 'Valiyev', nullable: true })
  @Expose()
  last_name!: string | null;

  @ApiProperty({ example: 'ali@example.com', nullable: true })
  @Expose()
  email!: string | null;

  @ApiProperty({ example: 'https://...', nullable: true })
  @Expose()
  avatar!: string | null;

  @ApiProperty({ enum: Role, example: Role.USER })
  @Expose()
  role!: Role;

  @ApiProperty({ example: true })
  @Expose()
  is_active!: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @Expose()
  created_at!: Date;
}

export class PaginatedUsersResponseDto {
  @ApiProperty({ type: [UserResponseDto] }) data!: UserResponseDto[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() total_pages!: number;
}
