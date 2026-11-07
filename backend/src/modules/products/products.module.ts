import { Module } from '@nestjs/common';

import { ProductMediaService } from './product-media.service';
import { ProductsAdminService } from './products-admin.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

/**
 * Mahsulotlar moduli uch servisga bo'lingan:
 *   • ProductsService      — katalogni o'qish (filtr, saralash, sahifalash)
 *   • ProductsAdminService — CRUD, variantlar, denormalizatsiya
 *   • ProductMediaService  — rasmlar (DB + fayl tizimi)
 *
 * Ilgari bularning barchasi 778 qatorlik bitta faylda edi.
 */
@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductsAdminService, ProductMediaService],
  exports: [ProductsService, ProductsAdminService, ProductMediaService],
})
export class ProductsModule {}
