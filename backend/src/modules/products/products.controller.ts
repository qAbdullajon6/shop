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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

// Ommaviy katalog endpointlari uchun saxiy, ammo mavjud tezlik cheklovi —
// oddiy mijozga xalaqit bermaydi, lekin scraping/DoS ni jilovlaydi.
const CATALOG_THROTTLE = { default: { limit: 240, ttl: 60_000 } };
import { Role } from '../../../generated/prisma/client';
import type { User } from '../../../generated/prisma/client';

import { CurrentUserOptional, OptionalAuth, Public, Roles } from '../../common/decorators';
import { IdParamDto } from '../../common/dto/id-param.dto';
import { SlugParamDto } from '../../common/dto/slug-param.dto';
import { ProductImageParamDto } from '../../common/dto/product-image-param.dto';
import { RolesGuard } from '../../common/guards';
import { ImageValidationPipe } from '../../common/upload/image-validation.pipe';
import { ProductsService } from './products.service';
import { ProductsAdminService } from './products-admin.service';
import { ProductMediaService } from './product-media.service';
import {
  PRODUCT_MAX_FILES,
  PRODUCT_MAX_SIZE_BYTES,
  PRODUCT_MULTER_OPTIONS,
} from './products.constants';
import { ProductQueryDto } from './dto/product-query.dto';
import {
  ProductFacetsDto,
  ProductListResponseDto,
  ProductResponseDto,
} from './dto/product-response.dto';
import { CreateProductDto, CreateProductVariantDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ReorderImagesDto } from './dto/reorder-images.dto';

