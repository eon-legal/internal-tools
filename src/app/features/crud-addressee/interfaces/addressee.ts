/**
 * Addressee/Recipient Interfaces for Supabase
 * 
 * These interfaces represent the addressees table in Supabase.
 * Addressees are frequently used invoice recipients that can be selected
 * from a dropdown when creating invoices.
 */

/**
 * Complete addressee record from Supabase
 * Corresponds to the 'addressees' table
 */
export interface Addressee {
  id: string; // UUID
  name_destination: string;
  account_destination?: string;
  address_destination?: string;
  name_bank?: string;
  address_bank?: string;
  nif?: string;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * DTO for creating a new addressee
 * Omits auto-generated fields (id, created_at, updated_at)
 */
export interface CreateAddresseeDto {
  name_destination: string;
  account_destination?: string;
  address_destination?: string;
  name_bank?: string;
  address_bank?: string;
  nif?: string;
}

/**
 * DTO for updating an existing addressee
 * Allows partial updates
 */
export interface UpdateAddresseeDto {
  name_destination?: string;
  account_destination?: string;
  address_destination?: string;
  name_bank?: string;
  address_bank?: string;
  nif?: string;
}

/**
 * Addressee for dropdown selection
 * Used in forms to display addressee options
 */
export interface AddresseeOption {
  label: string; // Display name (name_destination)
  value: string; // Addressee ID
}

