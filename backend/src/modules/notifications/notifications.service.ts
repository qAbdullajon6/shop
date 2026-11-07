import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { PrismaService } from '../../common/prisma/prisma.service';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationResponseDto, PaginatedNotificationsResponseDto } from './dto/notification-response.dto';

const TRANSFORM_OPTIONS = { excludeExtraneousValues: true };

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id: dto.user_id } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    const notification = await this.prisma.notification.create({ data: dto });

    return plainToInstance(NotificationResponseDto, notification, TRANSFORM_OPTIONS);
  }

  async findAllForUser(userId: string, query: NotificationQueryDto): Promise<PaginatedNotificationsResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      user_id: userId,
      ...(query.is_read !== undefined && { is_read: query.is_read }),
    };

    const [notifications, total, unread_count] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { user_id: userId, is_read: false } }),
    ]);

    return {
      data: plainToInstance(NotificationResponseDto, notifications, TRANSFORM_OPTIONS),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
      unread_count,
    };
  }

  async markAsRead(id: string, userId: string): Promise<NotificationResponseDto> {
    const notification = await this.prisma.notification.findUnique({ where: { id } });

    if (!notification) throw new NotFoundException('Bildirishnoma topilmadi');
    if (notification.user_id !== userId) throw new ForbiddenException('Bu bildirishnoma sizga tegishli emas');

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { is_read: true },
    });

    return plainToInstance(NotificationResponseDto, updated, TRANSFORM_OPTIONS);
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });

    return { count: result.count };
  }

  async broadcast(dto: BroadcastNotificationDto): Promise<{ count: number }> {
    const users = await this.prisma.user.findMany({ select: { id: true } });

    await this.prisma.notification.createMany({
      data: users.map((u) => ({ ...dto, user_id: u.id })),
    });

    return { count: users.length };
  }

  async remove(id: string): Promise<void> {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Bildirishnoma topilmadi');

    await this.prisma.notification.delete({ where: { id } });
  }
}
