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
  ApiConflictResponse,
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
import { SlugParamDto } from '../../common/dto/slug-param.dto';
import { RolesGuard } from '../../common/guards';
import { CategoriesService, CategoryFiles } from './categories.service';
import { CATEGORY_MULTER_OPTIONS } from './categories.constants';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

type UploadedCategoryFiles = {
  image_uz?: Express.Multer.File[];
  image_ru?: Express.Multer.File[];
  image_en?: Express.Multer.File[];
};

function extractFiles(raw: UploadedCategoryFiles): CategoryFiles {
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
], CATEGORY_MULTER_OPTIONS);

const IMAGE_SCHEMA_PROPS = {
  image_uz: { type: 'string', format: 'binary', description: "O'zbek tilidagi rasm — JPG, PNG, WEBP, maks 5MB" },
  image_ru: { type: 'string', format: 'binary', description: 'Rus tilidagi rasm — JPG, PNG, WEBP, maks 5MB' },
  image_en: { type: 'string', format: 'binary', description: 'Ingliz tilidagi rasm — JPG, PNG, WEBP, maks 5MB' },
};

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @SkipThrottle()
  @Get()
  @ApiOperation({ summary: 'Barcha aktiv kategoriyalar (ommaviy)' })
  @ApiOkResponse({ type: [CategoryResponseDto] })
  findAll(): Promise<CategoryResponseDto[]> {
    return this.categoriesService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @SkipThrottle()
  @Get('all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Barcha kategoriyalar — nofaollar ham (admin)' })
  @ApiOkResponse({ type: [CategoryResponseDto] })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  findAllAdmin(): Promise<CategoryResponseDto[]> {
    return this.categoriesService.findAllAdmin();
  }

  @Public()
  @SkipThrottle()
  @Get(':slug')
  @ApiOperation({ summary: "Kategoriyani slug bo'yicha olish" })
  @ApiOkResponse({ type: CategoryResponseDto })
  @ApiNotFoundResponse({ description: 'Kategoriya topilmadi' })
  findOne(@Param() { slug }: SlugParamDto): Promise<CategoryResponseDto> {
    return this.categoriesService.findBySlug(slug);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  @UseInterceptors(IMAGE_FIELDS)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Yangi kategoriya yaratish — har til uchun alohida rasm (admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name_uz', 'name_ru', 'name_en'],
      properties: {
        ...IMAGE_SCHEMA_PROPS,
        name_uz: { type: 'string', example: 'Laptoplar' },
        name_ru: { type: 'string', example: 'Ноутбуки' },
        name_en: { type: 'string', example: 'Laptops' },
        slug: { type: 'string', example: 'laptoplar' },
        description_uz: { type: 'string', example: "Barcha turdagi laptoplar" },
        description_ru: { type: 'string', example: 'Все виды ноутбуков' },
        description_en: { type: 'string', example: 'All kinds of laptops' },
        parent_id: { type: 'string', example: 'clx1234abc' },
        sort_order: { type: 'integer', default: 0 },
        is_active: { type: 'boolean', default: true },
      },
    },
  })
  @ApiCreatedResponse({ type: CategoryResponseDto })
  @ApiUnprocessableEntityResponse({ description: "Rasm turi noto'g'ri yoki hajmi 5MB oshgan" })
  @ApiConflictResponse({ description: 'Slug allaqachon mavjud' })
  @ApiNotFoundResponse({ description: 'Ota-kategoriya topilmadi' })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  create(
    @UploadedFiles() raw: UploadedCategoryFiles,
    @Body() dto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.create(dto, extractFiles(raw ?? {}));
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id')
  @UseInterceptors(IMAGE_FIELDS)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: "Kategoriyani yangilash — rasmlar ixtiyoriy, faqat yuborilganlari yangilanadi (admin)" })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ...IMAGE_SCHEMA_PROPS,
        name_uz: { type: 'string', example: "Yangi nom (o'zbek)" },
        name_ru: { type: 'string', example: 'Новое название (рус)' },
        name_en: { type: 'string', example: 'New name (en)' },
        slug: { type: 'string', example: 'yangi-nom' },
        description_uz: { type: 'string' },
        description_ru: { type: 'string' },
        description_en: { type: 'string' },
        parent_id: { type: 'string' },
        sort_order: { type: 'integer' },
        is_active: { type: 'boolean' },
      },
    },
  })
  @ApiOkResponse({ type: CategoryResponseDto })
  @ApiBadRequestResponse({ description: 'Yangilash uchun kamida bitta maydon yoki rasm yuborilishi kerak' })
  @ApiUnprocessableEntityResponse({ description: "Rasm turi noto'g'ri yoki hajmi 5MB oshgan" })
  @ApiNotFoundResponse({ description: 'Kategoriya yoki ota-kategoriya topilmadi' })
  @ApiConflictResponse({ description: 'Slug allaqachon mavjud' })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  update(
    @Param() { id }: IdParamDto,
    @Body() dto: UpdateCategoryDto,
    @UploadedFiles() raw: UploadedCategoryFiles,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.update(id, dto, extractFiles(raw ?? {}));
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Kategoriyani o'chirish — barcha rasmlari ham serverdan o'chiriladi (admin)" })
  @ApiNoContentResponse({ description: "Muvaffaqiyatli o'chirildi" })
  @ApiNotFoundResponse({ description: 'Kategoriya topilmadi' })
  @ApiConflictResponse({ description: 'Pastki kategoriyalar yoki mahsulotlar mavjud' })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  remove(@Param() { id }: IdParamDto): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
