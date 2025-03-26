import { of } from 'rxjs';
import { FieldType, FormField } from '../../interfaces/form-field';
import {
  isValidatorType,
  isAsyncValidator,
  getValidatorNameFn,
  getErrorMessagesFn,
} from './get-error-messages-fn';
import { Validators, FormControl, AbstractControl } from '@angular/forms';

// Mock de un objeto FormField
const createMockFormField = (
  name: string,
  validators?: { validator: any; message: string }[]
): FormField<any> => ({
  name: name as Extract<keyof any, string>,
  label: 'Test Field',
  type: 'text' as FieldType, // Ajusta según los valores de FieldType
  validators: validators,
});

// Pruebas para isValidatorType
describe('isValidatorType', () => {
  it('should return true if the validator is of the specified type', () => {
    const validator = Validators.minLength(5);
    const result = isValidatorType(validator, Validators.minLength);
    expect(result).toBe(true);
  });

  it('should return false if the validator is not of the specified type', () => {
    const validator = Validators.required;
    const result = isValidatorType(validator, Validators.minLength);
    expect(result).toBe(false);
  });
});

// Pruebas para isAsyncValidator
describe('isAsyncValidator', () => {
  it('should return true if the validator is asynchronous (Promise)', () => {
    const asyncValidator = () => Promise.resolve(null);
    const result = isAsyncValidator(asyncValidator);
    expect(result).toBe(true);
  });

  it('should return true if the validator is asynchronous (Observable)', () => {
    const asyncValidator = () => of(null);
    const result = isAsyncValidator(asyncValidator);
    expect(result).toBe(true);
  });

  it('should return false if the validator is synchronous', () => {
    const syncValidator = Validators.required;
    const result = isAsyncValidator(syncValidator);
    expect(result).toBe(false);
  });
});

// Pruebas para getValidatorNameFn
describe('getValidatorNameFn', () => {
  it('should return "required" for the required validator', () => {
    const validator = Validators.required;
    const result = getValidatorNameFn(validator);
    expect(result).toBe('required');
  });

  it('should return "minlength" for the minLength validator', () => {
    const validator = Validators.minLength(5);
    const result = getValidatorNameFn(validator);
    expect(result).toBe('minlength');
  });

  it('should return "asyncValidator" for an unnamed async validator', () => {
    const asyncValidator = () => of(null);
    const result = getValidatorNameFn(asyncValidator);
    expect(result).toBe('asyncValidator');
  });

  it('should return "customValidator" for a custom validator without a name', () => {
    const customValidator = (control: AbstractControl) => {
      return { customError: true };
    };
    const result = getValidatorNameFn(customValidator);
    expect(result).toBe('customValidator');
  });
});

// Pruebas para getErrorMessagesFn
describe('getErrorMessagesFn', () => {
  it('should return an empty array if there are no errors', () => {
    const control = new FormControl('valid value');
    const formConfig: FormField<any>[] = [createMockFormField('testField')];
    const result = getErrorMessagesFn('testField', control, formConfig);
    expect(result).toEqual([]);
  });

  it('should return the correct error message for a required field', () => {
    const control = new FormControl('', Validators.required);
    control.markAsTouched(); // Marcar el control como "touched"
    control.markAsDirty(); // Marcar el control como "dirty"
    control.updateValueAndValidity(); // Forzar la validación

    const formConfig: FormField<any>[] = [
      createMockFormField('testField', [
        { validator: Validators.required, message: 'This field is required' },
      ]),
    ];

    const result = getErrorMessagesFn('testField', control, formConfig);
    expect(result).toEqual(['This field is required']);
  });

  it('should return an empty array if the control is pending', () => {
    const control = new FormControl('', { asyncValidators: [() => of(null)] });
    control.markAsPending();
    const formConfig: FormField<any>[] = [createMockFormField('testField')];
    const result = getErrorMessagesFn('testField', control, formConfig);
    expect(result).toEqual([]);
  });

  it('should return an empty array if the control is untouched and pristine', () => {
    const control = new FormControl('', Validators.required);
    const formConfig: FormField<any>[] = [
      createMockFormField('testField', [
        { validator: Validators.required, message: 'This field is required' },
      ]),
    ];
    const result = getErrorMessagesFn('testField', control, formConfig);
    expect(result).toEqual([]);
  });

  it('should return an empty array if the field is not found in formConfig', () => {
    const control = new FormControl('', Validators.required);
    const formConfig: FormField<any>[] = [createMockFormField('anotherField')];
    const result = getErrorMessagesFn('testField', control, formConfig);
    expect(result).toEqual([]);
  });
});
