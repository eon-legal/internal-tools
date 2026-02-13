-- =====================================================
-- Migration: 006_add_paid_at_column
-- Purpose: Add paid_at timestamp to invoices table
--          to track when an invoice was actually paid
-- =====================================================

-- Add paid_at column (nullable; NULL means not yet paid)
ALTER TABLE invoices
  ADD COLUMN paid_at TIMESTAMPTZ;

-- Backfill: for invoices already marked as paid, use updated_at
-- as the best available approximation of when they were paid
UPDATE invoices
  SET paid_at = updated_at
  WHERE paid = true;

