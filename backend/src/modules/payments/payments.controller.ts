import {
  Body,
  Controller,
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
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Role } from '@prisma/client';

import { Roles } from '../../common/decorators';
import { IdParamDto } from '../../common/dto/id-param.dto';
import { RolesGuard } from '../../common/guards';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';
import {
  PaginatedPaymentsResponseDto,
  PaymentResponseDto,
} from './dto/payment-response.dto';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
@ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @SkipThrottle()
  @Get()
  @ApiOperation({ summary: "Barcha to'lovlar (admin, sahifalangan, filtrlangan)" })
  @ApiOkResponse({ type: PaginatedPaymentsResponseDto })
  findAll(@Query() query: PaymentQueryDto): Promise<PaginatedPaymentsResponseDto> {
    return this.paymentsService.findAll(query);
  }

  @SkipThrottle()
  @Get(':id')
  @ApiOperation({ summary: "To'lovni ID bo'yicha olish (admin)" })
  @ApiOkResponse({ type: PaymentResponseDto })
  @ApiNotFoundResponse({ description: "To'lov topilmadi" })
  findOne(@Param() { id }: IdParamDto): Promise<PaymentResponseDto> {
    return this.paymentsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Yangi to'lov yaratish (admin)" })
  @ApiCreatedResponse({ type: PaymentResponseDto })
  @ApiNotFoundResponse({ description: 'Buyurtma topilmadi' })
  create(@Body() dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    return this.paymentsService.create(dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "To'lovni yangilash (admin)" })
  @ApiOkResponse({ type: PaymentResponseDto })
  @ApiBadRequestResponse({ description: 'Yangilash uchun kamida bitta maydon yuborilishi kerak' })
  @ApiNotFoundResponse({ description: "To'lov topilmadi" })
  update(
    @Param() { id }: IdParamDto,
    @Body() dto: UpdatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.update(id, dto);
  }
}
