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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
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
import { Role } from '@prisma/client';

import { Public, Roles } from '../../common/decorators';
import { IdParamDto } from '../../common/dto/id-param.dto';
import { RolesGuard } from '../../common/guards';
import { BannersService, BannerFiles } from './banners.service';
import { BANNER_MULTER_OPTIONS } from './banners.constants';
import { BannerResponseDto } from './dto/banner-response.dto';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

type UploadedBannerFiles = {
  image_uz?: Express.Multer.File[];
  image_ru?: Express.Multer.File[];
  image_en?: Express.Multer.File[];
};

function extractFiles(raw: UploadedBannerFiles): BannerFiles {
  return {
    image_uz: raw.image_uz?.[0],
    image_ru: raw.image_ru?.[0],
    image_en: raw.image_en?.[0],
  };
}

const IMAGE_FIELDS = FileFieldsInterceptor([
  { name: 'image_uz', maxCount: 1 },
  { name: 'image_ru', maxCount: 1 },
  { name: 'image_en', maxCount: 1 },
], BANNER_MULTER_OPTIONS);

const IMAGE_SCHEMA_PROPS = {
  image_uz: { type: 'string', format: 'binary', description: "O'zbek tilidagi rasm — JPG, PNG, WEBP, maks 5MB" },
  image_ru: { type: 'string', format: 'binary', description: 'Rus tilidagi rasm — JPG, PNG, WEBP, maks 5MB' },
  image_en: { type: 'string', format: 'binary', description: 'Ingliz tilidagi rasm — JPG, PNG, WEBP, maks 5MB' },
};

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Public()
  @SkipThrottle()
  @Get()
  @ApiOperation({ summary: 'Aktiv bannerlar (ommaviy)' })
  @ApiOkResponse({ type: [BannerResponseDto] })
  findAll(): Promise<BannerResponseDto[]> {
    return this.bannersService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @SkipThrottle()
  @Get('all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Barcha bannerlar — nofaollar ham (admin)' })
  @ApiOkResponse({ type: [BannerResponseDto] })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  findAllAdmin(): Promise<BannerResponseDto[]> {
    return this.bannersService.findAllAdmin();
  }

  @Public()
  @SkipThrottle()
  @Get(':id')
  @ApiOperation({ summary: "Bannerni ID bo'yicha olish" })
  @ApiOkResponse({ type: BannerResponseDto })
  @ApiNotFoundResponse({ description: 'Banner topilmadi' })
  findOne(@Param() { id }: IdParamDto): Promise<BannerResponseDto> {
    return this.bannersService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  @UseInterceptors(IMAGE_FIELDS)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Yangi banner yaratish — har til uchun alohida rasm (admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image_uz', 'image_ru', 'image_en'],
      properties: {
        ...IMAGE_SCHEMA_PROPS,
        title_uz: { type: 'string', example: 'Yozgi chegirmalar' },
        title_ru: { type: 'string', example: 'Летние скидки' },
        title_en: { type: 'string', example: 'Summer Sale' },
        subtitle_uz: { type: 'string', example: "Eng yaxshi narxlar" },
        subtitle_ru: { type: 'string', example: 'Лучшие цены' },
        subtitle_en: { type: 'string', example: 'Best prices' },
        link: { type: 'string', example: 'https://example.com/sale' },
        sort_order: { type: 'integer', default: 0 },
        is_active: { type: 'boolean', default: true },
      },
    },
  })
  @ApiCreatedResponse({ type: BannerResponseDto })
  @ApiUnprocessableEntityResponse({ description: "Rasm turi noto'g'ri yoki hajmi 5MB oshgan" })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  create(
    @UploadedFiles() raw: UploadedBannerFiles,
    @Body() dto: CreateBannerDto,
  ): Promise<BannerResponseDto> {
    return this.bannersService.create(dto, extractFiles(raw ?? {}));
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id')
  @UseInterceptors(IMAGE_FIELDS)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: "Bannerni yangilash — rasmlar ixtiyoriy, faqat yuborilganlari yangilanadi (admin)" })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ...IMAGE_SCHEMA_PROPS,
        title_uz: { type: 'string', example: "Yangilangan sarlavha (o'zbek)" },
        title_ru: { type: 'string', example: 'Обновлённый заголовок (рус)' },
        title_en: { type: 'string', example: 'Updated title (en)' },
        subtitle_uz: { type: 'string', example: "Yangilangan subtitle (o'zbek)" },
        subtitle_ru: { type: 'string', example: 'Обновлённый subtitle (рус)' },
        subtitle_en: { type: 'string', example: 'Updated subtitle (en)' },
        link: { type: 'string', example: 'https://example.com/new' },
        sort_order: { type: 'integer' },
        is_active: { type: 'boolean' },
      },
    },
  })
  @ApiOkResponse({ type: BannerResponseDto })
  @ApiBadRequestResponse({ description: 'Yangilash uchun kamida bitta maydon yoki rasm yuborilishi kerak' })
  @ApiUnprocessableEntityResponse({ description: "Rasm turi noto'g'ri yoki hajmi 5MB oshgan" })
  @ApiNotFoundResponse({ description: 'Banner topilmadi' })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  update(
    @Param() { id }: IdParamDto,
    @Body() dto: UpdateBannerDto,
    @UploadedFiles() raw: UploadedBannerFiles,
  ): Promise<BannerResponseDto> {
    return this.bannersService.update(id, dto, extractFiles(raw ?? {}));
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Bannerni o'chirish — barcha rasmlari ham serverdan o'chiriladi (admin)" })
  @ApiNoContentResponse({ description: "Muvaffaqiyatli o'chirildi" })
  @ApiNotFoundResponse({ description: 'Banner topilmadi' })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  remove(@Param() { id }: IdParamDto): Promise<void> {
    return this.bannersService.remove(id);
  }
}
