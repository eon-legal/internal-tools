/**
 * Database Models for Invoice Management System
 * 
 * These interfaces represent the database schema for Supabase tables.
 * They match the structure defined in supabase/migrations/001_initial_schema.sql
 */

/**
 * Client type discriminator
 */
export type ClientType = 'individual' | 'company';

/**
 * Base client information (common fields)
 * Corresponds to the 'clients' table in Supabase
 */
export interface BaseClient {
  id: string; // UUID
  client_type: ClientType;
  address?: string;
  passport?: string;
  national: boolean;
  nif?: string; // Tax ID (applies to both individuals and companies)
  email?: string; // Used to deliver Cecabank TPV payment links
  is_default: boolean;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * Individual client (person)
 */
export interface IndividualClient extends BaseClient {
  client_type: 'individual';
  first_name: string;
  last_name: string;
  personal_id?: string; // DNI, NIE, etc.
  // Company-specific fields are undefined for individuals
  company_name?: never;
  company_registration_number?: never;
}

/**
 * Company client (business entity)
 */
export interface CompanyClient extends BaseClient {
  client_type: 'company';
  company_name: string;
  company_registration_number?: string;
  // Individual-specific fields are undefined for companies
  first_name?: never;
  last_name?: never;
  personal_id?: never;
}

/**
 * Union type for all client types
 * These are customers being invoiced (not the invoice issuer)
 */
export type Client = IndividualClient | CompanyClient;

/**
 * DTO for creating a new client (discriminated union)
 */
export type CreateClientDto =
  | Omit<IndividualClient, 'id' | 'created_at' | 'updated_at'>
  | Omit<CompanyClient, 'id' | 'created_at' | 'updated_at'>;

/**
 * DTO for updating a client (partial updates allowed)
 */
export type UpdateClientDto = Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>;

/**
 * Helper type guards
 */
export function isIndividualClient(client: Client): client is IndividualClient {
  return client.client_type === 'individual';
}

export function isCompanyClient(client: Client): client is CompanyClient {
  return client.client_type === 'company';
}

/**
 * Helper function to get display name for any client
 */
export function getClientDisplayName(client: Client): string {
  if (isIndividualClient(client)) {
    return `${client.first_name} ${client.last_name}`;
  }
  return client.company_name;
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
  client_id?: string; // UUID reference to clients table

  // Sender information (from first form)
  sender_name?: string;
  sender_identification_type?: string; // DNI, NIE, Passport, or CIF
  sender_identification?: string;
  /** @deprecated Use sender_identification instead */
  sender_passport?: string;

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
  paid_at?: string; // ISO 8601 timestamp — when the invoice was marked as paid
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
  client_id?: string;
  sender_name?: string;
  sender_identification_type?: string;
  sender_identification?: string;
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
  client_id?: string;
  sender_name?: string;
  sender_identification_type?: string;
  sender_identification?: string;
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
  paid_at?: string | null; // Set when marking paid, null when unmarking
  last_download_at?: string;
}

/**
 * Filter options for querying invoices
 */
export interface InvoiceFilters {
  start_date?: string; // ISO 8601 timestamp
  end_date?: string; // ISO 8601 timestamp
  paid?: boolean;
  client_id?: string;
  search_term?: string; // Search in invoice_number, sender_name, destination_name
}

