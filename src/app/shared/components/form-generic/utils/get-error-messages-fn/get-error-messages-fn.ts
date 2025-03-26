import { AbstractControl } from '@angular/forms';
import { FormField } from '../../interfaces/form-field';
import {
  AsyncValidatorFn,
  FormControl,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';

/**
 * Checks if a validator is of a specific type.
 *
 * @param {ValidatorFn | AsyncValidatorFn} validator - The validator to check.
 * @param {Function} validatorType - The type of validator to compare against.
 * @returns {boolean} True if the validator is of the specified type, otherwise false.
 */
export function isValidatorType(
  validator: ValidatorFn | AsyncValidatorFn,
  validatorType: Function
): boolean {
  const sampleValidator = validatorType(/.*/);
  return validator.toString() === sampleValidator.toString();
}

/**
 * Determines if a validator is asynchronous.
 *
 * @param {ValidatorFn | AsyncValidatorFn} validator - The validator to check.
 * @returns {boolean} True if the validator is asynchronous, otherwise false.
 */
export function isAsyncValidator(
  validator: ValidatorFn | AsyncValidatorFn
): boolean {
  const control = new FormControl('');
  try {
    const result = validator(control);
    return result instanceof Promise || result instanceof Observable;
  } catch (error) {
    return false;
  }
}

/**
 * Gets the name of a validator function.
 *
 * @param {ValidatorFn | AsyncValidatorFn} validator - The validator to get the name of.
 * @returns {string} The name of the validator.
 */
export function getValidatorNameFn(
  validator: ValidatorFn | AsyncValidatorFn
): string {
  if (validator === Validators.required) return 'required';
  if (validator === Validators.email) return 'email';
  if (isValidatorType(validator, Validators.minLength)) return 'minlength';
  if (isValidatorType(validator, Validators.min)) return 'min';
  if (isValidatorType(validator, Validators.maxLength)) return 'maxlength';
  if (isValidatorType(validator, Validators.max)) return 'max';
  if (isValidatorType(validator, Validators.pattern)) return 'pattern';
  if (isAsyncValidator(validator)) {
    return validator.name || 'asyncValidator';
  }
  if (typeof validator === 'function') {
    const validatorName = validator.name;
    if (validatorName) {
      return validatorName;
    }
    const control = new FormControl('');
    control.setValidators(validator as ValidatorFn);
    control.updateValueAndValidity();
    if (control.errors) {
      const errorKey = Object.keys(control.errors)[0];
      return errorKey || 'customValidator';
    }
  }
  return 'unknownValidator';
}

/**
 * Gets error messages for a form control based on its validation errors.
 *
 * @param {string} fieldName - The name of the form field.
 * @param {AbstractControl} control - The form control to check for errors.
 * @param {FormField[]} formConfig - The configuration of the form fields.
 * @returns {string[]} An array of error messages.
 */
export function getErrorMessagesFn(
  fieldName: string,
  control: AbstractControl<any, any>,
  formConfig: FormField<any>[]
): string[] {
  if (!control || !control.errors) {
    return [];
  }
  if (control.pending) {
    return [];
  }
  if (!control.touched && !control.dirty) {
    return [];
  }
  const field = formConfig.find((f) => f.name === fieldName);
  if (!field || !field.validators) {
    return [];
  }
  const errors = control.errors;
  const messages: string[] = [];
  for (const errorKey of Object.keys(errors)) {
    const validator = field.validators.find((v) => {
      const validatorName = getValidatorNameFn(v.validator);
      return validatorName === errorKey;
    });
    if (validator) {
      messages.push(validator.message);
    }
  }
  return messages;
}
