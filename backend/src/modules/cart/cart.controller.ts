import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { User } from '../../../generated/prisma/client';

import { CurrentUser, CurrentUserOptional, OptionalAuth } from '../../common/decorators';
import { VariantIdParamDto } from '../../common/dto/variant-id-param.dto';
import { CartOwner, CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { SyncCartDto } from './dto/sync-cart.dto';
import { CartResponseDto } from './dto/cart-response.dto';

const CART_TOKEN_HEADER = 'x-cart-token';

@ApiTags('Cart')
@ApiHeader({
  name: 'X-Cart-Token',
  required: false,
  description:
    "Mehmon savati identifikatori. Login qilmagan mijoz birinchi so'rovda " +
    "uni bo'sh qoldiradi, javobdagi `session_token` ni saqlab, keyingi " +
    "so'rovlarda yuboradi.",
})
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @OptionalAuth()
  @SkipThrottle()
  @Get()
  @ApiOperation({
    summary: "Savatni ko'rish",
    description: 'Login qilingan bo\'lsa foydalanuvchi savati, aks holda mehmon savati.',
  })
  @ApiOkResponse({ type: CartResponseDto })
  getCart(
    @CurrentUserOptional() user: User | null,
    @Headers(CART_TOKEN_HEADER) cartToken?: string,
  ): Promise<CartResponseDto> {
    return this.cartService.getCart(this.resolveOwner(user, cartToken));
  }

  @OptionalAuth()
  @Post('items')
  @ApiOperation({
    summary: "Savatga mahsulot qo'shish",
    description:
      "Mahsulot allaqachon savatda bo'lsa MIQDOR oshadi — yangi qator " +
      "yaratilmaydi. Ya'ni 5 dona mahsulot bitta qator bo'lib qoladi.",
  })
  @ApiCreatedResponse({ type: CartResponseDto })
  @ApiNotFoundResponse({ description: 'Mahsulot topilmadi yoki sotuvda emas' })
  addItem(
    @CurrentUserOptional() user: User | null,
    @Body() dto: AddCartItemDto,
    @Headers(CART_TOKEN_HEADER) cartToken?: string,
  ): Promise<CartResponseDto> {
    return this.cartService.addItem(this.resolveOwner(user, cartToken), dto);
  }

  @OptionalAuth()
  @Patch('items/:variantId')
  @ApiOperation({ summary: "Miqdorni o'rnatish (absolyut qiymat)" })
  @ApiOkResponse({ type: CartResponseDto })
  @ApiNotFoundResponse({ description: 'Mahsulot savatda topilmadi' })
  updateItem(
    @CurrentUserOptional() user: User | null,
    @Param() { variantId }: VariantIdParamDto,
    @Body() dto: UpdateCartItemDto,
    @Headers(CART_TOKEN_HEADER) cartToken?: string,
  ): Promise<CartResponseDto> {
    return this.cartService.updateItem(this.resolveOwner(user, cartToken), variantId, dto);
  }

  @OptionalAuth()
  @Delete('items/:variantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Savatdan mahsulotni olib tashlash" })
  @ApiOkResponse({ type: CartResponseDto })
  removeItem(
    @CurrentUserOptional() user: User | null,
    @Param() { variantId }: VariantIdParamDto,
    @Headers(CART_TOKEN_HEADER) cartToken?: string,
  ): Promise<CartResponseDto> {
    return this.cartService.removeItem(this.resolveOwner(user, cartToken), variantId);
  }

  @OptionalAuth()
  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Savatni tozalash" })
  @ApiOkResponse({ type: CartResponseDto })
  clearCart(
    @CurrentUserOptional() user: User | null,
    @Headers(CART_TOKEN_HEADER) cartToken?: string,
  ): Promise<CartResponseDto> {
    return this.cartService.clearCart(this.resolveOwner(user, cartToken));
  }

  @ApiBearerAuth()
  @Post('merge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mehmon savatini hisobga birlashtirish (login paytida)',
    description:
      'Miqdorlar QO\'SHILADI (zaxira chegarasigacha). Ilgari bu ' +
      'max(mavjud, kelgan) edi va farq jimgina yo\'qolardi.',
  })
  @ApiOkResponse({ type: CartResponseDto })
  mergeGuestCart(
    @CurrentUser() user: User,
    @Headers(CART_TOKEN_HEADER) cartToken: string,
  ): Promise<CartResponseDto> {
    return this.cartService.mergeGuestCart(user.id, cartToken);
  }

  @ApiBearerAuth()
  @Post('sync')
  @ApiOperation({
    summary: 'LocalStorage savatini serverga yuklash (eski mijozlar uchun)',
    description:
      "Yangi mijozlar mehmon savati (X-Cart-Token) va /cart/merge dan " +
      'foydalanadi. Bu endpoint moslik uchun saqlangan.',
  })
  @ApiOkResponse({ type: CartResponseDto })
  syncCart(@CurrentUser() user: User, @Body() dto: SyncCartDto): Promise<CartResponseDto> {
    return this.cartService.syncCart(user.id, dto);
  }

  /**
   * Savat egasini aniqlaydi.
   *
   * Login qilingan foydalanuvchi DOIM o'z savatiga ega bo'ladi — mijoz
   * yuborgan `X-Cart-Token` e'tiborga olinmaydi, aks holda boshqa
   * odamning mehmon savatini o'qish mumkin bo'lardi.
   */
  private resolveOwner(user: User | null, cartToken?: string): CartOwner {
    if (user) return { userId: user.id };

    return {
      sessionToken: cartToken?.trim() || this.cartService.createGuestToken(),
    };
  }
}
