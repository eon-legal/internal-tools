-- =====================================================
-- Invoice Management System - Initial Database Schema
-- =====================================================
-- This migration creates the core tables for invoice management:
-- 1. companies: Store company/client information
-- 2. invoices: Store invoice records with auto-generated invoice numbers
-- 3. invoice_data_presets: Store frequently used invoice line items for autocomplete
--
-- Business Rules:
-- - Invoice numbers follow format: EON-YY-LXXX (e.g., EON-25-L001)
-- - Invoice numbers auto-increment per year and reset on year rollover
-- - Companies can be reused across multiple invoices
-- - Invoices track creation, update, and download timestamps
-- =====================================================

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Table: companies
-- Purpose: Store company/client information for invoices
-- =====================================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  passport VARCHAR(100),
  national BOOLEAN DEFAULT true,
  nif VARCHAR(50),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups of default company
CREATE INDEX idx_companies_is_default ON companies(is_default) WHERE is_default = true;

-- Ensure only one default company exists
CREATE UNIQUE INDEX idx_companies_single_default ON companies(is_default) WHERE is_default = true;

-- =====================================================
-- Table: invoices
-- Purpose: Store invoice records with all invoice data
-- =====================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  invoice_date TIMESTAMPTZ NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  
  -- Invoice sender information (from first form)
  sender_name VARCHAR(255),
  sender_address TEXT,
  sender_passport VARCHAR(100),
  sender_national BOOLEAN DEFAULT true,
  
  -- Invoice destination information (from second form)
  destination_name VARCHAR(255),
  destination_account VARCHAR(100),
  destination_address TEXT,
  destination_bank_name VARCHAR(255),
  destination_bank_address TEXT,
  destination_nif VARCHAR(50),
  
  -- Invoice line items stored as JSONB
  -- Structure: [{ id, description, qtt, price, total, sTotal, perCentIva }]
  invoice_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Calculated totals
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  iva_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  
  -- Status and metadata
  paid BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_download_at TIMESTAMPTZ
);

-- Indexes for common queries
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date DESC);
CREATE INDEX idx_invoices_company_id ON invoices(company_id);
CREATE INDEX idx_invoices_paid ON invoices(paid);
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);

-- Index for invoice number generation queries (year-based)
CREATE INDEX idx_invoices_invoice_number_year ON invoices(
  SUBSTRING(invoice_number FROM 5 FOR 2)
);

-- =====================================================
-- Table: invoice_data_presets
-- Purpose: Store frequently used invoice line items for autocomplete
-- =====================================================
CREATE TABLE invoice_data_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description VARCHAR(500) NOT NULL,
  default_price DECIMAL(12, 2),
  default_quantity INTEGER DEFAULT 1,
  default_iva_percent INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for autocomplete searches
CREATE INDEX idx_invoice_data_presets_description ON invoice_data_presets 
  USING gin(to_tsvector('english', description));

-- Index for sorting by most used
CREATE INDEX idx_invoice_data_presets_usage_count ON invoice_data_presets(usage_count DESC);

-- =====================================================
-- Function: update_updated_at_column
-- Purpose: Automatically update updated_at timestamp on row updates
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply auto-update trigger to all tables
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_data_presets_updated_at
  BEFORE UPDATE ON invoice_data_presets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================
-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_data_presets ENABLE ROW LEVEL SECURITY;

-- For now, allow all authenticated users to perform all operations
-- TODO: Refine these policies based on actual authentication requirements

-- Companies policies
-- Note: Allows both anonymous and authenticated access for internal tool usage
CREATE POLICY "Allow all operations on companies"
  ON companies FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Invoices policies
-- Note: Allows both anonymous and authenticated access for internal tool usage
CREATE POLICY "Allow all operations on invoices"
  ON invoices FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Invoice data presets policies
-- Note: Allows both anonymous and authenticated access for internal tool usage
CREATE POLICY "Allow all operations on invoice_data_presets"
  ON invoice_data_presets FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- Seed Data: Insert default company
-- =====================================================
INSERT INTO companies (name, address, national, is_default)
VALUES ('Default Company', 'Default Address', true, true)
ON CONFLICT DO NOTHING;

