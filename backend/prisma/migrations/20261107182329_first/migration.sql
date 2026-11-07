-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_order_id_fkey";

-- DropIndex
DROP INDEX "brands_name_trgm_idx";

-- DropIndex
DROP INDEX "products_name_en_trgm_idx";

-- DropIndex
DROP INDEX "products_name_ru_trgm_idx";

-- DropIndex
DROP INDEX "products_name_uz_trgm_idx";

-- DropConstraint (index was created by a unique constraint, must drop constraint first)
ALTER TABLE "suppliers" DROP CONSTRAINT "suppliers_name_key";
