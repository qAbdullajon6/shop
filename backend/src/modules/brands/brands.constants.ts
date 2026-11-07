import {
  ALLOWED_IMAGE_MIMES,
  createUploadOptions,
} from '../../common/upload/upload.factory';

export const BRAND_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const BRAND_ALLOWED_MIMES = ALLOWED_IMAGE_MIMES;

/**
 * Yuklash sozlamalari umumiy fabrikadan olinadi — hajm chegarasi endi
 * multer'ga haqiqatan uzatiladi (ilgari faqat e'lon qilingan, lekin
 * qo'llanmagan edi) va fayl nomi server tomonda MIME asosida yaraladi.
 */
export const BRAND_MULTER_OPTIONS = createUploadOptions({
  subdirectory: 'brands',
  maxSizeBytes: BRAND_MAX_SIZE_BYTES,
  maxFiles: 1,
});
