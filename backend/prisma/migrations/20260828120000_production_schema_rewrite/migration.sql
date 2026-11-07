-- ═══════════════════════════════════════════════════════════════════════════
-- Zahabi Parfume — ishlab chiqarishga tayyor sxema
--
-- Bu migratsiya BUZG'UNCHI EMAS: mavjud qatorlar saqlanadi. Yangi majburiy
-- ustunlar avval nullable qo'shiladi, mavjud bog'lanishlardan to'ldiriladi,
-- so'ngra NOT NULL ga ko'tariladi.
--
-- Qamrovi:
--   • Barcha tashqi kalitlarga indekslar (Postgres ularni avtomatik yaratmaydi)
--   • Chegirma narxi (compare_at_price), parfyumeriya metama'lumotlari
--   • Denormalizatsiyalangan saralash ustunlari: min_price / rating_avg / sold_count
--   • Buyurtma snapshot'lari + holat tarixi + idempotentlik kaliti
--   • Sharhlar buyurtma qatoriga bog'landi — tasdiqlangan xarid kafolati
--   • Telegram identifikatori; tasdiqlash kodlari endi hash'lanadi
--   • Mehmon savati; sevimlilar mahsulot darajasida
--   • Yetkazib berish usullari (narx serverda), sozlamalar, audit jurnali
--   • Biznes invariantlari uchun CHECK cheklovlari
-- ═══════════════════════════════════════════════════════════════════════════

-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('WEB', 'TELEGRAM', 'ADMIN');

