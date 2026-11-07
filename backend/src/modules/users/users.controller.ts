import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Role } from '../../../generated/prisma/client';
import type { User } from '../../../generated/prisma/client';

import { CurrentUser, Roles } from '../../common/decorators';
import { IdParamDto } from '../../common/dto/id-param.dto';
import { RolesGuard } from '../../common/guards';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { PaginatedUsersResponseDto, UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @SkipThrottle()
  @Get('me')
  @ApiOperation({ summary: "O'z profilini ko'rish" })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  getMe(@CurrentUser() user: User): Promise<UserResponseDto> {
    return this.usersService.getMe(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: "O'z profilini yangilash — ism, familiya, email" })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Yangilash uchun kamida bitta maydon yuborilishi kerak' })
  @ApiConflictResponse({ description: 'Bu email allaqachon ishlatilmoqda' })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  updateMe(
    @CurrentUser() user: User,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateMe(user.id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @SkipThrottle()
  @Get()
  @ApiOperation({ summary: 'Barcha foydalanuvchilar — filter va pagination bilan (superadmin)' })
  @ApiOkResponse({ type: PaginatedUsersResponseDto })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  findAll(@Query() query: UserQueryDto): Promise<PaginatedUsersResponseDto> {
    return this.usersService.findAll(query);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @SkipThrottle()
  @Get(':id')
  @ApiOperation({ summary: "Foydalanuvchini ID bo'yicha olish (superadmin)" })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'Foydalanuvchi topilmadi' })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  findOne(@Param() { id }: IdParamDto): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Foydalanuvchini yangilash (superadmin)' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Yangilash uchun kamida bitta maydon yuborilishi kerak' })
  @ApiConflictResponse({ description: 'Bu email allaqachon ishlatilmoqda' })
  @ApiNotFoundResponse({ description: 'Foydalanuvchi topilmadi' })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  adminUpdate(
    @Param() { id }: IdParamDto,
    @Body() dto: AdminUpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.adminUpdate(id, dto);
  }
}
