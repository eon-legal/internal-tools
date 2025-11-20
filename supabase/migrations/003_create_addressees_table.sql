-- Migration: Create addressees table
-- Description: Migrates the addressee (destinatarios) feature from Firebase Firestore to Supabase
-- Date: 2025-01-20

-- Create addressees table
CREATE TABLE IF NOT EXISTS addressees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_destination TEXT NOT NULL,
  account_destination TEXT,
  address_destination TEXT,
  name_bank TEXT,
  address_bank TEXT,
  nif TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE addressees IS 'Stores frequently used invoice recipients/addressees for quick selection';

-- Add comments to columns
COMMENT ON COLUMN addressees.id IS 'Unique identifier (UUID)';
COMMENT ON COLUMN addressees.name_destination IS 'Name of the recipient/destination';
COMMENT ON COLUMN addressees.account_destination IS 'Bank account number of the recipient';
COMMENT ON COLUMN addressees.address_destination IS 'Physical address of the recipient';
COMMENT ON COLUMN addressees.name_bank IS 'Name of the recipient''s bank';
COMMENT ON COLUMN addressees.address_bank IS 'Address of the recipient''s bank';
COMMENT ON COLUMN addressees.nif IS 'Tax identification number (NIF) of the recipient';
COMMENT ON COLUMN addressees.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN addressees.updated_at IS 'Timestamp when the record was last updated';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_addressees_name_destination ON addressees(name_destination);
CREATE INDEX IF NOT EXISTS idx_addressees_nif ON addressees(nif);
CREATE INDEX IF NOT EXISTS idx_addressees_created_at ON addressees(created_at DESC);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_addressees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_addressees_updated_at
  BEFORE UPDATE ON addressees
  FOR EACH ROW
  EXECUTE FUNCTION update_addressees_updated_at();

-- Enable Row Level Security
ALTER TABLE addressees ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Note: Allows both anonymous and authenticated access for internal tool usage
CREATE POLICY "Allow all operations on addressees"
  ON addressees FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Insert some sample data (optional - can be removed if migrating from Firebase)
INSERT INTO addressees (name_destination, account_destination, address_destination, name_bank, address_bank, nif)
VALUES 
  ('Sample Recipient 1', 'ES1234567890123456789012', '123 Main St, Madrid, Spain', 'Banco Santander', 'Paseo de la Castellana, Madrid', 'B12345678'),
  ('Sample Recipient 2', 'ES9876543210987654321098', '456 Oak Ave, Barcelona, Spain', 'BBVA', 'Gran Via, Barcelona', 'B87654321')
ON CONFLICT DO NOTHING;

