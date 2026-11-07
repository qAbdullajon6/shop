import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { User } from '../../../generated/prisma/client';

import { CurrentUser } from '../../common/decorators';
import { ProductIdParamDto } from '../../common/dto/product-id-param.dto';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { WishlistResponseDto } from './dto/wishlist-response.dto';
import { WishlistService } from './wishlist.service';

@ApiTags('Wishlist')
@ApiBearerAuth()
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @SkipThrottle()
  @Get()
  @ApiOperation({ summary: "Foydalanuvchi wishlistini ko'rish" })
  @ApiOkResponse({ type: WishlistResponseDto })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  getWishlist(@CurrentUser() user: User): Promise<WishlistResponseDto> {
    return this.wishlistService.getWishlist(user.id);
  }

  @Post('items')
  @ApiOperation({
    summary: "Sevimlilarga mahsulot qo'shish (idempotent)",
  })
  @ApiCreatedResponse({ type: WishlistResponseDto })
  @ApiNotFoundResponse({ description: 'Mahsulot topilmadi yoki nofaol' })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  addItem(
    @CurrentUser() user: User,
    @Body() dto: AddWishlistItemDto,
  ): Promise<WishlistResponseDto> {
    return this.wishlistService.addItem(user.id, dto);
  }

  @Delete('items/:productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Wishlistdan mahsulot o'chirish" })
  @ApiOkResponse({ type: WishlistResponseDto })
  @ApiNotFoundResponse({ description: 'Mahsulot wishlistda topilmadi' })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  removeItem(
    @CurrentUser() user: User,
    @Param() { productId }: ProductIdParamDto,
  ): Promise<WishlistResponseDto> {
    return this.wishlistService.removeItem(user.id, productId);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Wishlistni to'liq tozalash" })
  @ApiOkResponse({ type: WishlistResponseDto, description: "Bo'sh wishlist qaytariladi" })
  @ApiUnauthorizedResponse({ description: 'Access token yaroqsiz' })
  clearWishlist(@CurrentUser() user: User): Promise<WishlistResponseDto> {
    return this.wishlistService.clearWishlist(user.id);
  }
}
