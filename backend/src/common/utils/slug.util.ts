import { BadRequestException } from '@nestjs/common';

/**
 * Kirill va o'zbek diakritik harflarini lotin ASCII ga o'giradi.
 *
 * Eski `generateSlug` ASCII bo'lmagan hamma narsani tashlab yuborardi, ya'ni
 * "Духи для мужчин" yoki "Xushbo'y sham" kabi nomlar bo'sh slug berib
 * BadRequestException ga olib kelardi.
 */
const TRANSLITERATION: Record<string, string> = {
  // Kirill (rus/o'zbek)
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  ў: 'o', қ: 'q', ғ: 'g', ҳ: 'h',
  // O'zbek lotin diakritiklari
  ō: 'o', ğ: 'g', ş: 's', ç: 'c', ı: 'i', ü: 'u', ö: 'o', ä: 'a',
  // Umumiy lotin diakritiklari
  á: 'a', à: 'a', â: 'a', ã: 'a', å: 'a',
  é: 'e', è: 'e', ê: 'e', ë: 'e',
  í: 'i', ì: 'i', î: 'i', ï: 'i',
  ó: 'o', ò: 'o', ô: 'o', õ: 'o',
  ú: 'u', ù: 'u', û: 'u',
  ñ: 'n', ý: 'y', ÿ: 'y', æ: 'ae', ø: 'o', ß: 'ss',
};

/**
 * Matndan URL uchun xavfsiz slug yasaydi.
 *
 * @throws BadRequestException — natija bo'sh bo'lsa (masalan matn faqat
 *   belgilardan iborat bo'lsa). Chaqiruvchi slug'ni qo'lda berishi kerak.
 */
export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .trim()
    // O'zbek tutuq belgilari — tire emas, butunlay olib tashlanadi:
    // "Xushbo'y" → "xushboy", "xushbo-y" emas.
    .replace(/['’ʻʼ`]/g, '')
    .split('')
    .map((char) => TRANSLITERATION[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!slug) {
    throw new BadRequestException(
      "Nom asosida slug yaratib bo'lmadi — iltimos slug'ni qo'lda kiriting",
    );
  }

  return slug;
}

/** Slug band bo'lsa oxiriga raqam qo'shadi: `dior-sauvage-2`. */
export function uniqueSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;

  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix++;

  return `${base}-${suffix}`;
}
