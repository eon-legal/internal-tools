import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { InputNumberInputEvent } from 'primeng/inputnumber';
import { Observable } from 'rxjs';
import { FormField } from '../interfaces/form-field';

export function getValidateInputNumberDecimal(event: InputNumberInputEvent): {
  change: boolean;
  value?: number | null;
} {
  const valor = event.value?.toString() || '';
  const [parteEntera, parteDecimal] = valor.split('.');

  // Limita la parte entera a 13 dígitos
  const parteEnteraLimitada = parteEntera?.slice(0, 13) || '';

  // Limita la parte decimal a 2 dígitos
  const parteDecimalLimitada = parteDecimal?.slice(0, 2) || '';

  // Reconstruye el valor
  let nuevoValor = parteEnteraLimitada;
  if (parteDecimalLimitada) {
    nuevoValor += `.${parteDecimalLimitada}`;
  }

  // Actualiza el valor si hubo cambios
  if (nuevoValor !== valor) {
    //this.form.get(campo)?.setValue(nuevoValor ? parseFloat(nuevoValor) : null);
    return { change: true, value: nuevoValor ? parseFloat(nuevoValor) : null };
  }
  return { change: false };
}

export function getValidateInputPercentaje(event: InputNumberInputEvent): {
  change: boolean;
  value?: number | null;
} {
  const valor = event.value?.toString() || '';
  const [parteEntera, parteDecimal] = valor.split('.');

  // Limita la parte entera a 2 dígitos
  const parteEnteraLimitada = parteEntera?.slice(0, 2) || '';

  // Limita la parte decimal a 2 dígitos
  const parteDecimalLimitada = parteDecimal?.slice(0, 2) || '';

  // Reconstruye el valor
  let nuevoValor = parteEnteraLimitada;
  if (parteDecimalLimitada) {
    nuevoValor += `.${parteDecimalLimitada}`;
  }

  // Convierte a número para validar el rango
  const valorNumerico = parseFloat(nuevoValor);

  // Si el valor está fuera del rango, lo ajusta
  if (valorNumerico < 0) {
    nuevoValor = '0';
  } else if (valorNumerico > 100) {
    nuevoValor = '100';
  }

  // Actualiza el valor si hubo cambios
  if (nuevoValor !== valor) {
    //this.form.get(campo)?.setValue(nuevoValor ? parseFloat(nuevoValor) : null);
    return { change: true, value: nuevoValor ? parseFloat(nuevoValor) : null };
  }
  return { change: false };
}

export function isValidatorType(
  validator: ValidatorFn | AsyncValidatorFn,
  validatorType: Function
): boolean {
  // Creamos una instancia del validador tipo para comparar
  const sampleValidator = validatorType(/.*/); // Usamos una expresión regular genérica para pattern
  return validator.toString() === sampleValidator.toString();
}

export function isAsyncValidator(
  validator: ValidatorFn | AsyncValidatorFn
): boolean {
  // Creamos un control ficticio para probar el validador
  const control = new FormControl('');
  try {
    const result = validator(control);
    // Si el resultado es una Promise o un Observable, es un validador asíncrono
    return result instanceof Promise || result instanceof Observable;
  } catch (error) {
    // Si hay un error, asumimos que no es un validador asíncrono
    return false;
  }
}

export function getValidatorNameFn(
  validator: ValidatorFn | AsyncValidatorFn
): string {
  // Validadores estáticos
  if (validator === Validators.required) return 'required';
  if (validator === Validators.email) return 'email';
  // Validadores dinámicos (minLength, min, maxLength, max, pattern)
  if (isValidatorType(validator, Validators.minLength)) return 'minlength';
  if (isValidatorType(validator, Validators.min)) return 'min';
  if (isValidatorType(validator, Validators.maxLength)) return 'maxlength';
  if (isValidatorType(validator, Validators.max)) return 'max';
  if (isValidatorType(validator, Validators.pattern)) return 'pattern';
  // Validadores asíncronos
  if (isAsyncValidator(validator)) {
    return validator.name || 'asyncValidator';
  }
  // Validadores personalizados
  if (typeof validator === 'function') {
    // Intentamos obtener el nombre del validador personalizado
    const validatorName = validator.name;
    // Si el validador tiene un nombre, lo devolvemos
    if (validatorName) {
      return validatorName;
    }
    // Si no tiene nombre, intentamos obtener el nombre del error que devuelve
    const control = new FormControl('');
    control.setValidators(validator as ValidatorFn);
    control.updateValueAndValidity();
    if (control.errors) {
      const errorKey = Object.keys(control.errors)[0];
      return errorKey || 'customValidator';
    }
  }
  // Si no se puede determinar el nombre, devolvemos un valor por defecto
  return 'unknownValidator';
}

export function getErrorMessagesFn(
  fieldName: string,
  control: AbstractControl<any, any>,
  formConfig: FormField<any>[]
): string[] {
  //const control = this.form.get(fieldName);
  // Si no hay control o no hay errores, retornar un array vacío
  if (!control || !control.errors) {
    return [];
  }
  // Si el control está "pending", no mostramos errores hasta que finalice
  if (control.pending) {
    return [];
  }
  // Si el control no está "touched" ni "dirty", retornar un array vacío
  if (!control.touched && !control.dirty) {
    return [];
  }
  // Obtener el campo correspondiente en formConfig
  const field = formConfig.find((f) => f.name === fieldName);
  if (!field || !field.validators) {
    return [];
  }
  // Obtener los errores del control
  const errors = control.errors;
  const messages: string[] = [];
  // Mapear los errores a los mensajes correspondientes
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
