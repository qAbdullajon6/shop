import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { User } from '../../../generated/prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { PaginatedUsersResponseDto, UserResponseDto } from './dto/user-response.dto';

const TRANSFORM_OPTIONS = { excludeExtraneousValues: true };

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Mavjud metodlar (auth va boshqa modullar ishlatadi) ─────────────────

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { phone_number: phone } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /** Telefon raqami tasdiqlangandan keyin yangi mijoz hisobini yaratadi. */
  createCustomer(phone: string): Promise<User> {
    return this.prisma.user.create({ data: { phone_number: phone } });
  }

  // ─── Users controller uchun yangi metodlar ───────────────────────────────

  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    return plainToInstance(UserResponseDto, user, TRANSFORM_OPTIONS);
  }

  async updateMe(userId: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const { name, last_name, email } = dto;

    if (name === undefined && last_name === undefined && email === undefined) {
      throw new BadRequestException('Yangilash uchun kamida bitta maydon yuborilishi kerak');
    }

    if (email !== undefined) {
      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== userId) {
        throw new ConflictException('Bu email allaqachon ishlatilmoqda');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { name, last_name, email },
    });

    return plainToInstance(UserResponseDto, user, TRANSFORM_OPTIONS);
  }

  async findAll(query: UserQueryDto): Promise<PaginatedUsersResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(query.role && { role: query.role }),
      ...(query.is_active !== undefined && { is_active: query.is_active }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' as const } },
          { last_name: { contains: query.search, mode: 'insensitive' as const } },
          { phone_number: { contains: query.search } },
          { email: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: plainToInstance(UserResponseDto, users, TRANSFORM_OPTIONS),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    return plainToInstance(UserResponseDto, user, TRANSFORM_OPTIONS);
  }

  async adminUpdate(id: string, dto: AdminUpdateUserDto): Promise<UserResponseDto> {
    const { name, last_name, email, is_active, role } = dto;

    if (
      name === undefined &&
      last_name === undefined &&
      email === undefined &&
      is_active === undefined &&
      role === undefined
    ) {
      throw new BadRequestException('Yangilash uchun kamida bitta maydon yuborilishi kerak');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    if (email !== undefined) {
      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Bu email allaqachon ishlatilmoqda');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { name, last_name, email, is_active, role },
    });

    return plainToInstance(UserResponseDto, updated, TRANSFORM_OPTIONS);
  }
}
