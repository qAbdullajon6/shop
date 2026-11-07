import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '../../../generated/prisma/client';

/**
 * Buyurtma holatlari o'tish jadvali.
 *
 * Eski implementatsiyada har qanday holatdan har qanday holatga o'tish mumkin
 * edi. Bu zaxirani buzardi: CANCELLED ga o'tishda zaxira qaytariladi, so'ng
 * CANCELLED → DELIVERED ga o'tganda qayta ayirilmaydi, natijada ombor
 * ma'lumoti abadiy noto'g'ri bo'lib qoladi.
 *
 * Endi ruxsat etilgan o'tishlar aniq ro'yxatda va zaxira samarasi
 * `stockEffectOf` orqali bir joyda hisoblanadi.
 */
export const ORDER_TRANSITIONS: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.READY_FOR_DELIVERY, OrderStatus.CANCELLED],
  [OrderStatus.READY_FOR_DELIVERY]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [OrderStatus.RETURNED],
  // Yakuniy holatlar — bu yerdan chiqish yo'q.
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.RETURNED]: [],
};

/** Mijoz o'zi bekor qila oladigan holatlar — yig'ilishdan oldin. */
export const CUSTOMER_CANCELLABLE: readonly OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
];

/** Zaxira ayirilgan holatlar — buyurtma hali "faol". */
const STOCK_HELD: readonly OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.READY_FOR_DELIVERY,
  OrderStatus.OUT_FOR_DELIVERY,
];

/** Zaxira mijozga o'tib bo'lgan — qaytarish yo'q (RETURNED bundan mustasno). */
const STOCK_CONSUMED: readonly OrderStatus[] = [OrderStatus.DELIVERED];

export function isTerminal(status: OrderStatus): boolean {
  return ORDER_TRANSITIONS[status].length === 0;
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from].includes(to);
}

/**
 * O'tish ruxsat etilganini tekshiradi, aks holda tushunarli xato tashlaydi.
 */
export function assertTransition(from: OrderStatus, to: OrderStatus): void {
  if (from === to) {
    throw new BadRequestException(`Buyurtma allaqachon "${from}" holatida`);
  }

  if (!canTransition(from, to)) {
    const allowed = ORDER_TRANSITIONS[from];
    throw new BadRequestException(
      allowed.length === 0
        ? `"${from}" yakuniy holat — uni o'zgartirib bo'lmaydi`
        : `"${from}" holatidan "${to}" ga o'tib bo'lmaydi. ` +
          `Ruxsat etilgan holatlar: ${allowed.join(', ')}`,
    );
  }
}

export type StockEffect = 'RELEASE' | 'RESERVE' | 'NONE';

/**
 * Holat o'tishida zaxira bilan nima qilish kerakligini aniqlaydi.
 *
 *   RELEASE — zaxirani omborga qaytarish (bekor qilish / qaytarilgan tovar)
 *   RESERVE — zaxirani qayta ayirish (yakuniy holatdan qaytish, hozircha yo'q)
 *   NONE    — zaxira o'zgarmaydi
 *
 * Muhim: zaxira faqat BIR MARTA qaytariladi. STOCK_HELD → CANCELLED va
 * DELIVERED → RETURNED ikkalasi ham RELEASE, lekin ular bir-biriga o'tolmaydi,
 * shuning uchun ikki marta qaytarish mumkin emas.
 */
export function stockEffectOf(from: OrderStatus, to: OrderStatus): StockEffect {
  const wasHeld = STOCK_HELD.includes(from);
  const wasConsumed = STOCK_CONSUMED.includes(from);
  const isHeld = STOCK_HELD.includes(to);
  const isConsumed = STOCK_CONSUMED.includes(to);

  // Faol buyurtma bekor qilindi → zaxira omborga qaytadi.
  if (wasHeld && !isHeld && !isConsumed) return 'RELEASE';

  // Yetkazilgan tovar qaytarildi → zaxira omborga qaytadi.
  if (wasConsumed && !isConsumed && !isHeld) return 'RELEASE';

  // Zaxira ushlab turilmagan holatdan faol holatga qaytish → qayta ayirish.
  if (!wasHeld && !wasConsumed && isHeld) return 'RESERVE';

  return 'NONE';
}

/** Bu holatga o'tish mijozga sharh yozish huquqini ochadimi. */
export function unlocksReview(to: OrderStatus): boolean {
  return to === OrderStatus.DELIVERED;
}
