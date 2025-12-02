import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import {
  validateDNI,
  validateNIE,
  validateCIF,
} from '../../domain/invoices/spanish-id-validator';

/** Error key used by the spanishIdValidator for all ID types */
export const SPANISH_ID_ERROR_KEY = 'spanishId';

/**
 * Angular validator for Spanish identification documents.
 * Validates DNI, NIE, CIF based on the provided type.
 *
 * @param type - The identification type to validate against
 * @returns ValidatorFn that returns validation errors or null
 */
export function spanishIdValidator(
  type: 'DNI' | 'NIE' | 'CIF' | 'Passport'
): ValidatorFn {
  // Named function to help with error message lookup
  const validator = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    // Allow empty values (use Validators.required separately if needed)
    if (!value || value.trim() === '') {
      return null;
    }

    const trimmedValue = value.trim();

    switch (type) {
      case 'DNI':
        return validateDNI(trimmedValue) ? null : { [SPANISH_ID_ERROR_KEY]: true };
      case 'NIE':
        return validateNIE(trimmedValue) ? null : { [SPANISH_ID_ERROR_KEY]: true };
      case 'CIF':
        return validateCIF(trimmedValue) ? null : { [SPANISH_ID_ERROR_KEY]: true };
      case 'Passport':
        // Passport: basic length validation (5-20 characters)
        const isValidPassport =
          trimmedValue.length >= 5 && trimmedValue.length <= 20;
        return isValidPassport ? null : { [SPANISH_ID_ERROR_KEY]: true };
      default:
        return null;
    }
  };

  // Set the name property for the validator function lookup
  Object.defineProperty(validator, 'name', { value: SPANISH_ID_ERROR_KEY });
  return validator;
}

/**
 * Gets the appropriate error message key for the identification type
 *
 * @param type - The identification type
 * @returns The i18n key for the error message
 */
export function getIdValidationErrorKey(
  type: 'DNI' | 'NIE' | 'CIF' | 'Passport'
): string {
  switch (type) {
    case 'DNI':
      return 'invoices.sender_form.validation.invalid_dni';
    case 'NIE':
      return 'invoices.sender_form.validation.invalid_nie';
    case 'CIF':
      return 'invoices.sender_form.validation.invalid_cif';
    case 'Passport':
      return 'invoices.sender_form.validation.invalid_passport';
    default:
      return 'common.validation.required';
  }
}

