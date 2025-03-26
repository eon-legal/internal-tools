import { InputNumberInputEvent } from 'primeng/inputnumber';

/**
 * Validates and formats an input percentage value.
 *
 * This function processes a numeric input value (as a string or number) and ensures it adheres to the following rules:
 * 1. If the input is empty, null, or undefined, it returns no change and no value.
 * 2. If the input is negative, the negative sign is removed, and the value is treated as positive.
 * 3. The integer part is truncated to 2 digits if it exceeds 100.
 * 4. The decimal part is limited to 2 digits.
 * 5. If the integer part is exactly 100, the decimal part is removed unless it is "0" or "00".
 * 6. The final value is ensured to be between 0 and 100 (inclusive).
 *
 * @param {InputNumberInputEvent} event - The input event containing the value to validate and format.
 * @returns {Object} An object with two properties:
 *   - `change`: A boolean indicating whether the value was modified.
 *   - `value`: The formatted and validated number (or `null` if no valid value is present).
 */
export function getValidateInputPercentage(event: InputNumberInputEvent): {
  change: boolean;
  value?: number | null;
} {
  const valor = procesarCadena(event.value?.toString() || '');
  // If the input is empty, null, or undefined, return no change and no value
  if (valor === '' || event.value === null) {
    return { change: false };
  }

  // Handle negative numbers by removing the negative sign
  const esNegativo = valor.startsWith('-');
  const valorSinNegativo = esNegativo ? valor.slice(1) : valor;
  // Split the value into integer and decimal parts
  const [parteEntera, parteDecimal] = valorSinNegativo.split('.');

  // Convert the integer part to a number
  const parteEnteraNumerica = parseFloat(parteEntera || '0');

  // If the integer part is greater than 100, truncate it to 2 digits
  let parteEnteraLimitada = parteEntera;
  if (parteEnteraNumerica > 100) {
    parteEnteraLimitada = parteEntera.slice(0, 2); // Truncate to 2 digits
  }

  // Handle the decimal part
  let parteDecimalLimitada = parteDecimal?.slice(0, 2) || '';

  // If the integer part is exactly 100, remove the decimal part unless it's 0 or 00
  if (parteEnteraLimitada === '100') {
    if (parteDecimalLimitada !== '0' && parteDecimalLimitada !== '00') {
      parteDecimalLimitada = ''; // Remove the decimal part
    }
  }

  // Reconstruct the value with the limited integer and decimal parts

  let nuevoValor = parteEnteraLimitada;
  if (parteDecimalLimitada) {
    nuevoValor += `.${parteDecimalLimitada}`;
  }

  // Convert to a number
  const valorNumerico = parseFloat(nuevoValor);
  // Ensure the value is between 0 and 100 (inclusive)
  if (valorNumerico < 0 || valorNumerico > 100) {
    return { change: true, value: 0 };
  }

  // Update the value if there were changes
  if (
    nuevoValor !== valorSinNegativo ||
    (event.value?.toString() || '') !== valor
  ) {
    return { change: true, value: valorNumerico };
  }
  // If no changes were made, return no change
  return { change: false };
}

export function  procesarCadena(cadena: string): string {
  // Verificar si hay más de un signo menos o si el punto está al inicio
  if (cadena.split('-').length - 1 > 1 || cadena.startsWith('.')) {
    return '';
  }

  // Eliminar todos los caracteres que no sean números, un solo signo menos o un solo punto
  let cadenaProcesada = cadena.replace(/[^0-9\-.]/g, '');

  // Verificar si hay más de un punto
  if (cadenaProcesada.split('.').length - 1 > 1) {
    return '';
  }

  // Eliminar el signo menos si no está al inicio
  if (cadenaProcesada.includes('-') && !cadenaProcesada.startsWith('-')) {
    cadenaProcesada = cadenaProcesada.replace(/-/g, ''); // Eliminar todos los signos menos
  }

  // Eliminar el punto si no está entre números
  const partes = cadenaProcesada.split('.');
  if (partes.length === 2) {
    const [antesPunto, despuesPunto] = partes;
    if (!antesPunto || !despuesPunto) {
      // Si no hay números antes o después del punto, eliminamos el punto
      cadenaProcesada = cadenaProcesada.replace('.', '');
    }
  }

  // Si no hay números en la cadena, devolver cadena vacía
  if (!/\d/.test(cadenaProcesada)) {
    return '';
  }

  // Mover el signo menos al final si existe
  if (cadenaProcesada.includes('-')) {
    cadenaProcesada = cadenaProcesada.replace(/-/g, '') + '-';
  }

  return cadenaProcesada;
}