# Invoice CRUD System Implementation

## Overview

This document describes the complete CRUD system for invoices with Supabase database persistence and history management that has been implemented in this Angular 18 application.

## Implementation Status

### ✅ Completed Features

1. **Supabase Integration**
   - Installed `@supabase/supabase-js` package
   - Created `SupabaseService` for client initialization
   - Added environment configuration for Supabase URL and anon key

2. **Database Schema**
   - Complete PostgreSQL schema with three tables:
     - `clients`: Customer information (supports both individuals and companies)
     - `invoices`: Invoice records with auto-generated invoice numbers
     - `invoice_data_presets`: Autocomplete presets for invoice data
   - Row Level Security (RLS) policies
   - Automatic timestamp triggers
   - Indexes for performance optimization
   - Database function for incrementing preset usage count

3. **Invoice Number Generation**
   - Format: `EON-YY-LXXX` (e.g., `EON-25-L001`)
   - Automatic year rollover (resets sequence to 001 on new year)
   - Pure TypeScript domain logic (framework-agnostic)
   - Comprehensive unit tests (27 tests, all passing)

4. **Data Access Layer**
   - `InvoicesDataService`: Full CRUD operations for invoices
   - `ClientsDataService`: CRUD operations for clients (customers)
   - `InvoicePresetsDataService`: CRUD operations for invoice presets
   - All services use RxJS observables with error handling

5. **State Management**
   - `InvoicesListStore`: Signal-based state management using `@ngrx/signals`
   - Manages invoice list, filters, selection, loading states
   - Methods for batch operations (mark as paid, delete)

6. **UI Components**
   - **Invoice History Component**: List view with filtering and batch operations
   - **Invoice Edit Component**: Edit existing invoices with validation
   - Delete functionality with confirmation dialogs

7. **Internationalization**
   - Complete English translations
   - Complete Spanish translations
   - All UI elements properly localized

### 📋 Remaining Tasks

1. **Update Invoice Creation Form**
   - Integrate with Supabase to save invoices
   - Auto-generate invoice numbers (remove manual input)
   - Pre-populate with default company data
   - Add autocomplete for invoice data using presets

2. **Write Unit Tests**
   - Tests for data access services
   - Tests for InvoicesListStore
   - Tests for UI components

## Architecture

### Project Structure

```
src/app/
├── data-access/
│   ├── supabase/
│   │   └── supabase.service.ts          # Supabase client singleton
│   ├── invoices/
│   │   └── invoices-data.service.ts     # Invoice CRUD operations
│   ├── clients/
│   │   └── clients-data.service.ts      # Client CRUD operations
│   └── invoice-presets/
│       └── invoice-presets-data.service.ts  # Preset CRUD operations
├── domain/
│   └── invoices/
│       ├── invoice-number-generator.ts  # Pure business logic
│       └── invoice-number-generator.spec.ts  # Unit tests
├── features/
│   └── invoices/
│       ├── components/
│       │   ├── invoice-history/         # List view component
│       │   ├── invoice-edit/            # Edit component
│       │   └── stepper-invoices-generate-pdf/  # Creation form (existing)
│       ├── interfaces/
│       │   └── database-models.ts       # TypeScript interfaces
│       └── state/
│           └── invoices-list.store.ts   # Signal store
└── environments/
    ├── environment.ts                   # Dev config
    └── environment.prod.ts              # Prod config

supabase/
├── migrations/
│   ├── 001_initial_schema.sql          # Database schema
│   └── 002_add_increment_usage_function.sql  # Stored function
└── README.md                            # Database setup guide
```

### Key Design Decisions

1. **Layered Architecture**
   - `domain/`: Framework-agnostic business logic
   - `data-access/`: Database operations with RxJS
   - `features/`: UI components and state management
   - Clear separation of concerns

2. **Signal-Based State Management**
   - Using `@ngrx/signals` for reactive state
   - Computed properties for derived state
   - RxJS integration via `rxMethod`

3. **Pure Domain Logic**
   - Invoice number generation is pure TypeScript
   - No Angular dependencies in domain layer
   - Easily testable and reusable

4. **Database-First Approach**
   - Auto-generated invoice numbers via database query
   - Automatic timestamps via database triggers
   - Row Level Security for data protection

## Database Schema

### Companies Table

Stores client/company information.

**Key Fields:**
- `id` (UUID): Primary key
- `name` (TEXT): Company name
- `address` (TEXT): Company address
- `nif` (TEXT): Tax identification number
- `is_default` (BOOLEAN): Only one company can be default
- Timestamps: `created_at`, `updated_at`

### Invoices Table

Stores invoice records with auto-generated invoice numbers.

**Key Fields:**
- `id` (UUID): Primary key
- `invoice_number` (TEXT): Auto-generated, unique (e.g., EON-25-L001)
- `invoice_date` (TIMESTAMPTZ): Invoice date
- `client_id` (UUID): Foreign key to clients table
- `sender_name`, `sender_address`, `sender_passport`: Sender info
- `destination_name`, `destination_account`, `destination_address`: Recipient info
- `bank_name`, `bank_address`: Bank info
- `nif` (TEXT): Recipient tax ID
- `invoice_items` (JSONB): Array of line items
- `total_amount` (DECIMAL): Total invoice amount
- `paid` (BOOLEAN): Payment status
- `last_download_at` (TIMESTAMPTZ): Last PDF download timestamp
- Timestamps: `created_at`, `updated_at`

