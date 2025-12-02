import {
  generateNextInvoiceNumber,
  formatInvoiceNumber,
  parseInvoiceNumber,
  isValidInvoiceNumber,
} from './invoice-number-generator';

describe('Invoice Number Generator', () => {
  describe('generateNextInvoiceNumber', () => {
    it('should generate first invoice number when no previous invoice exists', () => {
      const result = generateNextInvoiceNumber(null, 2025);
      expect(result).toBe('EON-25-L001');
    });

    it('should increment sequence number for same year', () => {
      const result = generateNextInvoiceNumber('EON-25-L001', 2025);
      expect(result).toBe('EON-25-L002');
    });

    it('should handle large sequence numbers', () => {
      const result = generateNextInvoiceNumber('EON-25-L042', 2025);
      expect(result).toBe('EON-25-L043');
    });

    it('should handle sequence numbers close to 999', () => {
      const result = generateNextInvoiceNumber('EON-25-L998', 2025);
      expect(result).toBe('EON-25-L999');
    });

    it('should reset sequence to 001 when year changes', () => {
      const result = generateNextInvoiceNumber('EON-25-L999', 2026);
      expect(result).toBe('EON-26-L001');
    });

    it('should reset sequence to 001 when year changes (mid-sequence)', () => {
      const result = generateNextInvoiceNumber('EON-25-L042', 2026);
      expect(result).toBe('EON-26-L001');
    });

    it('should use current year when not specified', () => {
      const currentYear = new Date().getFullYear();
      const twoDigitYear = currentYear.toString().slice(-2);
      const result = generateNextInvoiceNumber(null);
      expect(result).toBe(`EON-${twoDigitYear}-L001`);
    });

    it('should handle year transition from 2099 to 2100', () => {
      const result = generateNextInvoiceNumber('EON-99-L042', 2100);
      expect(result).toBe('EON-00-L001');
    });
  });

  describe('formatInvoiceNumber', () => {
    it('should format invoice number with single digit sequence', () => {
      const result = formatInvoiceNumber('25', 1);
      expect(result).toBe('EON-25-L001');
    });

    it('should format invoice number with double digit sequence', () => {
      const result = formatInvoiceNumber('25', 42);
      expect(result).toBe('EON-25-L042');
    });

    it('should format invoice number with triple digit sequence', () => {
      const result = formatInvoiceNumber('25', 999);
      expect(result).toBe('EON-25-L999');
    });

    it('should pad sequence with leading zeros', () => {
      const result = formatInvoiceNumber('25', 5);
      expect(result).toBe('EON-25-L005');
    });
  });

  describe('parseInvoiceNumber', () => {
    it('should parse valid invoice number', () => {
      const result = parseInvoiceNumber('EON-25-L042');
      expect(result).toEqual({
        prefix: 'EON',
        year: '25',
        category: 'L',
        sequence: 42,
        full: 'EON-25-L042',
      });
    });

    it('should parse invoice number with sequence 001', () => {
      const result = parseInvoiceNumber('EON-25-L001');
      expect(result.sequence).toBe(1);
    });

    it('should parse invoice number with sequence 999', () => {
      const result = parseInvoiceNumber('EON-25-L999');
      expect(result.sequence).toBe(999);
    });

    it('should throw error for invalid format - missing prefix', () => {
      expect(() => parseInvoiceNumber('25-L042')).toThrow(
        'Invalid invoice number format'
      );
    });

    it('should throw error for invalid format - wrong year length', () => {
      expect(() => parseInvoiceNumber('EON-2025-L042')).toThrow(
        'Invalid invoice number format'
      );
    });

    it('should throw error for invalid format - wrong sequence length', () => {
      expect(() => parseInvoiceNumber('EON-25-L42')).toThrow(
        'Invalid invoice number format'
      );
    });

    it('should throw error for invalid format - missing category', () => {
      expect(() => parseInvoiceNumber('EON-25-042')).toThrow(
        'Invalid invoice number format'
      );
    });

    it('should throw error for empty string', () => {
      expect(() => parseInvoiceNumber('')).toThrow(
        'Invalid invoice number format'
      );
    });

    it('should throw error for completely wrong format', () => {
      expect(() => parseInvoiceNumber('INVALID-NUMBER')).toThrow(
        'Invalid invoice number format'
      );
    });
  });

  describe('isValidInvoiceNumber', () => {
    it('should return true for valid invoice number', () => {
      expect(isValidInvoiceNumber('EON-25-L042')).toBe(true);
    });

    it('should return true for valid invoice number with sequence 001', () => {
      expect(isValidInvoiceNumber('EON-25-L001')).toBe(true);
    });

    it('should return true for valid invoice number with sequence 999', () => {
      expect(isValidInvoiceNumber('EON-25-L999')).toBe(true);
    });

    it('should return false for invalid format', () => {
      expect(isValidInvoiceNumber('INVALID')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidInvoiceNumber('')).toBe(false);
    });

    it('should return false for wrong sequence length', () => {
      expect(isValidInvoiceNumber('EON-25-L42')).toBe(false);
    });
  });
});

