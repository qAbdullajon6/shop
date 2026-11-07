/**
 * Fayl saqlash provayderi abstraksiyasi.
 *
 * Ikkita amalga oshirish:
 *   • LocalStorageProvider — diskdagi ./uploads (dev + persistent-volume prod)
 *   • S3StorageProvider     — S3-mos obyekt ombori (ephemeral hosting uchun)
 *
 * DB'da saqlanadigan qiymat provayderga bog'liq:
 *   • Local → nisbiy yo'l:  "uploads/products/<uuid>.jpg"
 *   • S3    → to'liq URL:    "https://cdn.../products/<uuid>.jpg"
 *
 * Frontend `imgUrl()` ikkalasini ham to'g'ri ochadi (http bilan boshlansa —
 * o'zgartirilmaydi; aks holda BACKEND_ORIGIN qo'shiladi). Shu sabab provayderni
 * almashtirish uchun frontendni yoki mavjud ma'lumotni ko'chirish shart emas.
 */
export interface StorageProvider {
  /**
   * Multer vaqtinchalik faylini doimiy omborga o'tkazadi va DB'da saqlanadigan
   * havolani (nisbiy yo'l yoki to'liq URL) qaytaradi.
   */
  persist(file: Express.Multer.File, subdirectory: string): Promise<string>;

  /**
   * Saqlangan havola (DB qiymati) bo'yicha faylni o'chiradi. Xatolik yutiladi —
   * yo'q fayl muammo emas.
   */
  remove(storedReference: string): Promise<void>;

  /** Diagnostika/loglar uchun provayder nomi. */
  readonly name: 'local' | 's3';
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
