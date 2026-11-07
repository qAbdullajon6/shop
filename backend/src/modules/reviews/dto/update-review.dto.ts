import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateReviewDto } from './create-review.dto';

/**
 * Sharhni tahrirlash. `order_item_id` o'zgartirilmaydi — sharh doimo
 * yaratilgan xaridga bog'liq qoladi.
 */
export class UpdateReviewDto extends PartialType(
  OmitType(CreateReviewDto, ['order_item_id'] as const),
) {}
