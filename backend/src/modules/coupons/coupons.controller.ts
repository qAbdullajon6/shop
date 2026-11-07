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
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Role } from '../../../generated/prisma/client';

import { Roles } from '../../common/decorators';
import { IdParamDto } from '../../common/dto/id-param.dto';
import { RolesGuard } from '../../common/guards';
import { CouponsService, PaginatedCouponsResponse } from './coupons.service';
import { CouponQueryDto } from './dto/coupon-query.dto';
import { CouponResponseDto } from './dto/coupon-response.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@ApiTags('Coupons')
@Controller('coupons')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
@ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @SkipThrottle()
  @Get()
  @ApiOperation({ summary: 'Barcha kuponlar (admin, sahifalangan)' })
  @ApiOkResponse({ description: "Kuponlar ro'yxati" })
  findAll(@Query() query: CouponQueryDto): Promise<PaginatedCouponsResponse> {
    return this.couponsService.findAll(query);
  }

  @SkipThrottle()
  @Get(':id')
  @ApiOperation({ summary: "Kuponni ID bo'yicha olish (admin)" })
  @ApiOkResponse({ type: CouponResponseDto })
  @ApiNotFoundResponse({ description: 'Kupon topilmadi' })
  findOne(@Param() { id }: IdParamDto): Promise<CouponResponseDto> {
    return this.couponsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Yangi kupon yaratish (admin)' })
  @ApiCreatedResponse({ type: CouponResponseDto })
  @ApiConflictResponse({ description: 'Bu kod bilan kupon allaqachon mavjud' })
  create(@Body() dto: CreateCouponDto): Promise<CouponResponseDto> {
    return this.couponsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: "Kuponni yangilash (admin)" })
  @ApiOkResponse({ type: CouponResponseDto })
  @ApiBadRequestResponse({ description: 'Yangilash uchun kamida bitta maydon yuborilishi kerak' })
  @ApiConflictResponse({ description: 'Bu kod bilan kupon allaqachon mavjud' })
  @ApiNotFoundResponse({ description: 'Kupon topilmadi' })
  update(
    @Param() { id }: IdParamDto,
    @Body() dto: UpdateCouponDto,
  ): Promise<CouponResponseDto> {
    return this.couponsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Kuponni o'chirish (admin)" })
  @ApiNoContentResponse({ description: "Muvaffaqiyatli o'chirildi" })
  @ApiConflictResponse({ description: "Bu kupondan foydalanilgan, o'chirib bo'lmaydi" })
  @ApiNotFoundResponse({ description: 'Kupon topilmadi' })
  remove(@Param() { id }: IdParamDto): Promise<void> {
    return this.couponsService.remove(id);
  }
}
