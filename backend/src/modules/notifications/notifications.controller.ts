import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';

import { CurrentUser, Roles } from '../../common/decorators';
import { IdParamDto } from '../../common/dto/id-param.dto';
import { RolesGuard } from '../../common/guards';
import { NotificationsService } from './notifications.service';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto';
import { CountResponseDto } from './dto/count-response.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationResponseDto, PaginatedNotificationsResponseDto } from './dto/notification-response.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tanlangan foydalanuvchiga bildirishnoma yuborish (super admin)' })
  @ApiCreatedResponse({ type: NotificationResponseDto })
  @ApiNotFoundResponse({ description: 'Foydalanuvchi topilmadi' })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  create(@Body() dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    return this.notificationsService.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Post('broadcast')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Barcha foydalanuvchilarga bildirishnoma yuborish (super admin)' })
  @ApiOkResponse({ type: CountResponseDto })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  broadcast(@Body() dto: BroadcastNotificationDto): Promise<{ count: number }> {
    return this.notificationsService.broadcast(dto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: "O'z bildirishnomalarini ko'rish — pagination va filter bilan (login talab)" })
  @ApiOkResponse({ type: PaginatedNotificationsResponseDto })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  findAll(
    @CurrentUser() user: User,
    @Query() query: NotificationQueryDto,
  ): Promise<PaginatedNotificationsResponseDto> {
    return this.notificationsService.findAllForUser(user.id, query);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Barcha bildirishnomalarni o'qilgan deb belgilash" })
  @ApiOkResponse({ type: CountResponseDto })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  markAllAsRead(@CurrentUser() user: User): Promise<{ count: number }> {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Patch(':id/read')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Bildirishnomani o'qilgan deb belgilash" })
  @ApiOkResponse({ type: NotificationResponseDto })
  @ApiNotFoundResponse({ description: 'Bildirishnoma topilmadi' })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  @ApiForbiddenResponse({ description: "Bu bildirishnoma sizga tegishli emas" })
  markAsRead(
    @Param() { id }: IdParamDto,
    @CurrentUser() user: User,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Bildirishnomani o'chirish (super admin)" })
  @ApiNoContentResponse({ description: "Muvaffaqiyatli o'chirildi" })
  @ApiNotFoundResponse({ description: 'Bildirishnoma topilmadi' })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  remove(@Param() { id }: IdParamDto): Promise<void> {
    return this.notificationsService.remove(id);
  }
}
