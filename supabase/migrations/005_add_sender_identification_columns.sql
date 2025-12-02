-- =====================================================
-- Migration: Add sender identification type columns
-- =====================================================
-- This migration adds new columns to support different identification types
-- (DNI, NIE, Passport, CIF) instead of the generic sender_passport column.
--
-- Changes:
-- 1. Add sender_identification_type column (DNI, NIE, Passport, CIF)
-- 2. Add sender_identification column (the actual ID number)
-- 3. Keep sender_passport for backwards compatibility (deprecated)
-- =====================================================

-- Add the new identification type column
-- Valid values: 'DNI', 'NIE', 'Passport', 'CIF'
ALTER TABLE invoices
ADD COLUMN sender_identification_type VARCHAR(20) DEFAULT 'DNI';

-- Add the new identification value column
ALTER TABLE invoices
ADD COLUMN sender_identification VARCHAR(100);

-- Migrate existing data from sender_passport to sender_identification
-- This preserves existing data while transitioning to the new columns
UPDATE invoices
SET sender_identification = sender_passport,
    sender_identification_type = 'NIE'
WHERE sender_passport IS NOT NULL AND sender_identification IS NULL;

-- Add a comment to mark sender_passport as deprecated
COMMENT ON COLUMN invoices.sender_passport IS 'DEPRECATED: Use sender_identification and sender_identification_type instead';
COMMENT ON COLUMN invoices.sender_identification_type IS 'Type of identification: DNI, NIE, Passport, or CIF';
COMMENT ON COLUMN invoices.sender_identification IS 'The identification number/value';