### Invoice Data Presets Table

Stores autocomplete presets for invoice data.

**Key Fields:**
- `id` (UUID): Primary key
- `description` (TEXT): Preset description
- `unit_price` (DECIMAL): Default unit price
- `usage_count` (INTEGER): Tracks how often preset is used
- Timestamps: `created_at`, `updated_at`

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned
3. Note your project URL and anon key from Settings > API

### 2. Run Database Migrations

```bash
# Navigate to supabase directory
cd supabase

# Run migrations using Supabase CLI or SQL Editor
# Copy contents of migrations/001_initial_schema.sql
# Paste into Supabase SQL Editor and execute

# Then run the second migration
# Copy contents of migrations/002_add_increment_usage_function.sql
# Paste into Supabase SQL Editor and execute
```

### 3. Configure Environment

Update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'YOUR_SUPABASE_PROJECT_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY',
  },
};
```

Update `src/environments/environment.prod.ts` with production credentials.

### 4. Install Dependencies

Dependencies are already installed. If needed:

```bash
npm install
```

### 5. Run the Application

```bash
npm start
```

Navigate to `http://localhost:4200/invoices` to see the invoice history view.

## Usage Guide

### Viewing Invoice History

1. Navigate to `/invoices`
2. View all invoices in a paginated table
3. Use filters to search by:
   - Invoice number, sender, or recipient (search box)
   - Date range (start and end date)
   - Payment status (all, paid, unpaid)

### Creating an Invoice

1. Click "Create New Invoice" button
2. Navigate to `/invoices/create`
3. Fill in the invoice creation form
4. Invoice number will be auto-generated on save

**Note:** The creation form still needs to be updated to integrate with Supabase.

### Editing an Invoice

1. From invoice history, click the edit icon (pencil) on any invoice
2. Modify any fields except invoice number (read-only)
3. Click "Save" to update
4. Changes are saved to Supabase with automatic `updated_at` timestamp

### Deleting Invoices

**Single Delete:**
1. Click the delete icon (trash) on any invoice
2. Confirm the deletion in the dialog

**Batch Delete:**
1. Select multiple invoices using checkboxes
2. Click "Delete Selected" button
3. Confirm the deletion

### Marking Invoices as Paid

**Batch Operation:**
1. Select invoices using checkboxes
2. Click "Mark as Paid" button
3. Confirm the action
4. Selected invoices will be marked as paid

### Downloading Invoices

**Single Download:**
- Click the download icon on any invoice
- Updates `last_download_at` timestamp

**Batch Download:**
- Select multiple invoices
- Click "Download Selected" button

**Note:** PDF generation is not yet implemented. Placeholder messages are shown.

## API Reference

### InvoicesDataService

```typescript
// Get all invoices with optional filters
getInvoices(filters?: InvoiceFilters): Observable<Invoice[]>

// Get single invoice by ID
getInvoiceById(id: string): Observable<Invoice>

// Create new invoice (auto-generates invoice number)
createInvoice(invoiceData: CreateInvoiceDto): Observable<Invoice>

// Update existing invoice
updateInvoice(id: string, updates: UpdateInvoiceDto): Observable<Invoice>

// Delete single invoice
deleteInvoice(id: string): Observable<void>

// Batch mark as paid
markInvoicesAsPaid(invoiceIds: string[]): Observable<Invoice[]>

// Batch delete
deleteInvoices(invoiceIds: string[]): Observable<void>

// Update download timestamp
updateDownloadTimestamp(id: string): Observable<Invoice>
```

## Testing

### Running Unit Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- invoice-number-generator.spec.ts
```

### Test Coverage

- ✅ Invoice number generation (27 tests)
- ⏳ Data access services (pending)
- ⏳ InvoicesListStore (pending)
- ⏳ UI components (pending)

## Next Steps

1. **Update Invoice Creation Form**
   - Remove manual invoice number input
   - Integrate with `InvoicesDataService.createInvoice()`
   - Add autocomplete using `InvoicePresetsDataService`
   - Pre-populate sender data from default company

2. **Implement PDF Generation**
   - Integrate existing PDF service with new data structure
   - Support batch PDF download
   - Update download timestamps

3. **Write Additional Tests**
   - Unit tests for data services
   - Unit tests for store
   - Component tests

4. **Add More Features**
   - Invoice templates
   - Email invoices
   - Export to Excel/CSV
   - Invoice analytics dashboard

## Troubleshooting

### Supabase Connection Issues

- Verify URL and anon key in environment files
- Check Supabase project status
- Ensure RLS policies are correctly configured

### Invoice Number Generation Issues

- Check that migrations have been run
- Verify `invoices` table exists
- Check for existing invoices in the database

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Contributing

When making changes to this system:

1. Follow the existing architecture patterns
2. Keep domain logic pure (no framework dependencies)
3. Write unit tests for new functionality
4. Update this documentation
5. Follow Angular 18 standalone component patterns
6. Use `@ngrx/signals` for state management

## License

Internal use only.


