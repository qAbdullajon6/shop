import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { STORAGE_PROVIDER } from '../../common/storage/storage.types';
import type { StorageProvider } from '../../common/storage/storage.types';

/**
 * Mahsulot rasmlari bilan ishlash: DB yozuvlari + fayl tizimi.
 *
 * Fayl amallari asinxron (`fs/promises`) — ilgari `fs.unlinkSync` so'rov
 * oqimini bloklardi. Fayl o'chirish xatosi hech qachon so'rovni yiqitmaydi:
 * yetim fayl yomon, lekin yetim DB yozuvi undan battar.
 */
@Injectable()
export class ProductMediaService {
  private readonly logger = new Logger(ProductMediaService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  /**
   * Yuklangan fayllarni mahsulot galereyasiga qo'shadi.
   * Mahsulotda hali rasm bo'lmasa, birinchisi asosiy rasm bo'ladi.
   */
  async attachImages(
    productId: string,
    files: Express.Multer.File[],
    variantId?: string,
  ): Promise<void> {
    if (files.length === 0) return;

    const existingCount = await this.prisma.productImage.count({
      where: { product_id: productId },
    });

    // Har bir faylni doimiy omborga o'tkazamiz (local: nisbiy yo'l; S3: URL).
    const urls = await Promise.all(
      files.map((file) => this.storage.persist(file, 'products')),
    );

    await this.prisma.productImage.createMany({
      data: files.map((file, index) => ({
        product_id: productId,
        variant_id: variantId ?? null,
        url: urls[index],
        // `product_images_one_primary_per_product` qisman unique indeksi
        // ikkinchi asosiy rasmga yo'l qo'ymaydi.
        is_primary: existingCount === 0 && index === 0,
        sort_order: existingCount + index,
      })),
    });
  }

  /** Rasmni o'chiradi (DB + fayl). */
  async removeImage(productId: string, imageId: string): Promise<void> {
    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, product_id: productId },
    });

    if (!image) {
      throw new NotFoundException('Rasm topilmadi yoki bu mahsulotga tegishli emas');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.productImage.delete({ where: { id: imageId } });

      // Asosiy rasm o'chirilsa mahsulot rasmsiz qolmasligi uchun
      // keyingisini asosiy qilamiz.
      if (image.is_primary) {
        const next = await tx.productImage.findFirst({
          where: { product_id: productId },
          orderBy: { sort_order: 'asc' },
        });

        if (next) {
          await tx.productImage.update({
            where: { id: next.id },
            data: { is_primary: true },
          });
        }
      }
    });

    await this.deleteFiles([image.url]);
  }

  /** Boshqa rasmni asosiy qilib belgilaydi. */
  async setPrimary(productId: string, imageId: string): Promise<void> {
    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, product_id: productId },
      select: { id: true },
    });

    if (!image) throw new NotFoundException('Rasm topilmadi');

    await this.prisma.$transaction([
      // Avval hammasini bekor qilamiz — qisman unique indeks ikkita
      // asosiy rasmga ruxsat bermaydi, tartib muhim.
      this.prisma.productImage.updateMany({
        where: { product_id: productId, is_primary: true },
        data: { is_primary: false },
      }),
      this.prisma.productImage.update({
        where: { id: imageId },
        data: { is_primary: true },
      }),
    ]);
  }

  /** Galereya tartibini o'zgartiradi. */
  async reorder(productId: string, imageIds: string[]): Promise<void> {
    const images = await this.prisma.productImage.findMany({
      where: { product_id: productId },
      select: { id: true },
    });

    const owned = new Set(images.map((i) => i.id));
    const invalid = imageIds.filter((id) => !owned.has(id));

    if (invalid.length > 0) {
      throw new NotFoundException('Ba\'zi rasmlar bu mahsulotga tegishli emas');
    }

    await this.prisma.$transaction(
      imageIds.map((id, index) =>
        this.prisma.productImage.update({
          where: { id },
          data: { sort_order: index },
        }),
      ),
    );
  }

  /**
   * Diskdagi fayllarni o'chiradi.
   *
   * Faqat `uploads/` ichidagi nisbiy yo'llar qabul qilinadi — path traversal
   * (`../../etc/passwd`) yoki tashqi URL berilgan bo'lsa o'tkazib yuboriladi.
   */
  async deleteFiles(urls: string[]): Promise<void> {
    // Ombor provayderi local (nisbiy yo'l) va S3 (URL) havolalarini o'zi ajratadi;
    // path-traversal va tashqi URL himoyasi provayder ichida.
    await Promise.all(urls.filter(Boolean).map((url) => this.storage.remove(url)));
  }
}
