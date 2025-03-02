import { AbstractControl, ValidationErrors } from '@angular/forms';

export function dateRangeValidator(
  control: AbstractControl
): ValidationErrors | null {
  const fechas = control.getRawValue() as Date[];
  if (!fechas || fechas.length !== 2) return null;
  const [fecha1, fecha2] = fechas;
  if (fecha1 === null || fecha2 === null) return null;
  if (fecha1 >= fecha2) {
    return { dateRangeValidator: true };
  }
  return null;
}

export function noOneDateValidator(
  control: AbstractControl
): ValidationErrors | null {
  const fechas = control.getRawValue() as Date[];
  if (fechas?.length === 1) {
    return { noOneDateValidator: true };
  }
  if (fechas?.length === 2) {
    const [fecha1, fecha2] = fechas;
    if (fecha1 === null || fecha2 === null) return { noOneDateValidator: true };
  }
  return null;
}
