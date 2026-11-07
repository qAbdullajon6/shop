import { Prisma } from '../../../generated/prisma/client';

/**
 * Decimal qabul qiladigan qiymat turlari. Prisma 7 da `Prisma.Decimal.Value`
 * nomlar fazosi eksport qilinmaydi, shuning uchun uni bu yerda ochiq yozamiz.
 */
export type DecimalInput = string | number | Prisma.Decimal;

/**
 * Pul hisob-kitobi.
 *
 * Barcha summalar Prisma `Decimal` orqali hisoblanadi — `number` ustida
 * ishlash suzuvchi nuqta xatolarini keltirib chiqaradi (0.1 + 0.2 !== 0.3),
 * bu esa buyurtma jamlanmasida tiyin farqlariga olib keladi.
 */
export type Money = Prisma.Decimal;

export const ZERO: Money = new Prisma.Decimal(0);

export function money(value: DecimalInput): Money {
  return new Prisma.Decimal(value);
}

export function add(...values: DecimalInput[]): Money {
  return values.reduce<Money>((sum, v) => sum.add(new Prisma.Decimal(v)), ZERO);
}

export function subtract(a: DecimalInput, b: DecimalInput): Money {
  return new Prisma.Decimal(a).sub(new Prisma.Decimal(b));
}

export function multiply(a: DecimalInput, b: DecimalInput): Money {
  return new Prisma.Decimal(a).mul(new Prisma.Decimal(b));
}

/** Ikki kasr xonagacha yaxlitlaydi (DECIMAL(12,2) ustuniga mos). */
export function round(value: DecimalInput): Money {
  return new Prisma.Decimal(value).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

export function isNegative(value: DecimalInput): boolean {
  return new Prisma.Decimal(value).isNegative();
}

export function gte(a: DecimalInput, b: DecimalInput): boolean {
  return new Prisma.Decimal(a).gte(new Prisma.Decimal(b));
}

export function gt(a: DecimalInput, b: DecimalInput): boolean {
  return new Prisma.Decimal(a).gt(new Prisma.Decimal(b));
}

/** Ikkitasidan kichigini qaytaradi — chegirma yuqori chegarasi uchun. */
export function min(a: DecimalInput, b: DecimalInput): Money {
  const da = new Prisma.Decimal(a);
  const db = new Prisma.Decimal(b);
  return da.lte(db) ? da : db;
}

/** API javoblarida Decimal doim satr sifatida uzatiladi — aniqlik yo'qolmasligi uchun. */
export function toApiString(value: DecimalInput | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  return new Prisma.Decimal(value).toFixed(2);
}

/**
 * Chegirma foizi (butun son). compare_at_price bo'lmasa null.
 * Masalan 1 000 000 → 750 000 = 25%.
 */
export function discountPercent(
  price: DecimalInput,
  compareAtPrice: DecimalInput | null | undefined,
): number | null {
  if (compareAtPrice === null || compareAtPrice === undefined) return null;

  const p = new Prisma.Decimal(price);
  const c = new Prisma.Decimal(compareAtPrice);
  if (c.lte(p) || c.isZero()) return null;

  return c.sub(p).div(c).mul(100).toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP).toNumber();
}
