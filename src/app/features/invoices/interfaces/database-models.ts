/**
 * Database Models for Invoice Management System
 * 
 * These interfaces represent the database schema for Supabase tables.
 * They match the structure defined in supabase/migrations/001_initial_schema.sql
 */

/**
 * Company/Client information
 * Corresponds to the 'companies' table in Supabase
 */
export interface Company {
  id: string; // UUID
  name: string;
  address?: string;
  passport?: string;
  national: boolean;
  nif?: string;
  is_default: boolean;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * Invoice line item
 * Stored as JSONB in the invoice_items column
 */
export interface InvoiceItem {
  id: string | number;
  description: string;
  qtt?: number; // quantity
  price?: number;
  total: number;
  sTotal: number; // subtotal with IVA
  perCentIva: number; // IVA percentage
}

/**
 * Complete invoice record
 * Corresponds to the 'invoices' table in Supabase
 */
export interface Invoice {
  id: string; // UUID (not visible to users)
  invoice_number: string; // User-visible invoice reference (e.g., "EON-25-L001")
  invoice_date: string; // ISO 8601 timestamp (UTC)
  company_id?: string; // UUID reference to companies table
  
  // Sender information (from first form)
  sender_name?: string;
  sender_address?: string;
  sender_passport?: string;
  sender_national: boolean;
  
  // Destination information (from second form)
  destination_name?: string;
  destination_account?: string;
  destination_address?: string;
  destination_bank_name?: string;
  destination_bank_address?: string;
  destination_nif?: string;
  
  // Invoice line items
  invoice_items: InvoiceItem[];
  
  // Calculated totals
  subtotal: number;
  iva_amount: number;
  total_amount: number;
  
  // Status and metadata
  paid: boolean;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  last_download_at?: string; // ISO 8601 timestamp
}

/**
 * Invoice data preset for autocomplete
 * Corresponds to the 'invoice_data_presets' table in Supabase
 */
export interface InvoiceDataPreset {
  id: string; // UUID
  description: string;
  default_price?: number;
  default_quantity: number;
  default_iva_percent: number;
  usage_count: number;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * DTO for creating a new invoice
 * Omits auto-generated fields
 */
export interface CreateInvoiceDto {
  invoice_date: string; // ISO 8601 timestamp
  company_id?: string;
  sender_name?: string;
  sender_address?: string;
  sender_passport?: string;
  sender_national: boolean;
  destination_name?: string;
  destination_account?: string;
  destination_address?: string;
  destination_bank_name?: string;
  destination_bank_address?: string;
  destination_nif?: string;
  invoice_items: InvoiceItem[];
  subtotal: number;
  iva_amount: number;
  total_amount: number;
}

/**
 * DTO for updating an existing invoice
 * Allows partial updates
 */
export interface UpdateInvoiceDto {
  invoice_date?: string;
  company_id?: string;
  sender_name?: string;
  sender_address?: string;
  sender_passport?: string;
  sender_national?: boolean;
  destination_name?: string;
  destination_account?: string;
  destination_address?: string;
  destination_bank_name?: string;
  destination_bank_address?: string;
  destination_nif?: string;
  invoice_items?: InvoiceItem[];
  subtotal?: number;
  iva_amount?: number;
  total_amount?: number;
  paid?: boolean;
  last_download_at?: string;
}

/**
 * Filter options for querying invoices
 */
export interface InvoiceFilters {
  start_date?: string; // ISO 8601 timestamp
  end_date?: string; // ISO 8601 timestamp
  paid?: boolean;
  company_id?: string;
  search_term?: string; // Search in invoice_number, sender_name, destination_name
}

