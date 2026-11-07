import { Module } from '@nestjs/common';

import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

/**
 * Sharhlar moduli endi mustaqil: huquq tekshiruvi shu yerda, OrdersService'da
 * emas. Ilgari `hasDeliveredOrderForProduct` buyurtmalar servisida yashirin edi
 * va ikki modulni keraksiz bog'lab turardi.
 */
@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
