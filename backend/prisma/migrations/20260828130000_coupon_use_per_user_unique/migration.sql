-- Migration: enforce at most one coupon use per (coupon, user) pair.
--
-- Prisma's schema DSL cannot express partial unique indexes, so this is managed
-- as a raw migration. The existing regular index is retained in schema.prisma
-- for Prisma's query planner; the partial unique index is the actual constraint.
--
-- The index is PARTIAL (WHERE user_id IS NOT NULL) so that guest orders (no
-- user_id) are not incorrectly blocked from using the same coupon more than once.

CREATE UNIQUE INDEX IF NOT EXISTS uq_coupon_use_per_user
  ON coupon_uses (coupon_id, user_id)
  WHERE user_id IS NOT NULL;
