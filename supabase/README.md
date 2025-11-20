# Supabase Database Setup

This directory contains database migrations and schema documentation for the Invoice Management System.

## Prerequisites

1. Create a Supabase project at [https://supabase.com](https://supabase.com)
2. Get your project URL and anon key from Project Settings > API
3. Update the environment files with your Supabase credentials:
   - `src/environments/environment.ts` (development)
   - `src/environments/environment.prod.ts` (production)

## Database Schema

### Tables

#### `companies`
Stores company/client information that can be reused across invoices.

**Fields:**
- `id` (UUID): Primary key
- `name` (VARCHAR): Company name
- `address` (TEXT): Company address
- `passport` (VARCHAR): Passport number (for non-national companies)
- `national` (BOOLEAN): Whether the company is national
- `nif` (VARCHAR): Tax identification number
- `is_default` (BOOLEAN): Whether this is the default company
- `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

**Constraints:**
- Only one company can be marked as default

#### `invoices`
Stores all invoice records with complete invoice data.

**Fields:**
- `id` (UUID): Primary key (not visible to users)
- `invoice_number` (VARCHAR): User-visible invoice reference (format: `EON-YY-LXXX`)
- `invoice_date` (TIMESTAMPTZ): Invoice date (stored as UTC)
- `company_id` (UUID): Foreign key to companies table
- `sender_*`: Sender information fields
- `destination_*`: Destination/recipient information fields
- `invoice_items` (JSONB): Array of invoice line items
- `subtotal`, `iva_amount`, `total_amount` (DECIMAL): Calculated totals
- `paid` (BOOLEAN): Payment status
- `created_at`, `updated_at`, `last_download_at` (TIMESTAMPTZ): Timestamps

**Invoice Number Format:**
- `EON-YY-LXXX` where:
  - `EON`: Fixed prefix
  - `YY`: Two-digit year (e.g., `25` for 2025)
  - `L`: Category code for "Legal"
  - `XXX`: Sequential number with leading zeros (001, 002, etc.)

**Year Rollover:**
- Sequential numbers reset to 001 when the year changes
- Example: `EON-25-L999` → `EON-26-L001`

#### `invoice_data_presets`
Stores frequently used invoice line items for autocomplete functionality.

**Fields:**
- `id` (UUID): Primary key
- `description` (VARCHAR): Item description
- `default_price` (DECIMAL): Default price
- `default_quantity` (INTEGER): Default quantity
- `default_iva_percent` (INTEGER): Default IVA percentage
- `usage_count` (INTEGER): Number of times used
- `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

## Running Migrations

### Option 1: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. Run migrations:
   ```bash
   supabase db push
   ```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `migrations/001_initial_schema.sql`
4. Paste and run the SQL

## Row Level Security (RLS)

All tables have RLS enabled. Current policies allow all authenticated users to perform all operations.

**TODO:** Refine RLS policies based on actual authentication and authorization requirements.

## Indexes

The schema includes indexes for:
- Fast invoice number lookups
- Date-based filtering and sorting
- Company lookups
- Payment status filtering
- Autocomplete searches on invoice data presets

## Automatic Timestamps

All tables have automatic `updated_at` timestamp updates via database triggers.

## Next Steps

After running the migrations:
1. Verify tables were created successfully in Supabase Dashboard > Table Editor
2. Check that the default company was inserted
3. Test the connection from the Angular application
4. Implement the data-access services to interact with these tables

