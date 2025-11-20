/**
 * Invoice Number Generator
 * 
 * Responsibilities:
 * - Generate invoice numbers following the format: EON-YY-LXXX
 * - Handle year rollover (reset sequential number to 001 when year changes)
 * - Parse existing invoice numbers to extract year and sequence
 * 
 * Business Rules:
 * - Format: EON-YY-LXXX where:
 *   - EON: Fixed prefix (hardcoded)
 *   - YY: Two-digit current year (e.g., 25 for 2025)
 *   - L: Fixed category code for "Legal" (hardcoded for MVP)
 *   - XXX: Sequential number with leading zeros (001, 002, 003, etc.)
 * - Sequential numbers reset to 001 when the year changes
 * - Example: EON-25-L999 → EON-26-L001
 * 
 * Invariants:
 * - Invoice numbers are always unique
 * - Sequential numbers are always 3 digits with leading zeros
 * - Year is always 2 digits
 * 
 * Dependencies: None (pure TypeScript, framework-agnostic)
 * 
 * Side Effects: None (pure functions)
 */

const INVOICE_PREFIX = 'EON';
const CATEGORY_CODE = 'L'; // Legal category
const SEQUENCE_LENGTH = 3;

/**
 * Represents a parsed invoice number
 */
export interface ParsedInvoiceNumber {
  prefix: string;
  year: string;
  category: string;
  sequence: number;
  full: string;
}

/**
 * Generates the next invoice number based on the last invoice number
 * 
 * @param lastInvoiceNumber - The last invoice number in the database (e.g., "EON-25-L042")
 * @param currentYear - The current year (optional, defaults to current year)
 * @returns The next invoice number (e.g., "EON-25-L043" or "EON-26-L001" if year changed)
 * 
 * @example
 * // Same year
 * generateNextInvoiceNumber("EON-25-L042") // Returns "EON-25-L043"
 * 
 * @example
 * // Year rollover
 * generateNextInvoiceNumber("EON-25-L999", 2026) // Returns "EON-26-L001"
 * 
 * @example
 * // No previous invoice (first invoice of the year)
 * generateNextInvoiceNumber(null) // Returns "EON-25-L001" (assuming current year is 2025)
 */
export function generateNextInvoiceNumber(
  lastInvoiceNumber: string | null,
  currentYear?: number
): string {
  const year = currentYear ?? new Date().getFullYear();
  const twoDigitYear = year.toString().slice(-2);

  // If no previous invoice, start with 001
  if (!lastInvoiceNumber) {
    return formatInvoiceNumber(twoDigitYear, 1);
  }

  // Parse the last invoice number
  const parsed = parseInvoiceNumber(lastInvoiceNumber);

  // If the year has changed, reset to 001
  if (parsed.year !== twoDigitYear) {
    return formatInvoiceNumber(twoDigitYear, 1);
  }

  // Otherwise, increment the sequence
  const nextSequence = parsed.sequence + 1;
  return formatInvoiceNumber(twoDigitYear, nextSequence);
}

/**
 * Formats an invoice number from year and sequence
 * 
 * @param twoDigitYear - Two-digit year (e.g., "25")
 * @param sequence - Sequential number (e.g., 42)
 * @returns Formatted invoice number (e.g., "EON-25-L042")
 */
export function formatInvoiceNumber(
  twoDigitYear: string,
  sequence: number
): string {
  const paddedSequence = sequence.toString().padStart(SEQUENCE_LENGTH, '0');
  return `${INVOICE_PREFIX}-${twoDigitYear}-${CATEGORY_CODE}${paddedSequence}`;
}

/**
 * Parses an invoice number into its components
 * 
 * @param invoiceNumber - The invoice number to parse (e.g., "EON-25-L042")
 * @returns Parsed invoice number components
 * @throws Error if the invoice number format is invalid
 * 
 * @example
 * parseInvoiceNumber("EON-25-L042")
 * // Returns: { prefix: "EON", year: "25", category: "L", sequence: 42, full: "EON-25-L042" }
 */
export function parseInvoiceNumber(invoiceNumber: string): ParsedInvoiceNumber {
  // Expected format: EON-YY-LXXX
  const regex = /^([A-Z]+)-(\d{2})-([A-Z])(\d{3})$/;
  const match = invoiceNumber.match(regex);

  if (!match) {
    throw new Error(
      `Invalid invoice number format: ${invoiceNumber}. Expected format: EON-YY-LXXX`
    );
  }

  const [, prefix, year, category, sequenceStr] = match;

  return {
    prefix: prefix!,
    year: year!,
    category: category!,
    sequence: parseInt(sequenceStr!, 10),
    full: invoiceNumber,
  };
}

/**
 * Validates an invoice number format
 * 
 * @param invoiceNumber - The invoice number to validate
 * @returns True if valid, false otherwise
 */
export function isValidInvoiceNumber(invoiceNumber: string): boolean {
  try {
    parseInvoiceNumber(invoiceNumber);
    return true;
  } catch {
    return false;
  }
}

