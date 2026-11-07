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
import type { User } from '../../../generated/prisma/client';

import { CurrentUser, Roles } from '../../common/decorators';
import { IdParamDto } from '../../common/dto/id-param.dto';
import { RolesGuard } from '../../common/guards';
import { AddressesService } from './addresses.service';
import { AddressResponseDto } from './dto/address-response.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@ApiTags('Addresses')
@Controller('addresses')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @SkipThrottle()
  @Get()
  @ApiOperation({ summary: "Mening manzillarim ro'yxati" })
  @ApiOkResponse({ type: [AddressResponseDto] })
  findMyAddresses(@CurrentUser() user: User): Promise<AddressResponseDto[]> {
    return this.addressesService.findMyAddresses(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Yangi manzil qo\'shish' })
  @ApiCreatedResponse({ type: AddressResponseDto })
  @ApiBadRequestResponse({ description: 'Noto\'g\'ri ma\'lumotlar' })
  create(
    @CurrentUser() user: User,
    @Body() dto: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    return this.addressesService.create(user.id, dto);
  }

  @SkipThrottle()
  @Get('users/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Foydalanuvchi manzillarini ko'rish (admin)" })
  @ApiOkResponse({ type: [AddressResponseDto] })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  @ApiNotFoundResponse({ description: 'Foydalanuvchi topilmadi' })
  findUserAddresses(@Param() { id }: IdParamDto): Promise<AddressResponseDto[]> {
    return this.addressesService.findUserAddresses(id);
  }

  @SkipThrottle()
  @Get(':id')
  @ApiOperation({ summary: "Manzilni ID bo'yicha olish" })
  @ApiOkResponse({ type: AddressResponseDto })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  @ApiNotFoundResponse({ description: 'Manzil topilmadi' })
  findOne(
    @CurrentUser() user: User,
    @Param() { id }: IdParamDto,
  ): Promise<AddressResponseDto> {
    return this.addressesService.findMyAddress(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Manzilni yangilash' })
  @ApiOkResponse({ type: AddressResponseDto })
  @ApiBadRequestResponse({ description: 'Yangilash uchun kamida bitta maydon yuborilishi kerak' })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  @ApiNotFoundResponse({ description: 'Manzil topilmadi' })
  update(
    @CurrentUser() user: User,
    @Param() { id }: IdParamDto,
    @Body() dto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    return this.addressesService.update(user.id, id, dto);
  }

  @Patch(':id/default')
  @ApiOperation({ summary: 'Manzilni asosiy qilib belgilash' })
  @ApiOkResponse({ type: AddressResponseDto })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  @ApiNotFoundResponse({ description: 'Manzil topilmadi' })
  setDefault(
    @CurrentUser() user: User,
    @Param() { id }: IdParamDto,
  ): Promise<AddressResponseDto> {
    return this.addressesService.setDefault(user.id, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Manzilni o'chirish" })
  @ApiNoContentResponse({ description: "Muvaffaqiyatli o'chirildi" })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  @ApiNotFoundResponse({ description: 'Manzil topilmadi' })
  @ApiConflictResponse({ description: "Bu manzil buyurtmalarda ishlatilgan, o'chirib bo'lmaydi" })
  remove(
    @CurrentUser() user: User,
    @Param() { id }: IdParamDto,
  ): Promise<void> {
    return this.addressesService.remove(user.id, id);
  }
}
