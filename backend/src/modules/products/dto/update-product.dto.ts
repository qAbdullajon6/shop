import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

/**
 * Mahsulotni yangilash.
 *
 * `variants` bu yerda yo'q — variantlar alohida endpointlar orqali
 * boshqariladi (POST/PATCH/DELETE /products/:id/variants). Ilgari
 * variantlarni yangilashning umuman imkoni yo'q edi: `update()` ularni
 * e'tiborsiz qoldirardi, ya'ni admin narx yoki zaxirani o'zgartira olmasdi.
 */
export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['variants'] as const),
) {}
