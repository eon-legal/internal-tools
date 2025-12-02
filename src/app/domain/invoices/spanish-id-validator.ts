/**
 * Spanish Identification Document Validator
 *
 * Validates DNI, NIE, and CIF Spanish identification numbers with checksum verification.
 *
 * DNI: 8 digits + 1 letter (e.g., 12345678Z)
 * NIE: X/Y/Z + 7 digits + 1 letter (e.g., X1234567L)
 * CIF: 1 letter + 7 digits + 1 control char (e.g., B12345678)
 */

/** Letter table for DNI/NIE checksum validation */
const DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';

/** Letter table for CIF control character */
const CIF_CONTROL_LETTERS = 'JABCDEFGHI';

/** Regex patterns for format validation */
const PATTERNS = {
  DNI: /^[0-9]{8}[A-Za-z]$/,
  NIE: /^[XYZxyz][0-9]{7}[A-Za-z]$/,
  CIF: /^[ABCDEFGHJKLMNPQRSUVWabcdefghjklmnpqrsuvw][0-9]{7}[0-9A-Ja-j]$/,
};

/**
 * Validates a Spanish DNI (Documento Nacional de Identidad)
 * Format: 8 digits + 1 letter
 *
 * @param dni - The DNI to validate
 * @returns true if valid, false otherwise
 */
export function validateDNI(dni: string): boolean {
  if (!dni || !PATTERNS.DNI.test(dni)) {
    return false;
  }

  const number = parseInt(dni.substring(0, 8), 10);
  const letter = dni.charAt(8).toUpperCase();
  const expectedLetter = DNI_LETTERS.charAt(number % 23);

  return letter === expectedLetter;
}

/**
 * Validates a Spanish NIE (Número de Identidad de Extranjeros)
 * Format: X/Y/Z + 7 digits + 1 letter
 *
 * @param nie - The NIE to validate
 * @returns true if valid, false otherwise
 */
export function validateNIE(nie: string): boolean {
  if (!nie || !PATTERNS.NIE.test(nie)) {
    return false;
  }

  // Convert prefix letter to number: X=0, Y=1, Z=2
  const prefix = nie.charAt(0).toUpperCase();
  const prefixNumber = prefix === 'X' ? '0' : prefix === 'Y' ? '1' : '2';

  // Replace prefix and validate like DNI
  const convertedNumber = prefixNumber + nie.substring(1, 8);
  const number = parseInt(convertedNumber, 10);
  const letter = nie.charAt(8).toUpperCase();
  const expectedLetter = DNI_LETTERS.charAt(number % 23);

  return letter === expectedLetter;
}

/**
 * Validates a Spanish CIF (Código de Identificación Fiscal)
 * Format: 1 letter + 7 digits + 1 control character (digit or letter)
 *
 * @param cif - The CIF to validate
 * @returns true if valid, false otherwise
 */
export function validateCIF(cif: string): boolean {
  if (!cif || !PATTERNS.CIF.test(cif)) {
    return false;
  }

  const upperCif = cif.toUpperCase();
  const typeCode = upperCif.charAt(0);
  const digits = upperCif.substring(1, 8);
  const controlChar = upperCif.charAt(8);

  // Calculate checksum
  let evenSum = 0;
  let oddSum = 0;

  for (let i = 0; i < 7; i++) {
    const digit = parseInt(digits.charAt(i), 10);

    if (i % 2 === 0) {
      // Odd position (1st, 3rd, 5th, 7th) - multiply by 2 and sum digits
      const doubled = digit * 2;
      oddSum += Math.floor(doubled / 10) + (doubled % 10);
    } else {
      // Even position (2nd, 4th, 6th) - just add
      evenSum += digit;
    }
  }

  const totalSum = evenSum + oddSum;
  const controlDigit = (10 - (totalSum % 10)) % 10;
  const controlLetter = CIF_CONTROL_LETTERS.charAt(controlDigit);

  // Determine expected control character based on type code
  // PQRSNW -> must be letter
  // ABEH -> must be digit
  // Others -> can be either

  if ('PQRSNW'.includes(typeCode)) {
    return controlChar === controlLetter;
  } else if ('ABEH'.includes(typeCode)) {
    return controlChar === controlDigit.toString();
  } else {
    return controlChar === controlDigit.toString() || controlChar === controlLetter;
  }
}

/**
 * Validates a Spanish identification document based on its type
 *
 * @param value - The identification value to validate
 * @param type - The type of identification (DNI, NIE, CIF, Passport)
 * @returns true if valid, false otherwise
 */
export function validateSpanishId(
  value: string,
  type: 'DNI' | 'NIE' | 'CIF' | 'Passport'
): boolean {
  if (!value || value.trim() === '') {
    return false;
  }

  const trimmedValue = value.trim();

  switch (type) {
    case 'DNI':
      return validateDNI(trimmedValue);
    case 'NIE':
      return validateNIE(trimmedValue);
    case 'CIF':
      return validateCIF(trimmedValue);
    case 'Passport':
      // Passport: just check it's not empty and has reasonable length
      return trimmedValue.length >= 5 && trimmedValue.length <= 20;
    default:
      return false;
  }
}

/**
 * Gets the expected format hint for each identification type
 *
 * @param type - The type of identification
 * @returns Format hint string
 */
export function getIdFormatHint(type: 'DNI' | 'NIE' | 'CIF' | 'Passport'): string {
  switch (type) {
    case 'DNI':
      return '12345678Z';
    case 'NIE':
      return 'X1234567L';
    case 'CIF':
      return 'B12345678';
    case 'Passport':
      return 'ABC123456';
    default:
      return '';
  }
}

