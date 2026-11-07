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
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Role } from '../../../generated/prisma/client';

import { Public, Roles } from '../../common/decorators';
import { IdParamDto } from '../../common/dto/id-param.dto';
import { RolesGuard } from '../../common/guards';
import { CategoryAttributesService } from './category-attributes.service';
import { CategoryAttributeResponseDto } from './dto/category-attribute-response.dto';
import { CreateCategoryAttributeDto } from './dto/create-category-attribute.dto';
import { UpdateCategoryAttributeDto } from './dto/update-category-attribute.dto';

@ApiTags('Category Attributes')
@Controller('category-attributes')
export class CategoryAttributesController {
  constructor(private readonly service: CategoryAttributesService) {}

  @Public()
  @SkipThrottle()
  @Get()
  @ApiOperation({ summary: "Kategoriya xususiyatlarini ko'rish (foydalanuvchi)" })
  @ApiQuery({ name: 'category_id', required: true, description: 'Kategoriya ID' })
  @ApiOkResponse({ type: [CategoryAttributeResponseDto] })
  @ApiNotFoundResponse({ description: 'Kategoriya topilmadi' })
  findByCategory(
    @Query('category_id') categoryId: string,
  ): Promise<CategoryAttributeResponseDto[]> {
    return this.service.findByCategory(categoryId);
  }

  @Public()
  @SkipThrottle()
  @Get(':id')
  @ApiOperation({ summary: "Xususiyatni ID bo'yicha olish" })
  @ApiOkResponse({ type: CategoryAttributeResponseDto })
  @ApiNotFoundResponse({ description: 'Xususiyat topilmadi' })
  findOne(@Param() { id }: IdParamDto): Promise<CategoryAttributeResponseDto> {
    return this.service.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  @Post()
  @ApiOperation({ summary: 'Yangi xususiyat yaratish (admin)' })
  @ApiCreatedResponse({ type: CategoryAttributeResponseDto })
  @ApiBadRequestResponse({ description: "Noto'g'ri ma'lumotlar" })
  @ApiNotFoundResponse({ description: 'Kategoriya topilmadi' })
  create(@Body() dto: CreateCategoryAttributeDto): Promise<CategoryAttributeResponseDto> {
    return this.service.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  @Patch(':id')
  @ApiOperation({ summary: 'Xususiyatni yangilash (admin)' })
  @ApiOkResponse({ type: CategoryAttributeResponseDto })
  @ApiBadRequestResponse({ description: 'Yangilash uchun kamida bitta maydon yuborilishi kerak' })
  @ApiNotFoundResponse({ description: 'Xususiyat topilmadi' })
  update(
    @Param() { id }: IdParamDto,
    @Body() dto: UpdateCategoryAttributeDto,
  ): Promise<CategoryAttributeResponseDto> {
    return this.service.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Xususiyatni o'chirish (admin)" })
  @ApiNoContentResponse({ description: "Muvaffaqiyatli o'chirildi" })
  @ApiNotFoundResponse({ description: 'Xususiyat topilmadi' })
  remove(@Param() { id }: IdParamDto): Promise<void> {
    return this.service.remove(id);
  }
}
