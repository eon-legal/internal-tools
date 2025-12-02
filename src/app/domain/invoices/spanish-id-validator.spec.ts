import {
  validateDNI,
  validateNIE,
  validateCIF,
  validateSpanishId,
  getIdFormatHint,
} from './spanish-id-validator';

describe('Spanish ID Validator', () => {
  describe('validateDNI', () => {
    it('should validate correct DNI with correct letter', () => {
      // 12345678 % 23 = 14, letter at index 14 is 'Z'
      expect(validateDNI('12345678Z')).toBe(true);
    });

    it('should validate DNI with lowercase letter', () => {
      expect(validateDNI('12345678z')).toBe(true);
    });

    it('should reject DNI with wrong letter', () => {
      expect(validateDNI('12345678A')).toBe(false);
    });

    it('should reject DNI with wrong format', () => {
      expect(validateDNI('1234567Z')).toBe(false); // Only 7 digits
      expect(validateDNI('123456789Z')).toBe(false); // 9 digits
      expect(validateDNI('ABCDEFGHZ')).toBe(false); // Letters instead of digits
      expect(validateDNI('')).toBe(false);
    });

    it('should validate various correct DNIs', () => {
      // 00000000 % 23 = 0, letter at index 0 is 'T'
      expect(validateDNI('00000000T')).toBe(true);
      // 00000001 % 23 = 1, letter at index 1 is 'R'
      expect(validateDNI('00000001R')).toBe(true);
    });
  });

  describe('validateNIE', () => {
    it('should validate correct NIE starting with X', () => {
      // X1234567 -> 01234567, 1234567 % 23 = 19, letter at index 19 is 'L'
      expect(validateNIE('X1234567L')).toBe(true);
    });

    it('should validate correct NIE starting with Y', () => {
      // Y1234567 -> 11234567, 11234567 % 23 = 10, letter at index 10 is 'X'
      expect(validateNIE('Y1234567X')).toBe(true);
    });

    it('should validate correct NIE starting with Z', () => {
      // Z1234567 -> 21234567, 21234567 % 23 = 1, letter at index 1 is 'R'
      expect(validateNIE('Z1234567R')).toBe(true);
    });

    it('should validate NIE with lowercase prefix', () => {
      // x1234567L (same as X1234567L)
      expect(validateNIE('x1234567L')).toBe(true);
    });

    it('should reject NIE with wrong letter', () => {
      expect(validateNIE('X1234567Z')).toBe(false);
    });

    it('should reject NIE with wrong format', () => {
      expect(validateNIE('A1234567L')).toBe(false); // Wrong prefix
      expect(validateNIE('X123456L')).toBe(false); // Only 6 digits
      expect(validateNIE('X12345678L')).toBe(false); // 8 digits
      expect(validateNIE('')).toBe(false);
    });
  });

  describe('validateCIF', () => {
    it('should validate correct CIF with digit control (type A)', () => {
      // Type A requires digit control
      // B12345674 - let's verify manually
      expect(validateCIF('A58818501')).toBe(true);
    });

    it('should validate correct CIF with letter control (type P)', () => {
      // Type P requires letter control
      expect(validateCIF('P1234567D')).toBe(true);
    });

    it('should reject CIF with wrong control character', () => {
      expect(validateCIF('B12345670')).toBe(false);
    });

    it('should reject CIF with wrong format', () => {
      expect(validateCIF('123456789')).toBe(false); // No letter prefix
      expect(validateCIF('BABCDEFGH')).toBe(false); // Letters instead of digits
      expect(validateCIF('B1234567')).toBe(false); // Missing control
      expect(validateCIF('')).toBe(false);
    });

    it('should validate CIF with lowercase letters', () => {
      expect(validateCIF('a58818501')).toBe(true);
    });
  });

  describe('validateSpanishId', () => {
    it('should validate DNI type', () => {
      expect(validateSpanishId('12345678Z', 'DNI')).toBe(true);
      expect(validateSpanishId('12345678A', 'DNI')).toBe(false);
    });

    it('should validate NIE type', () => {
      expect(validateSpanishId('X1234567L', 'NIE')).toBe(true);
      expect(validateSpanishId('X1234567Z', 'NIE')).toBe(false);
    });

    it('should validate CIF type', () => {
      expect(validateSpanishId('A58818501', 'CIF')).toBe(true);
      expect(validateSpanishId('B12345670', 'CIF')).toBe(false);
    });

    it('should validate Passport type (basic length check)', () => {
      expect(validateSpanishId('ABC123456', 'Passport')).toBe(true);
      expect(validateSpanishId('AB12', 'Passport')).toBe(false); // Too short
      expect(validateSpanishId('', 'Passport')).toBe(false);
    });

    it('should handle empty values', () => {
      expect(validateSpanishId('', 'DNI')).toBe(false);
      expect(validateSpanishId('   ', 'DNI')).toBe(false);
    });

    it('should trim whitespace', () => {
      expect(validateSpanishId(' 12345678Z ', 'DNI')).toBe(true);
    });
  });

  describe('getIdFormatHint', () => {
    it('should return correct hints for each type', () => {
      expect(getIdFormatHint('DNI')).toBe('12345678Z');
      expect(getIdFormatHint('NIE')).toBe('X1234567L');
      expect(getIdFormatHint('CIF')).toBe('B12345678');
      expect(getIdFormatHint('Passport')).toBe('ABC123456');
    });
  });
});

