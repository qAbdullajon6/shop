-- Migration: one active verification code per (phone_number, purpose) at a time.
--
-- The partial unique index covers only rows where consumed_at IS NULL (i.e.
-- not yet consumed or invalidated). When issueCode() invalidates an old code it
-- now sets consumed_at = now() in addition to expires_at = epoch(0), which
-- removes the old row from the index scope and allows the new code to be
-- inserted without a uniqueness conflict.
--
-- Prisma's schema DSL cannot express WHERE-clause indexes, so this is a raw
-- migration. No schema.prisma change is needed — Prisma's regular index
-- (phone_number, purpose, created_at) remains for query planning.

CREATE UNIQUE INDEX IF NOT EXISTS uq_verification_active
  ON verification_codes (phone_number, purpose)
  WHERE consumed_at IS NULL;
