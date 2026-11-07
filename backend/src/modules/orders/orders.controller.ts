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
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { OrderSource, Role } from '../../../generated/prisma/client';
import type { User } from '../../../generated/prisma/client';

import { ClientIp, CurrentUser, Roles } from '../../common/decorators';
import { IdParamDto } from '../../common/dto/id-param.dto';
import { RolesGuard } from '../../common/guards';
import { OrdersService } from './orders.service';
import { CreateOrderDto, PreviewOrderDto } from './dto/create-order.dto';
import { OrderFiltersDto, UserOrderFiltersDto } from './dto/order-filters.dto';
import {
  OrderPreviewResponseDto,
  OrderResponseDto,
  PaginatedOrdersResponseDto,
} from './dto/order-response.dto';
import {
  CancelOrderDto,
  UpdateOrderStatusDto,
  UpdatePaymentStatusDto,
} from './dto/update-order-status.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ─── Mijoz ─────────────────────────────────────────────────────────────────

  @Post('preview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Checkout summasini hisoblash (buyurtma yaratmasdan)',
    description:
      'Yakuniy summa SERVERDA hisoblanadi. Checkout sahifasi shu javobni ' +
      "ko'rsatishi shart — frontend narx/yetkazish haqini o'zi hisoblamasligi kerak.",
  })
  @ApiOkResponse({ type: OrderPreviewResponseDto })
  previewOrder(
    @CurrentUser() user: User,
    @Body() dto: PreviewOrderDto,
  ): Promise<OrderPreviewResponseDto> {
    return this.ordersService.previewOrder(user.id, dto);
  }

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Yangi buyurtma berish',
    description:
      "Miqdorlar jamlanadi: 5 dona mahsulot BITTA buyurtma qatori bo'ladi, " +
      'beshta alohida buyurtma emas. `idempotency_key` yuborilsa takroriy ' +
      "so'rov yangi buyurtma yaratmaydi.",
  })
  @ApiCreatedResponse({ type: OrderResponseDto })
  @ApiConflictResponse({ description: 'Zaxira tugadi yoki takroriy so\'rov' })
  createOrder(
    @CurrentUser() user: User,
    @Body() dto: CreateOrderDto,
    @ClientIp() ip: string,
  ): Promise<OrderResponseDto> {
    return this.ordersService.createOrder(user.id, dto, ip, OrderSource.WEB);
  }

  @Get('my')
  @ApiOperation({ summary: 'Mening buyurtmalarim' })
  @ApiOkResponse({ type: PaginatedOrdersResponseDto })
  findMyOrders(
    @CurrentUser() user: User,
    @Query() filters: UserOrderFiltersDto,
  ): Promise<PaginatedOrdersResponseDto> {
    return this.ordersService.findMyOrders(user.id, filters);
  }

  @Get('my/:id')
  @ApiOperation({ summary: 'Mening buyurtmam tafsiloti' })
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiNotFoundResponse({ description: 'Buyurtma topilmadi' })
  findMyOrder(
    @CurrentUser() user: User,
    @Param() { id }: IdParamDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.findMyOrder(user.id, id);
  }

  @Patch('my/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buyurtmani bekor qilish',
    description: "Faqat PENDING yoki CONFIRMED holatida — yig'ish boshlangunga qadar.",
  })
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiForbiddenResponse({ description: 'Bu holatda bekor qilib bo\'lmaydi' })
  cancelOrder(
    @CurrentUser() user: User,
    @Param() { id }: IdParamDto,
    @Body() dto: CancelOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.cancelOrder(user.id, id, dto);
  }

  // ─── Admin ─────────────────────────────────────────────────────────────────

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @SkipThrottle()
  @Get()
  @ApiOperation({ summary: 'Barcha buyurtmalar (admin)' })
  @ApiOkResponse({ type: PaginatedOrdersResponseDto })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  findAllAdmin(@Query() filters: OrderFiltersDto): Promise<PaginatedOrdersResponseDto> {
    return this.ordersService.findAllAdmin(filters);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Buyurtma tafsiloti (admin)' })
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiNotFoundResponse({ description: 'Buyurtma topilmadi' })
  findOneAdmin(@Param() { id }: IdParamDto): Promise<OrderResponseDto> {
    return this.ordersService.findOneAdmin(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buyurtma holatini yangilash (admin)',
    description:
      "Faqat holat mashinasi ruxsat bergan o'tishlar. DELIVERED ga o'tish " +
      'mijozga sharh yozish huquqini ochadi va unga bildirishnoma yuboradi.',
  })
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiConflictResponse({ description: 'Holat boshqa foydalanuvchi tomonidan o\'zgartirilgan' })
  updateStatus(
    @Param() { id }: IdParamDto,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() admin: User,
  ): Promise<OrderResponseDto> {
    return this.ordersService.updateStatus(id, dto, admin.id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id/payment-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "To'lov holatini yangilash (admin)" })
  @ApiOkResponse({ type: OrderResponseDto })
  updatePaymentStatus(
    @Param() { id }: IdParamDto,
    @Body() dto: UpdatePaymentStatusDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.updatePaymentStatus(id, dto);
  }
}
