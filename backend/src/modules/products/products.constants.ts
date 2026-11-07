import { createUploadOptions } from '../../common/upload/upload.factory';

export const PRODUCT_MAX_FILES = 10;
export const PRODUCT_MAX_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Mahsulot rasmlari uchun yuklash sozlamalari.
 *
 * Ilgari bu yerdagi 5MB doimiysi multer'ga uzatilmasdan qolib ketgan edi —
 * `createUploadOptions` endi uni haqiqiy `limits` ga aylantiradi.
 */
export const PRODUCT_MULTER_OPTIONS = createUploadOptions({
  subdirectory: 'products',
  maxSizeBytes: PRODUCT_MAX_SIZE_BYTES,
  maxFiles: PRODUCT_MAX_FILES,
});
