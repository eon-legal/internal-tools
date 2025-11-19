import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validates that a date range is valid (i.e., the start date is before the end date).
 * 
 * This validator is designed to work with a form control that contains an array of two dates:
 * - The first date is the start date.
 * - The second date is the end date.
 * 
 * If the start date is greater than or equal to the end date, the validator returns an error.
 * 
 * @param {AbstractControl} control - The form control containing the date range as an array of two dates.
 * @returns {ValidationErrors | null} - Returns an error object if the date range is invalid, otherwise returns `null`.
 */
export function dateRangeValidator(
  control: AbstractControl
): ValidationErrors | null {
  // Get the raw value of the control, which is expected to be an array of two dates
  const fechas = control.getRawValue() as Date[];

  // If the array is not defined or does not contain exactly two dates, skip validation
  if (!fechas || fechas.length !== 2) return null;

  // Destructure the array into start date (fecha1) and end date (fecha2)
  const [fecha1, fecha2] = fechas;

  // If either date is null or undefined, skip validation
  if (fecha1 === null || fecha2 === null || fecha1 === undefined || fecha2 === undefined) return null;

  // Check if the start date is greater than or equal to the end date
  if (fecha1 >= fecha2) {
    // Return an error object if the date range is invalid
    return { dateRangeValidator: true };
  }

  // Return null if the date range is valid
  return null;
}

/**
 * Validates that a date range control does not contain exactly one date.
 * 
 * This validator ensures that the form control either contains:
 * - Zero dates (empty array or null/undefined), or
 * - Two valid dates (start and end dates).
 * 
 * If the control contains exactly one date or if one of the two dates is null, the validator returns an error.
 * 
 * @param {AbstractControl} control - The form control containing the date range as an array of dates.
 * @returns {ValidationErrors | null} - Returns an error object if the control contains exactly one date or if one of the two dates is null, otherwise returns `null`.
 */
export function noOneDateValidator(
  control: AbstractControl
): ValidationErrors | null {
  // Get the raw value of the control, which is expected to be an array of dates
  const fechas = control.getRawValue() as Date[];

  // If the array contains exactly one date, return an error
  if (fechas?.length === 1) {
    return { noOneDateValidator: true };
  }

  // If the array contains exactly two dates, check if either date is null
  if (fechas?.length === 2) {
    const [fecha1, fecha2] = fechas;
    if (fecha1 === null || fecha2 === null) {
      // Return an error if one of the dates is null
      return { noOneDateValidator: true };
    }
  }

  // Return null if the control contains zero dates or two valid dates
  return null;
}
