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
  ApiTags,
} from '@nestjs/swagger';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { Role } from '../../../generated/prisma/client';
import type { User } from '../../../generated/prisma/client';

import { CurrentUser, Public, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { IdParamDto } from '../../common/dto/id-param.dto';
import { ProductIdParamDto } from '../../common/dto/product-id-param.dto';
import { AdminReviewQueryDto } from './dto/admin-review-query.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { ModerateReviewDto, VoteReviewDto } from './dto/moderate-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import {
  PaginatedReviewsResponseDto,
  PendingReviewDto,
  ProductRatingSummaryDto,
  ReviewResponseDto,
  ReviewVoteResponseDto,
} from './dto/review-response.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // ─── Ommaviy ───────────────────────────────────────────────────────────────

  @Public()
  @SkipThrottle()
  @Get()
  @ApiOperation({
    summary: 'Mahsulot sharhlari',
    description: 'Faqat moderatsiyadan o\'tgan (APPROVED) sharhlar qaytariladi.',
  })
  @ApiOkResponse({ type: PaginatedReviewsResponseDto })
  findByProduct(@Query() query: ReviewQueryDto): Promise<PaginatedReviewsResponseDto> {
    return this.reviewsService.findByProduct(query);
  }

  @Public()
  @SkipThrottle()
  @Get('summary/:productId')
  @ApiOperation({
    summary: 'Mahsulot baholarining xulosasi',
    description: "O'rtacha baho, yulduzlar taqsimoti va o'lchamli baholar.",
  })
  @ApiOkResponse({ type: ProductRatingSummaryDto })
  @ApiNotFoundResponse({ description: 'Mahsulot topilmadi' })
  getSummary(@Param() { productId }: ProductIdParamDto): Promise<ProductRatingSummaryDto> {
    return this.reviewsService.getRatingSummary(productId);
  }

  // ─── Mijoz ─────────────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @Get('pending')
  @ApiOperation({
    summary: 'Baho kutayotgan xaridlarim',
    description:
      "Yetkazib berilgan, lekin hali baholanmagan xaridlar. Profil sahifasi " +
      "«Buyurtmangiz yetkazib berildi. Mahsulotni baholashni xohlaysizmi?» " +
      'taklifini shu ro\'yxatdan quradi.',
  })
  @ApiOkResponse({ type: [PendingReviewDto] })
  findPending(@CurrentUser() user: User): Promise<PendingReviewDto[]> {
    return this.reviewsService.findPendingReviews(user.id);
  }

  @ApiBearerAuth()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post()
  @ApiOperation({
    summary: 'Tasdiqlangan xarid uchun baho qoldirish',
    description:
      'Server mustaqil ravishda tekshiradi: (1) xarid qatori shu mijozniki, ' +
      "(2) buyurtma DELIVERED holatida, (3) bu qatorga hali sharh yozilmagan. " +
      'Frontend tekshiruviga tayanilmaydi.',
  })
  @ApiCreatedResponse({ type: ReviewResponseDto })
  @ApiBadRequestResponse({ description: 'Allaqachon baho berilgan' })
  @ApiForbiddenResponse({ description: 'Buyurtma hali yetkazilmagan' })
  @ApiNotFoundResponse({ description: 'Xarid topilmadi' })
  create(
    @CurrentUser() user: User,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.create(user.id, dto);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({
    summary: "O'z bahomni tahrirlash",
    description: 'Tahrirlangan sharh qayta moderatsiyadan o\'tadi.',
  })
  @ApiOkResponse({ type: ReviewResponseDto })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  update(
    @CurrentUser() user: User,
    @Param() { id }: IdParamDto,
    @Body() dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.update(user.id, id, dto);
  }

  @ApiBearerAuth()
  @Post(':id/helpful')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sharhni foydali deb belgilash' })
  @ApiOkResponse({ type: ReviewVoteResponseDto })
  @ApiBadRequestResponse({ description: "O'z sharhiga ovoz berish mumkin emas" })
  vote(
    @CurrentUser() user: User,
    @Param() { id }: IdParamDto,
    @Body() dto: VoteReviewDto,
  ): Promise<ReviewVoteResponseDto> {
    return this.reviewsService.vote(user.id, id, dto.is_helpful ?? true);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Bahoni o'chirish — egasi yoki admin" })
  @ApiNoContentResponse({ description: "Muvaffaqiyatli o'chirildi" })
  @ApiForbiddenResponse({ description: 'Ruxsat etilmagan' })
  remove(@CurrentUser() user: User, @Param() { id }: IdParamDto): Promise<void> {
    return this.reviewsService.remove(user.id, user.role as Role, id);
  }

  // ─── Admin ─────────────────────────────────────────────────────────────────

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('admin/all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Barcha sharhlar — moderatsiya uchun' })
  @ApiOkResponse({ type: PaginatedReviewsResponseDto })
  findAllAdmin(@Query() query: AdminReviewQueryDto): Promise<PaginatedReviewsResponseDto> {
    return this.reviewsService.findAllAdmin(query);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id/moderate')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Sharhni tasdiqlash yoki rad etish (admin)',
    description: "Holat o'zgarganda mahsulotning o'rtacha bahosi qayta hisoblanadi.",
  })
  @ApiOkResponse({ type: ReviewResponseDto })
  @ApiNotFoundResponse({ description: 'Baho topilmadi' })
  moderate(
    @Param() { id }: IdParamDto,
    @Body() dto: ModerateReviewDto,
    @CurrentUser() moderator: User,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.moderate(id, dto, moderator.id);
  }
}