-- CreateEnum
CREATE TYPE "FragranceGender" AS ENUM ('MALE', 'FEMALE', 'UNISEX', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "FragranceConcentration" AS ENUM ('PARFUM', 'EAU_DE_PARFUM', 'EAU_DE_TOILETTE', 'EAU_DE_COLOGNE', 'EAU_FRAICHE', 'EXTRAIT', 'BODY_MIST', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VerificationChannel" AS ENUM ('SMS', 'TELEGRAM', 'DEV');

-- CreateEnum
CREATE TYPE "VerificationPurpose" AS ENUM ('LOGIN', 'PHONE_CHANGE', 'TELEGRAM_LINK');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'ORDER_STATUS', 'REVIEW_REQUEST', 'PROMOTION');

-- CreateEnum
CREATE TYPE "BannerType" AS ENUM ('HERO', 'PROMO');

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED');
ALTER TABLE "public"."orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "coupon_uses" DROP CONSTRAINT "coupon_uses_coupon_id_fkey";

-- DropForeignKey
ALTER TABLE "coupon_uses" DROP CONSTRAINT "coupon_uses_order_id_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_order_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_transactions" DROP CONSTRAINT "stock_transactions_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "wishlist_items" DROP CONSTRAINT "wishlist_items_variant_id_fkey";

-- DropIndex
DROP INDEX "reviews_user_id_product_id_key";

-- DropIndex
DROP INDEX "wishlist_items_wishlist_id_variant_id_key";

-- AlterTable
ALTER TABLE "banners" ADD COLUMN     "cta_label_en" TEXT,
ADD COLUMN     "cta_label_ru" TEXT,
ADD COLUMN     "cta_label_uz" TEXT,
ADD COLUMN     "ends_at" TIMESTAMP(3),
ADD COLUMN     "mobile_image" TEXT,
ADD COLUMN     "starts_at" TIMESTAMP(3),
ADD COLUMN     "type" "BannerType" NOT NULL DEFAULT 'HERO';

-- AlterTable
ALTER TABLE "brands" ADD COLUMN     "country" TEXT,
ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "carts" ADD COLUMN     "expires_at" TIMESTAMP(3),
ADD COLUMN     "session_token" TEXT,
ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "banner_image" TEXT,
ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "category_attributes" ADD COLUMN     "is_filter" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "coupon_uses" ADD COLUMN     "user_id" TEXT;

-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "description" TEXT,
ADD COLUMN     "max_uses_per_user" INTEGER,
ADD COLUMN     "starts_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "link" TEXT,
ADD COLUMN     "order_id" TEXT,
ADD COLUMN     "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM';

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "line_total" DECIMAL(12,2),
ADD COLUMN     "product_id" TEXT,
ADD COLUMN     "product_name" TEXT,
ADD COLUMN     "product_slug" TEXT,
ADD COLUMN     "variant_sku" TEXT,
ADD COLUMN     "variant_volume" TEXT,
ALTER COLUMN "variant_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "cancel_reason" TEXT,
ADD COLUMN     "cancelled_at" TIMESTAMP(3),
ADD COLUMN     "confirmed_at" TIMESTAMP(3),
ADD COLUMN     "customer_name" TEXT,
ADD COLUMN     "customer_phone" TEXT,
ADD COLUMN     "delivered_at" TIMESTAMP(3),
ADD COLUMN     "delivery_name" TEXT,
ADD COLUMN     "delivery_option_id" TEXT,
ADD COLUMN     "idempotency_key" TEXT,
ADD COLUMN     "payment_method" "PaymentMethod" NOT NULL DEFAULT 'CASH',
ADD COLUMN     "ship_city" TEXT,
ADD COLUMN     "ship_district" TEXT,
ADD COLUMN     "ship_lat" DECIMAL(10,7),
ADD COLUMN     "ship_lon" DECIMAL(10,7),
ADD COLUMN     "ship_street" TEXT,
ADD COLUMN     "ship_zip" TEXT,
ADD COLUMN     "source" "OrderSource" NOT NULL DEFAULT 'WEB',
ADD COLUMN     "subtotal_amount" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "paid_at" TIMESTAMP(3),
ADD COLUMN     "provider" TEXT;

-- AlterTable
ALTER TABLE "product_images" ADD COLUMN     "alt" TEXT,
ADD COLUMN     "product_id" TEXT,
ALTER COLUMN "variant_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "compare_at_price" DECIMAL(12,2),
ADD COLUMN     "is_default" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "low_stock_threshold" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "weight_grams" INTEGER;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "base_notes" TEXT[],
ADD COLUMN     "concentration" "FragranceConcentration" NOT NULL DEFAULT 'NOT_APPLICABLE',
ADD COLUMN     "country" TEXT,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "gender" "FragranceGender" NOT NULL DEFAULT 'NOT_APPLICABLE',
ADD COLUMN     "heart_notes" TEXT[],
ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_new_arrival" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "longevity" INTEGER,
ADD COLUMN     "max_price" DECIMAL(12,2),
ADD COLUMN     "min_price" DECIMAL(12,2),
ADD COLUMN     "rating_avg" DECIMAL(3,2) NOT NULL DEFAULT 0,
ADD COLUMN     "rating_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "release_year" INTEGER,
ADD COLUMN     "short_en" TEXT,
ADD COLUMN     "short_ru" TEXT,
ADD COLUMN     "short_uz" TEXT,
ADD COLUMN     "sillage" INTEGER,
ADD COLUMN     "sold_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "top_notes" TEXT[],
ADD COLUMN     "total_stock" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "admin_note" TEXT,
ADD COLUMN     "helpful_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "order_item_id" TEXT,
ADD COLUMN     "rating_longevity" INTEGER,
ADD COLUMN     "rating_packaging" INTEGER,
ADD COLUMN     "rating_quality" INTEGER,
ADD COLUMN     "rating_value" INTEGER,
ADD COLUMN     "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "ip_address" TEXT,
ADD COLUMN     "user_agent" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'uz',
ADD COLUMN     "last_login_at" TIMESTAMP(3),
ADD COLUMN     "telegram_id" BIGINT,
ADD COLUMN     "telegram_linked_at" TIMESTAMP(3),
ADD COLUMN     "telegram_photo_url" TEXT,
ADD COLUMN     "telegram_username" TEXT;

-- AlterTable
ALTER TABLE "wishlist_items" ADD COLUMN     "product_id" TEXT,
ALTER COLUMN "variant_id" DROP NOT NULL;

-- DropTable


-- ═══════════════════════════════════════════════════════════════════════════
-- BACKFILL — mavjud qatorlarni yangi majburiy ustunlar bilan to'ldirish.
-- Ustunlar yuqorida nullable qo'shildi; bu yerda to'ldirilib, NOT NULL ga
-- ko'tariladi. Hech qanday mavjud ma'lumot yo'qolmaydi.
-- ═══════════════════════════════════════════════════════════════════════════

-- product_images.product_id ← variant orqali
UPDATE "product_images" pi
SET "product_id" = pv."product_id"
FROM "product_variants" pv
WHERE pi."variant_id" = pv."id" AND pi."product_id" IS NULL;

DELETE FROM "product_images" WHERE "product_id" IS NULL;
ALTER TABLE "product_images" ALTER COLUMN "product_id" SET NOT NULL;

-- Eski sxemada asosiy rasm HAR VARIANT uchun edi; endi HAR MAHSULOT uchun.
-- Ko'p variantli mahsulotlarda ortiqcha asosiy rasmlarni bekor qilamiz.
UPDATE "product_images"
SET "is_primary" = FALSE
WHERE "is_primary" = TRUE
  AND "id" NOT IN (
    SELECT DISTINCT ON ("product_id") "id"
    FROM "product_images"
    WHERE "is_primary" = TRUE
    ORDER BY "product_id", "sort_order" ASC, "created_at" ASC
  );

-- wishlist_items.product_id ← variant orqali
UPDATE "wishlist_items" wi
SET "product_id" = pv."product_id"
FROM "product_variants" pv
WHERE wi."variant_id" = pv."id" AND wi."product_id" IS NULL;

DELETE FROM "wishlist_items" WHERE "product_id" IS NULL;

-- Sevimlilar endi mahsulot darajasida unikal: bir mahsulotning bir nechta
-- varianti bo'lsa, eng eskisi qoladi (part 2 dagi unique indeksdan oldin).
DELETE FROM "wishlist_items" a
USING "wishlist_items" b
WHERE a."wishlist_id" = b."wishlist_id"
  AND a."product_id" = b."product_id"
  AND a."created_at" > b."created_at";

ALTER TABLE "wishlist_items" ALTER COLUMN "product_id" SET NOT NULL;

-- order_items snapshot ustunlari ← variant + product
UPDATE "order_items" oi
SET "product_id"     = p."id",
    "product_name"   = p."name_uz",
    "product_slug"   = p."slug",
    "variant_sku"    = pv."sku",
    "variant_volume" = pv."volume"
FROM "product_variants" pv
JOIN "products" p ON p."id" = pv."product_id"
WHERE oi."variant_id" = pv."id" AND oi."product_name" IS NULL;

-- Varianti o'chirilgan yetim qatorlar uchun zaxira qiymatlar.
UPDATE "order_items"
SET "product_name" = COALESCE("product_name", 'Noma''lum mahsulot'),
    "product_slug" = COALESCE("product_slug", 'unknown'),
    "variant_sku"  = COALESCE("variant_sku", 'UNKNOWN');

UPDATE "order_items"
SET "line_total" = "unit_price" * "quantity"
WHERE "line_total" IS NULL;

ALTER TABLE "order_items" ALTER COLUMN "product_name" SET NOT NULL;
ALTER TABLE "order_items" ALTER COLUMN "product_slug" SET NOT NULL;
ALTER TABLE "order_items" ALTER COLUMN "variant_sku"  SET NOT NULL;
ALTER TABLE "order_items" ALTER COLUMN "line_total"   SET NOT NULL;

-- orders.customer_phone / customer_name ← foydalanuvchi profili (snapshot)
UPDATE "orders" o
SET "customer_phone" = u."phone_number",
    "customer_name"  = NULLIF(TRIM(CONCAT_WS(' ', u."name", u."last_name")), '')
FROM "users" u
WHERE o."user_id" = u."id" AND o."customer_phone" IS NULL;

UPDATE "orders" SET "customer_phone" = 'UNKNOWN' WHERE "customer_phone" IS NULL;
ALTER TABLE "orders" ALTER COLUMN "customer_phone" SET NOT NULL;

-- orders manzil snapshot'i ← bog'langan manzil
UPDATE "orders" o
SET "ship_city"     = a."city",
    "ship_district" = a."district",
    "ship_street"   = a."street",
    "ship_zip"      = a."zip_code",
    "ship_lat"      = a."lat",
    "ship_lon"      = a."lon"
FROM "addresses" a
WHERE o."address_id" = a."id" AND o."ship_city" IS NULL;

-- orders.subtotal_amount: total = subtotal - discount + shipping tenglikidan
UPDATE "orders"
SET "subtotal_amount" = "total_amount" - "shipping_fee" + "discount_amount"
WHERE "subtotal_amount" IS NULL;

ALTER TABLE "orders" ALTER COLUMN "subtotal_amount" SET NOT NULL;

-- reviews.status ← eski is_approved bayrog'i, so'ng eski ustun olib tashlanadi
UPDATE "reviews"
SET "status" = CASE WHEN "is_approved" THEN 'APPROVED'::"ReviewStatus" ELSE 'PENDING'::"ReviewStatus" END;
ALTER TABLE "reviews" DROP COLUMN "is_approved";

-- Har bir mahsulotning eng arzon varianti standart variant bo'ladi
UPDATE "product_variants" pv
SET "is_default" = TRUE
FROM (
  SELECT DISTINCT ON ("product_id") "id"
  FROM "product_variants"
  ORDER BY "product_id", "price" ASC, "created_at" ASC
) first_variant
WHERE pv."id" = first_variant."id";

-- ── Denormalizatsiyalangan ustunlarni birinchi marta hisoblash ──
UPDATE "products" p
SET "min_price"   = agg.min_price,
    "max_price"   = agg.max_price,
    "total_stock" = agg.total_stock
FROM (
  SELECT "product_id",
         MIN("price") AS min_price,
         MAX("price") AS max_price,
         SUM("stock")::int AS total_stock
  FROM "product_variants"
  WHERE "is_active" = TRUE
  GROUP BY "product_id"
) agg
WHERE p."id" = agg."product_id";

UPDATE "products" p
SET "rating_avg"   = agg.avg_rating,
    "rating_count" = agg.cnt
FROM (
  SELECT "product_id", AVG("rating")::numeric(3,2) AS avg_rating, COUNT(*)::int AS cnt
  FROM "reviews"
  WHERE "status" = 'APPROVED'
  GROUP BY "product_id"
) agg
WHERE p."id" = agg."product_id";

UPDATE "products" p
SET "sold_count" = agg.sold
FROM (
  SELECT oi."product_id", SUM(oi."quantity")::int AS sold
  FROM "order_items" oi
  JOIN "orders" o ON o."id" = oi."order_id"
  WHERE o."status" = 'DELIVERED' AND oi."product_id" IS NOT NULL
  GROUP BY oi."product_id"
) agg
WHERE p."id" = agg."product_id";

DROP TABLE "otp_codes";

-- CreateTable
CREATE TABLE "verification_codes" (
    "id" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "channel" "VerificationChannel" NOT NULL,
    "purpose" "VerificationPurpose" NOT NULL DEFAULT 'LOGIN',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 5,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "ip_address" TEXT,
    "telegram_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_votes" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_helpful" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_options" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name_uz" TEXT NOT NULL,
    "name_ru" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "description_uz" TEXT,
    "description_ru" TEXT,
    "description_en" TEXT,
    "fee" DECIMAL(12,2) NOT NULL,
    "free_threshold" DECIMAL(12,2),
    "min_days" INTEGER NOT NULL DEFAULT 1,
    "max_days" INTEGER NOT NULL DEFAULT 3,
    "requires_address" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_events" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "from_status" "OrderStatus",
    "to_status" "OrderStatus" NOT NULL,
    "actor_id" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT,
    "metadata" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "verification_codes_phone_number_purpose_created_at_idx" ON "verification_codes"("phone_number", "purpose", "created_at");

-- CreateIndex
CREATE INDEX "verification_codes_expires_at_idx" ON "verification_codes"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "review_votes_review_id_user_id_key" ON "review_votes"("review_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_options_code_key" ON "delivery_options"("code");

-- CreateIndex
CREATE INDEX "delivery_options_is_active_sort_order_idx" ON "delivery_options"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "order_status_events_order_id_created_at_idx" ON "order_status_events"("order_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entity_id_idx" ON "audit_logs"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "addresses_user_id_idx" ON "addresses"("user_id");

-- CreateIndex
CREATE INDEX "banners_type_is_active_sort_order_idx" ON "banners"("type", "is_active", "sort_order");

-- CreateIndex
CREATE INDEX "brands_is_active_sort_order_idx" ON "brands"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "brands_is_featured_idx" ON "brands"("is_featured");

-- CreateIndex
CREATE INDEX "cart_items_cart_id_idx" ON "cart_items"("cart_id");

-- CreateIndex
CREATE INDEX "cart_items_variant_id_idx" ON "cart_items"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "carts_session_token_key" ON "carts"("session_token");

-- CreateIndex
CREATE INDEX "carts_expires_at_idx" ON "carts"("expires_at");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

-- CreateIndex
CREATE INDEX "categories_is_active_sort_order_idx" ON "categories"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "category_attributes_category_id_sort_order_idx" ON "category_attributes"("category_id", "sort_order");

-- CreateIndex
CREATE INDEX "coupon_uses_coupon_id_user_id_idx" ON "coupon_uses"("coupon_id", "user_id");

-- CreateIndex
CREATE INDEX "coupons_is_active_expires_at_idx" ON "coupons"("is_active", "expires_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_created_at_idx" ON "notifications"("user_id", "is_read", "created_at" DESC);

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_variant_id_idx" ON "order_items"("variant_id");

-- CreateIndex
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_idempotency_key_key" ON "orders"("idempotency_key");

-- CreateIndex
CREATE INDEX "orders_user_id_created_at_idx" ON "orders"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "orders_status_created_at_idx" ON "orders"("status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "orders_payment_status_idx" ON "orders"("payment_status");

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at" DESC);

-- CreateIndex
CREATE INDEX "payments_order_id_idx" ON "payments"("order_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "product_attributes_attribute_id_value_idx" ON "product_attributes"("attribute_id", "value");

-- CreateIndex
CREATE INDEX "product_images_product_id_sort_order_idx" ON "product_images"("product_id", "sort_order");

-- CreateIndex
CREATE INDEX "product_images_variant_id_idx" ON "product_images"("variant_id");

-- CreateIndex
CREATE INDEX "product_tags_tag_id_idx" ON "product_tags"("tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_barcode_key" ON "product_variants"("barcode");

-- CreateIndex
CREATE INDEX "product_variants_product_id_is_active_sort_order_idx" ON "product_variants"("product_id", "is_active", "sort_order");

-- CreateIndex
CREATE INDEX "product_variants_product_id_price_idx" ON "product_variants"("product_id", "price");

-- CreateIndex
CREATE INDEX "product_views_user_id_created_at_idx" ON "product_views"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "products_category_id_is_active_idx" ON "products"("category_id", "is_active");

-- CreateIndex
CREATE INDEX "products_brand_id_is_active_idx" ON "products"("brand_id", "is_active");

-- CreateIndex
CREATE INDEX "products_is_active_is_bestseller_created_at_idx" ON "products"("is_active", "is_bestseller", "created_at" DESC);

-- CreateIndex
CREATE INDEX "products_is_active_created_at_idx" ON "products"("is_active", "created_at" DESC);

-- CreateIndex
CREATE INDEX "products_is_active_min_price_idx" ON "products"("is_active", "min_price");

-- CreateIndex
CREATE INDEX "products_is_active_rating_avg_idx" ON "products"("is_active", "rating_avg" DESC);

-- CreateIndex
CREATE INDEX "products_is_active_sold_count_idx" ON "products"("is_active", "sold_count" DESC);

-- CreateIndex
CREATE INDEX "products_gender_is_active_idx" ON "products"("gender", "is_active");

-- CreateIndex
CREATE INDEX "products_deleted_at_idx" ON "products"("deleted_at");

-- CreateIndex
CREATE INDEX "purchase_items_purchase_id_idx" ON "purchase_items"("purchase_id");

-- CreateIndex
CREATE INDEX "purchase_items_variant_id_idx" ON "purchase_items"("variant_id");

-- CreateIndex
CREATE INDEX "purchases_supplier_id_idx" ON "purchases"("supplier_id");

-- CreateIndex
CREATE INDEX "purchases_status_created_at_idx" ON "purchases"("status", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "reviews_order_item_id_key" ON "reviews"("order_item_id");

-- CreateIndex
CREATE INDEX "reviews_product_id_status_created_at_idx" ON "reviews"("product_id", "status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "reviews_product_id_status_rating_idx" ON "reviews"("product_id", "status", "rating");

-- CreateIndex
CREATE INDEX "reviews_user_id_created_at_idx" ON "reviews"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "reviews_status_idx" ON "reviews"("status");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- CreateIndex
CREATE INDEX "stock_transactions_variant_id_created_at_idx" ON "stock_transactions"("variant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "stock_transactions_reference_idx" ON "stock_transactions"("reference");

-- CreateIndex
CREATE INDEX "suppliers_is_active_idx" ON "suppliers"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "users_telegram_id_key" ON "users"("telegram_id");

-- CreateIndex
CREATE INDEX "users_role_is_active_idx" ON "users"("role", "is_active");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "wishlist_items_product_id_idx" ON "wishlist_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_items_wishlist_id_product_id_key" ON "wishlist_items"("wishlist_id", "product_id");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_delivery_option_id_fkey" FOREIGN KEY ("delivery_option_id") REFERENCES "delivery_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_events" ADD CONSTRAINT "order_status_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_events" ADD CONSTRAINT "order_status_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_uses" ADD CONSTRAINT "coupon_uses_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_uses" ADD CONSTRAINT "coupon_uses_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;



-- ═══════════════════════════════════════════════════════════════════════════
-- BACKFILL (yangi jadvallardan keyin)
-- ═══════════════════════════════════════════════════════════════════════════

-- Mavjud buyurtmalar uchun boshlang'ich holat tarixi yozuvi
INSERT INTO "order_status_events" ("id", "order_id", "from_status", "to_status", "note", "created_at")
SELECT
  'evt' || replace(gen_random_uuid()::text, '-', ''),
  o."id", NULL, o."status", 'Migratsiya: boshlang''ich holat', o."created_at"
FROM "orders" o;

-- Standart yetkazib berish usullari. Narx SERVERDA shu jadvaldan olinadi —
-- hech qachon frontend yuborgan qiymatdan emas.
INSERT INTO "delivery_options"
  ("id", "code", "name_uz", "name_ru", "name_en",
   "description_uz", "description_ru", "description_en",
   "fee", "free_threshold", "min_days", "max_days", "requires_address", "sort_order", "updated_at")
VALUES
  ('dlv_pickup', 'PICKUP',
   'Do''kondan olib ketish', 'Самовывоз', 'Store pickup',
   'Toshkent, Amir Temur ko''chasi 12 — ish kunlari 10:00–20:00',
   'Ташкент, улица Амира Темура 12 — будни 10:00–20:00',
   'Tashkent, Amir Temur street 12 — weekdays 10:00–20:00',
   0, NULL, 0, 1, FALSE, 1, CURRENT_TIMESTAMP),
  ('dlv_standard', 'COURIER',
   'Kuryer yetkazib berish', 'Доставка курьером', 'Courier delivery',
   'Toshkent bo''ylab 1–2 kun ichida', 'По Ташкенту за 1–2 дня', 'Across Tashkent in 1–2 days',
   30000, 500000, 1, 2, TRUE, 2, CURRENT_TIMESTAMP),
  ('dlv_express', 'EXPRESS',
   'Tezkor yetkazish (bugun)', 'Экспресс-доставка (сегодня)', 'Express delivery (today)',
   'Soat 14:00 gacha buyurtma qilsangiz — bugun yetkaziladi',
   'Заказ до 14:00 — доставка сегодня', 'Order before 14:00 — delivered today',
   60000, NULL, 0, 1, TRUE, 3, CURRENT_TIMESTAMP),
  ('dlv_regions', 'REGIONS',
   'Viloyatlarga yetkazish', 'Доставка по регионам', 'Regional delivery',
   'O''zbekiston bo''ylab 2–5 kun ichida', 'По Узбекистану за 2–5 дней', 'Across Uzbekistan in 2–5 days',
   45000, 1000000, 2, 5, TRUE, 4, CURRENT_TIMESTAMP);

-- Do'kon sozlamalari — koddagi sehrli sonlar o'rniga
INSERT INTO "settings" ("key", "value", "description", "updated_at") VALUES
  ('store.currency', 'UZS', 'Do''kon valyutasi', CURRENT_TIMESTAMP),
  ('store.low_stock_alert', '3', 'Zaxira ogohlantirish chegarasi', CURRENT_TIMESTAMP),
  ('order.max_items', '50', 'Bitta buyurtmadagi maksimal qatorlar soni', CURRENT_TIMESTAMP),
  ('order.max_quantity_per_item', '20', 'Bitta mahsulotdan maksimal miqdor', CURRENT_TIMESTAMP),
  ('review.auto_approve', 'true', 'Tasdiqlangan xarid sharhlari avtomatik chop etilsinmi', CURRENT_TIMESTAMP),
  ('cart.guest_ttl_days', '30', 'Mehmon savati saqlanish muddati (kun)', CURRENT_TIMESTAMP);

-- ═══════════════════════════════════════════════════════════════════════════
-- INVARIANTLAR — biznes qoidalari DB darajasida majburlanadi, shunda
-- servis qatlamidagi xato ham ma'lumotni buza olmaydi.
-- ═══════════════════════════════════════════════════════════════════════════

-- Zaxira hech qachon manfiy bo'lmaydi — parallel buyurtmalarda oversell himoyasi.
ALTER TABLE "product_variants"
  ADD CONSTRAINT "chk_variant_stock_non_negative" CHECK ("stock" >= 0);

-- Chegirmagacha narx joriy narxdan qat'iy katta bo'lishi shart.
ALTER TABLE "product_variants"
  ADD CONSTRAINT "chk_variant_compare_price"
  CHECK ("compare_at_price" IS NULL OR "compare_at_price" > "price");

ALTER TABLE "product_variants"
  ADD CONSTRAINT "chk_variant_price_positive"
  CHECK ("price" > 0 AND "cost_price" >= 0);

ALTER TABLE "cart_items"
  ADD CONSTRAINT "chk_cart_item_quantity_positive" CHECK ("quantity" > 0);

ALTER TABLE "order_items"
  ADD CONSTRAINT "chk_order_item_quantity_positive" CHECK ("quantity" > 0);

-- Buyurtma summalari o'zaro mos bo'lishi shart.
ALTER TABLE "orders"
  ADD CONSTRAINT "chk_order_totals_consistent"
  CHECK ("total_amount" = "subtotal_amount" - "discount_amount" + "shipping_fee");

ALTER TABLE "orders"
  ADD CONSTRAINT "chk_order_amounts_non_negative"
  CHECK ("subtotal_amount" >= 0 AND "discount_amount" >= 0
     AND "shipping_fee" >= 0 AND "total_amount" >= 0);

-- Savat aniq bitta egaga tegishli: foydalanuvchi YOKI mehmon sessiyasi.
ALTER TABLE "carts"
  ADD CONSTRAINT "chk_cart_owner"
  CHECK (("user_id" IS NOT NULL AND "session_token" IS NULL)
      OR ("user_id" IS NULL AND "session_token" IS NOT NULL));

ALTER TABLE "reviews"
  ADD CONSTRAINT "chk_review_rating_range" CHECK ("rating" BETWEEN 1 AND 5);

ALTER TABLE "reviews"
  ADD CONSTRAINT "chk_review_dimension_ranges" CHECK (
    ("rating_longevity" IS NULL OR "rating_longevity" BETWEEN 1 AND 5) AND
    ("rating_quality"   IS NULL OR "rating_quality"   BETWEEN 1 AND 5) AND
    ("rating_packaging" IS NULL OR "rating_packaging" BETWEEN 1 AND 5) AND
    ("rating_value"     IS NULL OR "rating_value"     BETWEEN 1 AND 5)
  );

-- Tasdiqlangan xarid sharhi buyurtma qatoriga bog'langan bo'lishi SHART.
-- Bu qoida frontendda emas, DB darajasida majburlanadi.
ALTER TABLE "reviews"
  ADD CONSTRAINT "chk_review_verified_has_order_item"
  CHECK ("is_verified" = FALSE OR "order_item_id" IS NOT NULL);

ALTER TABLE "products"
  ADD CONSTRAINT "chk_product_note_scales"
  CHECK (("longevity" IS NULL OR "longevity" BETWEEN 1 AND 5)
     AND ("sillage"   IS NULL OR "sillage"   BETWEEN 1 AND 5));

ALTER TABLE "products"
  ADD CONSTRAINT "chk_product_rating_range"
  CHECK ("rating_avg" >= 0 AND "rating_avg" <= 5 AND "rating_count" >= 0);

-- ═══════════════════════════════════════════════════════════════════════════
-- QIDIRUV INDEKSLARI — ILIKE '%...%' oddiy B-tree indeksdan foydalanmaydi.
-- pg_trgm GIN indekslari qidiruvni seq scan'dan qutqaradi.
-- ═══════════════════════════════════════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "products_name_uz_trgm_idx" ON "products" USING GIN ("name_uz" gin_trgm_ops);
CREATE INDEX "products_name_ru_trgm_idx" ON "products" USING GIN ("name_ru" gin_trgm_ops);
CREATE INDEX "products_name_en_trgm_idx" ON "products" USING GIN ("name_en" gin_trgm_ops);
CREATE INDEX "brands_name_trgm_idx"      ON "brands"   USING GIN ("name" gin_trgm_ops);

-- Mahsulotda faqat bitta asosiy rasm bo'lishi mumkin.
CREATE UNIQUE INDEX "product_images_one_primary_per_product"
  ON "product_images" ("product_id") WHERE "is_primary";
