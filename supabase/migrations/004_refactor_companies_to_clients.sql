-- =====================================================
-- Migration: Refactor companies table to clients table
-- Description: Rename companies to clients and add support for both individuals and companies
-- Date: 2025-11-20
-- =====================================================

-- Step 1: Rename the table
ALTER TABLE companies RENAME TO clients;

-- Step 2: Create client_type enum
CREATE TYPE client_type AS ENUM ('individual', 'company');

-- Step 3: Add new columns
ALTER TABLE clients
  ADD COLUMN client_type client_type NOT NULL DEFAULT 'company',
  ADD COLUMN first_name VARCHAR(100),
  ADD COLUMN last_name VARCHAR(100),
  ADD COLUMN company_name VARCHAR(255),
  ADD COLUMN company_registration_number VARCHAR(100),
  ADD COLUMN personal_id VARCHAR(100); -- DNI, NIE, or other personal ID

-- Step 4: Migrate existing data
-- Move existing 'name' values to 'company_name' for company-type clients
UPDATE clients
SET company_name = name,
    client_type = 'company'
WHERE client_type = 'company';

-- Step 5: Drop the old 'name' column (after data migration)
ALTER TABLE clients DROP COLUMN name;

-- Step 6: Add constraints
-- For companies: company_name is required
ALTER TABLE clients
  ADD CONSTRAINT check_company_has_name
  CHECK (
    (client_type = 'company' AND company_name IS NOT NULL) OR
    (client_type = 'individual')
  );

-- For individuals: first_name and last_name are required
ALTER TABLE clients
  ADD CONSTRAINT check_individual_has_names
  CHECK (
    (client_type = 'individual' AND first_name IS NOT NULL AND last_name IS NOT NULL) OR
    (client_type = 'company')
  );

-- Step 7: Update indexes
DROP INDEX IF EXISTS idx_companies_is_default;
DROP INDEX IF EXISTS idx_companies_single_default;

CREATE INDEX idx_clients_is_default ON clients(is_default) WHERE is_default = true;
CREATE UNIQUE INDEX idx_clients_single_default ON clients(is_default) WHERE is_default = true;
CREATE INDEX idx_clients_client_type ON clients(client_type);
CREATE INDEX idx_clients_company_name ON clients(company_name) WHERE client_type = 'company';
CREATE INDEX idx_clients_last_name ON clients(last_name) WHERE client_type = 'individual';

-- Step 8: Update foreign key references in invoices table
ALTER TABLE invoices
  RENAME COLUMN company_id TO client_id;

-- Update the foreign key constraint
ALTER TABLE invoices
  DROP CONSTRAINT IF EXISTS invoices_company_id_fkey;

ALTER TABLE invoices
  ADD CONSTRAINT invoices_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

-- Step 9: Update index on invoices table
DROP INDEX IF EXISTS idx_invoices_company_id;
CREATE INDEX idx_invoices_client_id ON invoices(client_id);

-- Step 10: Update trigger function name for consistency
DROP TRIGGER IF EXISTS trigger_update_companies_updated_at ON clients;
DROP FUNCTION IF EXISTS update_companies_updated_at();

CREATE OR REPLACE FUNCTION update_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_clients_updated_at();

-- Step 11: Update RLS policies
DROP POLICY IF EXISTS "Allow all operations on companies" ON clients;

CREATE POLICY "Allow all operations on clients"
  ON clients FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Step 12: Add comments for documentation
COMMENT ON TABLE clients IS 'Stores client information (both individuals and companies) - these are customers being invoiced';
COMMENT ON COLUMN clients.client_type IS 'Type of client: individual or company';
COMMENT ON COLUMN clients.first_name IS 'First name (for individuals only)';
COMMENT ON COLUMN clients.last_name IS 'Last name (for individuals only)';
COMMENT ON COLUMN clients.company_name IS 'Company name (for companies only)';
COMMENT ON COLUMN clients.company_registration_number IS 'Company registration number (for companies only)';
COMMENT ON COLUMN clients.personal_id IS 'Personal ID number - DNI, NIE, etc. (for individuals only)';
COMMENT ON COLUMN clients.nif IS 'Tax identification number (NIF/CIF) - applies to both individuals and companies';
COMMENT ON COLUMN clients.passport IS 'Passport number (for non-national clients)';
COMMENT ON COLUMN clients.address IS 'Physical address';
COMMENT ON COLUMN clients.national IS 'Whether the client is national (Spanish)';
COMMENT ON COLUMN clients.is_default IS 'Whether this is the default client (only one can be default)';

