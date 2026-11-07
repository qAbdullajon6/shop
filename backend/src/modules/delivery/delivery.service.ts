import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { DeliveryOptionDto } from './dto/delivery-option.dto';

@Injectable()
export class DeliveryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Checkout uchun mavjud yetkazib berish usullari.
   *
   * Narx va bepul chegara shu yerdan keladi — frontend ularni faqat
   * KO'RSATADI, hisoblamaydi. Yakuniy summa baribir POST /orders/preview
   * orqali serverda tasdiqlanadi.
   */
  async findActive(): Promise<DeliveryOptionDto[]> {
    const options = await this.prisma.deliveryOption.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' },
    });

    return options.map((o) => ({
      id: o.id,
      code: o.code,
      name_uz: o.name_uz,
      name_ru: o.name_ru,
      name_en: o.name_en,
      description_uz: o.description_uz,
      description_ru: o.description_ru,
      description_en: o.description_en,
      fee: o.fee.toFixed(2),
      free_threshold: o.free_threshold ? o.free_threshold.toFixed(2) : null,
      min_days: o.min_days,
      max_days: o.max_days,
      requires_address: o.requires_address,
    }));
  }
}
