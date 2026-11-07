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
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';

import { CurrentUser, Roles } from '../../common/decorators';
import { IdParamDto } from '../../common/dto/id-param.dto';
import { RolesGuard } from '../../common/guards';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { CreateStockTransactionDto } from './dto/create-stock-transaction.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { PurchaseResponseDto } from './dto/purchase-response.dto';
import { StockTransactionResponseDto } from './dto/stock-transaction-response.dto';
import { SupplierResponseDto } from './dto/supplier-response.dto';
import { UpdatePurchaseStatusDto } from './dto/update-purchase-status.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { WarehouseQueryDto } from './dto/warehouse-query.dto';
import {
  PaginatedPurchasesResponse,
  PaginatedStockResponse,
  PaginatedSuppliersResponse,
  WarehouseService,
} from './warehouse.service';

@ApiTags('Warehouse')
@ApiBearerAuth()
@Controller('warehouse')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
@ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // SUPPLIERS
  // ═══════════════════════════════════════════════════════════════════════════

  @SkipThrottle()
  @Get('suppliers')
  @ApiOperation({ summary: "Barcha ta'minotchilar (sahifalangan)" })
  @ApiOkResponse({ description: "Ta'minotchilar ro'yxati" })
  findAllSuppliers(
    @Query() query: WarehouseQueryDto,
  ): Promise<PaginatedSuppliersResponse> {
    return this.warehouseService.findAllSuppliers(query);
  }

  @SkipThrottle()
  @Get('suppliers/:id')
  @ApiOperation({ summary: "Ta'minotchini ID bo'yicha olish" })
  @ApiOkResponse({ type: SupplierResponseDto })
  @ApiNotFoundResponse({ description: "Ta'minotchi topilmadi" })
  findOneSupplier(@Param() { id }: IdParamDto): Promise<SupplierResponseDto> {
    return this.warehouseService.findOneSupplier(id);
  }

  @Post('suppliers')
  @ApiOperation({ summary: "Yangi ta'minotchi yaratish" })
  @ApiCreatedResponse({ type: SupplierResponseDto })
  createSupplier(@Body() dto: CreateSupplierDto): Promise<SupplierResponseDto> {
    return this.warehouseService.createSupplier(dto);
  }

  @Patch('suppliers/:id')
  @ApiOperation({ summary: "Ta'minotchini yangilash" })
  @ApiOkResponse({ type: SupplierResponseDto })
  @ApiNotFoundResponse({ description: "Ta'minotchi topilmadi" })
  updateSupplier(
    @Param() { id }: IdParamDto,
    @Body() dto: UpdateSupplierDto,
  ): Promise<SupplierResponseDto> {
    return this.warehouseService.updateSupplier(id, dto);
  }

  @Delete('suppliers/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Ta'minotchini o'chirish" })
  @ApiNoContentResponse({ description: "Muvaffaqiyatli o'chirildi" })
  @ApiNotFoundResponse({ description: "Ta'minotchi topilmadi" })
  removeSupplier(@Param() { id }: IdParamDto): Promise<void> {
    return this.warehouseService.removeSupplier(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PURCHASES
  // ═══════════════════════════════════════════════════════════════════════════

  @SkipThrottle()
  @Get('purchases')
  @ApiOperation({ summary: "Barcha xaridlar (sahifalangan)" })
  @ApiOkResponse({ description: "Xaridlar ro'yxati" })
  findAllPurchases(
    @Query() query: WarehouseQueryDto,
  ): Promise<PaginatedPurchasesResponse> {
    return this.warehouseService.findAllPurchases(query);
  }

  @SkipThrottle()
  @Get('purchases/:id')
  @ApiOperation({ summary: "Xaridni ID bo'yicha olish" })
  @ApiOkResponse({ type: PurchaseResponseDto })
  @ApiNotFoundResponse({ description: 'Xarid topilmadi' })
  findOnePurchase(@Param() { id }: IdParamDto): Promise<PurchaseResponseDto> {
    return this.warehouseService.findOnePurchase(id);
  }

  @Post('purchases')
  @ApiOperation({ summary: 'Yangi xarid yaratish' })
  @ApiCreatedResponse({ type: PurchaseResponseDto })
  createPurchase(
    @CurrentUser() user: User,
    @Body() dto: CreatePurchaseDto,
  ): Promise<PurchaseResponseDto> {
    return this.warehouseService.createPurchase(user.id, dto);
  }

  @Patch('purchases/:id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Xarid holatini yangilash (faqat RECEIVED yoki CANCELLED)" })
  @ApiOkResponse({ type: PurchaseResponseDto })
  @ApiNotFoundResponse({ description: 'Xarid topilmadi' })
  updatePurchaseStatus(
    @Param() { id }: IdParamDto,
    @Body() dto: UpdatePurchaseStatusDto,
    @CurrentUser() user: User,
  ): Promise<PurchaseResponseDto> {
    return this.warehouseService.updatePurchaseStatus(id, dto, user.id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STOCK TRANSACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  @SkipThrottle()
  @Get('stock')
  @ApiOperation({ summary: "Barcha zaxira tranzaksiyalari (sahifalangan)" })
  @ApiOkResponse({ description: "Tranzaksiyalar ro'yxati" })
  findAllStock(@Query() query: WarehouseQueryDto): Promise<PaginatedStockResponse> {
    return this.warehouseService.findAllStock(query);
  }

  @Post('stock')
  @ApiOperation({ summary: 'Yangi zaxira tranzaksiyasi yaratish' })
  @ApiCreatedResponse({ type: StockTransactionResponseDto })
  createStockTransaction(
    @CurrentUser() user: User,
    @Body() dto: CreateStockTransactionDto,
  ): Promise<StockTransactionResponseDto> {
    return this.warehouseService.createStockTransaction(user.id, dto);
  }
}
