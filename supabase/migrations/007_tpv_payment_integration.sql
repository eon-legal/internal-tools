-- =====================================================
-- Migration: 007_tpv_payment_integration
-- Purpose: Enable Cecabank TPV Virtual payment links
--          - Add email column to clients (needed to deliver the link)
--          - Create tpv_payment_links to correlate Cecabank Num_operacion
--            with invoices and track payment status
-- =====================================================

-- Step 1: Add email to clients (nullable; not every client has one yet)
ALTER TABLE clients
  ADD COLUMN email VARCHAR(255);

-- Step 2: Create the payment links table
CREATE TABLE tpv_payment_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  -- Cecabank Num_operacion (manual §5): unique, ≤50 chars, alphanumeric.
  -- Must not repeat within 24h or Cecabank rejects with "operación incorrecta".
  num_operacion VARCHAR(50) UNIQUE NOT NULL,

  -- Opaque URL token used in the email link (separate from num_operacion
  -- so we never leak the Cecabank operation id to the customer).
  token VARCHAR(64) UNIQUE NOT NULL,

  -- Importe in the form Cecabank expects (manual §5): integer cents.
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),

  -- pending → paid | failed | expired
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed', 'expired')),

  -- Filled by the Comunicación on-line callback (manual §7).
  referencia VARCHAR(30),
  num_aut VARCHAR(6),
  cod_aut VARCHAR(10),

  sent_to_email VARCHAR(255) NOT NULL,

  -- Manual §5: Num_operacion is reserved for 24h. After this we mark
  -- the row expired and allow generating a fresh one.
  expires_at TIMESTAMPTZ NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tpv_payment_links_num_operacion ON tpv_payment_links(num_operacion);
CREATE INDEX idx_tpv_payment_links_token ON tpv_payment_links(token);
CREATE INDEX idx_tpv_payment_links_invoice_status ON tpv_payment_links(invoice_id, status);

-- Reuse the existing updated_at helper (defined in 001_initial_schema.sql)
CREATE TRIGGER update_tpv_payment_links_updated_at
  BEFORE UPDATE ON tpv_payment_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Row Level Security
-- =====================================================
-- Same permissive policy as the rest of the schema (internal tool, see 001).
-- The bank callback hits the table via the service-role key from the edge
-- function and bypasses RLS, so anon + authenticated is fine here.
ALTER TABLE tpv_payment_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on tpv_payment_links"
  ON tpv_payment_links FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
