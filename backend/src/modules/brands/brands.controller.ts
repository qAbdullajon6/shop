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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
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
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Role } from '../../../generated/prisma/client';

import { Public, Roles } from '../../common/decorators';
import { IdParamDto } from '../../common/dto/id-param.dto';
import { SlugParamDto } from '../../common/dto/slug-param.dto';
import { RolesGuard } from '../../common/guards';
import { BrandsService } from './brands.service';
import { BRAND_MULTER_OPTIONS } from './brands.constants';
import { BrandFilePipe } from './brands.pipe';
import { BrandResponseDto } from './dto/brand-response.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@ApiTags('Brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Public()
  @SkipThrottle()
  @Get()
  @ApiOperation({ summary: 'Aktiv brendlar (ommaviy)' })
  @ApiOkResponse({ type: [BrandResponseDto] })
  findAll(): Promise<BrandResponseDto[]> {
    return this.brandsService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @SkipThrottle()
  @Get('all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Barcha brendlar — nofaollar ham' })
  @ApiOkResponse({ type: [BrandResponseDto] })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  findAllAdmin(): Promise<BrandResponseDto[]> {
    return this.brandsService.findAllAdmin();
  }

  @Public()
  @SkipThrottle()
  @Get(':slug')
  @ApiOperation({ summary: "Brendni slug bo'yicha olish" })
  @ApiOkResponse({ type: BrandResponseDto })
  @ApiNotFoundResponse({ description: 'Brand topilmadi' })
  findOne(@Param() { slug }: SlugParamDto): Promise<BrandResponseDto> {
    return this.brandsService.findBySlug(slug);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor('logo', BRAND_MULTER_OPTIONS))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Yangi brend yaratish — logo ixtiyoriy' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name'],
      properties: {
        logo: {
          type: 'string',
          format: 'binary',
          description: 'Brend logosi — JPG, PNG yoki WEBP, maksimal 5MB (ixtiyoriy)',
        },
        name: { type: 'string', example: 'ASUS' },
        slug: { type: 'string', example: 'asus' },
        description_uz: { type: 'string', example: "Dunyo bo'ylab mashhur kompyuter brendi" },
        description_ru: { type: 'string', example: 'Всемирно известный производитель компьютеров' },
        description_en: { type: 'string', example: 'World-renowned computer brand' },
        is_active: { type: 'boolean', default: true, example: true },
      },
    },
  })
  @ApiCreatedResponse({ type: BrandResponseDto })
  @ApiConflictResponse({ description: 'Brand nomi yoki slug allaqachon mavjud' })
  @ApiUnprocessableEntityResponse({ description: "Rasm turi noto'g'ri yoki hajmi 5MB oshgan" })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  create(
    @UploadedFile(new BrandFilePipe(false)) file: Express.Multer.File | undefined,
    @Body() dto: CreateBrandDto,
  ): Promise<BrandResponseDto> {
    return this.brandsService.create(dto, file);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('logo', BRAND_MULTER_OPTIONS))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: "Brendni yangilash — logo berilsa eskisi o'chiriladi" })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: {
          type: 'string',
          format: 'binary',
          description: "Yangi logo — berilsa, eski logo serverdan o'chiriladi (ixtiyoriy)",
        },
        name: { type: 'string', example: 'MSI' },
        slug: { type: 'string', example: 'msi' },
        description_uz: { type: 'string', example: "Yangilangan tavsif (o'zbek tilida)" },
        description_ru: { type: 'string', example: 'Обновлённое описание (русский)' },
        description_en: { type: 'string', example: 'Updated description (English)' },
        is_active: { type: 'boolean', example: false },
      },
    },
  })
  @ApiOkResponse({ type: BrandResponseDto })
  @ApiBadRequestResponse({ description: 'Yangilash uchun kamida bitta maydon yoki logo yuborilishi kerak' })
  @ApiConflictResponse({ description: 'Brand nomi yoki slug allaqachon mavjud' })
  @ApiNotFoundResponse({ description: 'Brand topilmadi' })
  @ApiUnprocessableEntityResponse({ description: "Rasm turi noto'g'ri yoki hajmi 5MB oshgan" })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  update(
    @Param() { id }: IdParamDto,
    @Body() dto: UpdateBrandDto,
    @UploadedFile(new BrandFilePipe(false)) file?: Express.Multer.File,
  ): Promise<BrandResponseDto> {
    return this.brandsService.update(id, dto, file);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Brendni o'chirish — logosi ham serverdan o'chiriladi" })
  @ApiNoContentResponse({ description: "Muvaffaqiyatli o'chirildi" })
  @ApiNotFoundResponse({ description: 'Brand topilmadi' })
  @ApiConflictResponse({ description: "Brandga tegishli mahsulotlar mavjud" })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  remove(@Param() { id }: IdParamDto): Promise<void> {
    return this.brandsService.remove(id);
  }
}
