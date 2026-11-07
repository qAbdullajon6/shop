-- P1 Production Hardening Migration
-- Adds missing indexes, constraints, and FK fixes identified in P1 audit.

-- ─── Missing indexes on FK columns ────────────────────────────────────────────

-- orders.address_id — queries filtering by address (e.g. "all orders to this address")
CREATE INDEX IF NOT EXISTS "idx_orders_address_id"
  ON "orders" ("address_id")
  WHERE "address_id" IS NOT NULL;

-- orders.delivery_option_id — admin reports by delivery method
CREATE INDEX IF NOT EXISTS "idx_orders_delivery_option_id"
  ON "orders" ("delivery_option_id")
  WHERE "delivery_option_id" IS NOT NULL;

-- order_status_events.actor_id — "all status changes by this admin"
CREATE INDEX IF NOT EXISTS "idx_order_status_events_actor_id"
  ON "order_status_events" ("actor_id")
  WHERE "actor_id" IS NOT NULL;

-- wishlist_items.variant_id — used when a variant is deactivated/deleted
CREATE INDEX IF NOT EXISTS "idx_wishlist_items_variant_id"
  ON "wishlist_items" ("variant_id")
  WHERE "variant_id" IS NOT NULL;

-- stock_transactions.created_by — "all transactions by this warehouse user"
CREATE INDEX IF NOT EXISTS "idx_stock_transactions_created_by"
  ON "stock_transactions" ("created_by")
  WHERE "created_by" IS NOT NULL;

-- purchases.created_by
CREATE INDEX IF NOT EXISTS "idx_purchases_created_by"
  ON "purchases" ("created_by")
  WHERE "created_by" IS NOT NULL;

-- ─── Missing CHECK constraints ─────────────────────────────────────────────────

-- purchase_items.quantity > 0 (already on cart_items and order_items)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'chk_purchase_item_quantity_positive'
  ) THEN
    ALTER TABLE "purchase_items"
      ADD CONSTRAINT "chk_purchase_item_quantity_positive" CHECK ("quantity" > 0);
  END IF;
END
$$;

-- stock_transactions.quantity > 0
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'chk_stock_transaction_quantity_positive'
  ) THEN
    ALTER TABLE "stock_transactions"
      ADD CONSTRAINT "chk_stock_transaction_quantity_positive" CHECK ("quantity" > 0);
  END IF;
END
$$;

-- coupons.discount_value > 0
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'chk_coupon_discount_value_positive'
  ) THEN
    ALTER TABLE "coupons"
      ADD CONSTRAINT "chk_coupon_discount_value_positive" CHECK ("discount_value" > 0);
  END IF;
END
$$;

-- delivery_options.fee >= 0
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'chk_delivery_option_fee_non_negative'
  ) THEN
    ALTER TABLE "delivery_options"
      ADD CONSTRAINT "chk_delivery_option_fee_non_negative" CHECK ("fee" >= 0);
  END IF;
END
$$;

-- ─── Partial unique indexes for business rules ─────────────────────────────────

-- One default variant per product
CREATE UNIQUE INDEX IF NOT EXISTS "uq_product_variant_default_per_product"
  ON "product_variants" ("product_id")
  WHERE "is_default" = TRUE;

-- One default address per user
CREATE UNIQUE INDEX IF NOT EXISTS "uq_address_default_per_user"
  ON "addresses" ("user_id")
  WHERE "is_default" = TRUE;

-- ─── Unique constraint on supplier name ───────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'suppliers_name_key'
  ) THEN
    ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_name_key" UNIQUE ("name");
  END IF;
END
$$;

-- ─── Add missing FK on notifications.order_id ─────────────────────────────────
-- Orphaned order_id values would silently point to non-existent orders.
-- SetNull on order delete so notification survives if order is ever removed.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'notifications_order_id_fkey'
      AND table_name = 'notifications'
  ) THEN
    ALTER TABLE "notifications"
      ADD CONSTRAINT "notifications_order_id_fkey"
      FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL;
  END IF;
END
$$;