const imagePipe = new ImageValidationPipe({ maxSizeBytes: PRODUCT_MAX_SIZE_BYTES });

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly products: ProductsService,
    private readonly admin: ProductsAdminService,
    private readonly media: ProductMediaService,
  ) {}

  // ─── Ommaviy katalog ───────────────────────────────────────────────────────

  @Public()
  @Throttle(CATALOG_THROTTLE)
  @Get()
  @ApiOperation({
    summary: 'Katalog — filtr, saralash va sahifalash',
    description:
      'Namunalar:\n' +
      '• Bestsellerlar: `is_bestseller=true`\n' +
      '• Yangi kelganlar: `is_new_arrival=true` yoki `sort_by=created_at&sort_order=desc`\n' +
      '• Chegirmadagilar: `on_sale=true`\n' +
      '• Arzondan qimmatga: `sort_by=price&sort_order=asc`\n' +
      '• Kategoriya bloklari: `category_slug=shamlar`',
  })
  @ApiOkResponse({ type: ProductListResponseDto })
  findAll(@Query() query: ProductQueryDto): Promise<ProductListResponseDto> {
    // `include_inactive` bu yerda ATAYLAB uzatilmaydi — ommaviy so'rov
    // nofaol mahsulotlarni ko'ra olmasligi kerak.
    return this.products.findAll(query);
  }

  @Public()
  @Throttle(CATALOG_THROTTLE)
  @Get('facets')
  @ApiOperation({
    summary: 'Filtr paneli uchun mavjud qiymatlar',
    description: "Narx oralig'i, hajmlar va brendlar — mahsulot sonlari bilan.",
  })
  @ApiQuery({ name: 'category_slug', required: false })
  @ApiOkResponse({ type: ProductFacetsDto })
  getFacets(@Query('category_slug') categorySlug?: string): Promise<ProductFacetsDto> {
    return this.products.getFilterFacets(categorySlug);
  }

  @Public()
  @Throttle(CATALOG_THROTTLE)
  @Get('recommended')
  @ApiOperation({ summary: 'Tavsiya etilgan mahsulotlar' })
  @ApiOkResponse({ type: [ProductResponseDto] })
  getRecommended(): Promise<ProductResponseDto[]> {
    return this.products.getRecommended();
  }

  // ─── Admin ro'yxati ────────────────────────────────────────────────────────
  // Diqqat: `:slug` marshrutidan OLDIN e'lon qilinadi, aks holda
  // "admin/list" slug sifatida tushunilib qoladi.

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @SkipThrottle()
  @Get('admin/list')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Katalog (admin) — nofaol mahsulotlar bilan',
    description: '`include_inactive=true` faqat shu marshrutda kuchga kiradi.',
  })
  @ApiOkResponse({ type: ProductListResponseDto })
  findAllAdmin(@Query() query: ProductQueryDto): Promise<ProductListResponseDto> {
    return this.products.findAll(query, { allowInactive: true });
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('admin/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mahsulot tafsiloti ID bo\'yicha (admin)' })
  @ApiOkResponse({ type: ProductResponseDto })
  findOneAdmin(@Param() { id }: IdParamDto): Promise<ProductResponseDto> {
    return this.products.findByIdAdmin(id);
  }

  // ─── Ommaviy mahsulot sahifasi ─────────────────────────────────────────────

  @OptionalAuth()
  @Throttle(CATALOG_THROTTLE)
  @Get(':slug')
  @ApiOperation({ summary: "Mahsulotni slug bo'yicha olish" })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse({ description: 'Mahsulot topilmadi' })
  findOne(
    @Param() { slug }: SlugParamDto,
    @CurrentUserOptional() user: User | null,
  ): Promise<ProductResponseDto> {
    return this.products.findBySlug(slug, user?.id ?? null);
  }

  @Public()
  @Throttle(CATALOG_THROTTLE)
  @Get(':slug/similar')
  @ApiOperation({ summary: "O'xshash mahsulotlar" })
  @ApiOkResponse({ type: [ProductResponseDto] })
  getSimilar(@Param() { slug }: SlugParamDto): Promise<ProductResponseDto[]> {
    return this.products.getSimilarProducts(slug);
  }

  // ─── Admin CRUD ────────────────────────────────────────────────────────────

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  @UseInterceptors(FilesInterceptor('images', PRODUCT_MAX_FILES, PRODUCT_MULTER_OPTIONS))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Yangi mahsulot yaratish (admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name_uz', 'name_ru', 'name_en', 'category_id', 'variants'],
      properties: {
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: `JPEG/PNG/WebP, ${PRODUCT_MAX_SIZE_BYTES / 1024 / 1024}MB gacha, ${PRODUCT_MAX_FILES} tagacha`,
        },
        name_uz: { type: 'string', example: 'Dior Sauvage EDP' },
        name_ru: { type: 'string', example: 'Dior Sauvage EDP' },
        name_en: { type: 'string', example: 'Dior Sauvage EDP' },
        slug: { type: 'string', example: 'dior-sauvage-edp' },
        short_uz: { type: 'string', example: 'Yovvoyi va erkin sharqona atir' },
        description_uz: { type: 'string' },
        category_id: { type: 'string', example: 'clx1234abc' },
        brand_id: { type: 'string', example: 'clx5678def' },
        gender: { type: 'string', enum: ['MALE', 'FEMALE', 'UNISEX', 'NOT_APPLICABLE'] },
        concentration: {
          type: 'string',
          enum: ['PARFUM', 'EAU_DE_PARFUM', 'EAU_DE_TOILETTE', 'BODY_MIST', 'NOT_APPLICABLE'],
        },
        top_notes: { type: 'string', example: '["Bergamot","Qalampir"]' },
        heart_notes: { type: 'string', example: '["Lavanda"]' },
        base_notes: { type: 'string', example: '["Ambroksan","Sadr"]' },
        is_active: { type: 'boolean', default: true },
        is_bestseller: { type: 'boolean', default: false },
        variants: {
          type: 'string',
          example:
            '[{"sku":"ZP-DS-60","volume":"60ml","price":1150000,"compare_at_price":1400000,"cost_price":440000,"stock":30}]',
          description: 'JSON array. Birinchi variant standart bo\'ladi.',
        },
      },
    },
  })
  @ApiCreatedResponse({ type: ProductResponseDto })
  @ApiConflictResponse({ description: 'Slug yoki SKU band' })
  create(
    @UploadedFiles(imagePipe) files: Express.Multer.File[],
    @Body() dto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return this.admin.create(dto, files);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', PRODUCT_MAX_FILES, PRODUCT_MULTER_OPTIONS))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Mahsulotni yangilash (admin)',
    description: "Yangi rasmlar mavjudlariga qo'shiladi. Variantlar alohida endpointlarda.",
  })
  @ApiOkResponse({ type: ProductResponseDto })
  update(
    @Param() { id }: IdParamDto,
    @UploadedFiles(imagePipe) files: Express.Multer.File[],
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.admin.update(id, dto, files);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Mahsulotni o'chirish (admin)",
    description:
      "Buyurtma yoki ombor tarixi bo'lsa mahsulot SOFT DELETE qilinadi — " +
      'katalogdan yo\'qoladi, lekin hisob-fakturalar butun qoladi. ' +
      'Tarixsiz mahsulot butunlay o\'chiriladi.',
  })
  @ApiOkResponse({ schema: { example: { soft_deleted: true } } })
  @ApiNotFoundResponse({ description: 'Mahsulot topilmadi' })
  remove(@Param() { id }: IdParamDto): Promise<{ soft_deleted: boolean }> {
    return this.admin.remove(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id/restore')
  @ApiBearerAuth()
  @ApiOperation({ summary: "O'chirilgan mahsulotni tiklash (admin)" })
  @ApiOkResponse({ type: ProductResponseDto })
  restore(@Param() { id }: IdParamDto): Promise<ProductResponseDto> {
    return this.admin.restore(id);
  }

  // ─── Variantlar (admin) ────────────────────────────────────────────────────

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post(':id/variants')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mahsulotga variant qo\'shish (admin)',
    description: 'Narx, zaxira va chegirmani boshqarish uchun.',
  })
  @ApiCreatedResponse({ type: ProductResponseDto })
  addVariant(
    @Param() { id }: IdParamDto,
    @Body() dto: CreateProductVariantDto,
  ): Promise<ProductResponseDto> {
    return this.admin.upsertVariant(id, null, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id/variants/:variantId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Variantni yangilash — narx, zaxira, chegirma (admin)' })
  @ApiOkResponse({ type: ProductResponseDto })
  updateVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() dto: CreateProductVariantDto,
  ): Promise<ProductResponseDto> {
    return this.admin.upsertVariant(id, variantId, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id/variants/:variantId')
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Variantni o'chirish (admin)",
    description: "Buyurtma tarixi bo'lsa variant faqat nofaol qilinadi.",
  })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiConflictResponse({ description: "Oxirgi variantni o'chirib bo'lmaydi" })
  removeVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
  ): Promise<ProductResponseDto> {
    return this.admin.removeVariant(id, variantId);
  }

  // ─── Rasmlar (admin) ───────────────────────────────────────────────────────

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':productId/images/:imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Rasmni o'chirish (admin)",
    description: "Asosiy rasm o'chirilsa keyingisi avtomatik asosiy bo'ladi.",
  })
  @ApiNoContentResponse({ description: "O'chirildi" })
  @ApiNotFoundResponse({ description: 'Rasm topilmadi' })
  removeImage(@Param() { productId, imageId }: ProductImageParamDto): Promise<void> {
    return this.media.removeImage(productId, imageId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':productId/images/:imageId/primary')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Asosiy rasmni belgilash (admin)' })
  @ApiNoContentResponse({ description: 'Belgilandi' })
  setPrimaryImage(@Param() { productId, imageId }: ProductImageParamDto): Promise<void> {
    return this.media.setPrimary(productId, imageId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id/images/reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Galereya tartibini o\'zgartirish (admin)' })
  @ApiNoContentResponse({ description: "Tartib yangilandi" })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  reorderImages(
    @Param() { id }: IdParamDto,
    @Body() dto: ReorderImagesDto,
  ): Promise<void> {
    return this.media.reorder(id, dto.image_ids);
  }
}
