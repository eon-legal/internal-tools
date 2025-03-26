import { InputNumberInputEvent } from 'primeng/inputnumber';

/**
 * Validates and formats a numeric input value to ensure it adheres to specific rules for integer values.
 * 
 * - Handles negative values by preserving the negative sign.
 * - Limits the integer part to a maximum of 15 digits.
 * - Ignores any decimal part of the input value.
 * 
 * @param event - An object containing the input value to be validated. The `event` object must have a `value` property,
 *               which can be a `number`, `null`, or `undefined`.
 * 
 * @returns An object with two properties:
 *   - `change`: A boolean indicating whether the input value was modified (`true`) or not (`false`).
 *   - `value`: The formatted and validated integer value. This property is only present if `change` is `true`.
 * 
 * @example
 * const inputEvent = { value: -123456789012345.67 };
 * const result = getValidateInputInteger(inputEvent);
 * result // { change: true, value: -123456789012345 }
 */
export function getValidateInputInteger(event: InputNumberInputEvent): {
  change: boolean;
  value?: number | null;
} {
  // Convert the input value to a string or default to an empty string if null/undefined
  const valor = event.value?.toString() || '';

  // If the input is empty, null, or undefined, return no change and no value
  if (valor === '' || event.value === null || event.value === undefined) {
    return { change: false };
  }

  // Attempt to parse the input value as a floating-point number
  const valorNumerico = parseFloat(valor);

  // If the parsed value is not a number, return no change and no value
  if (isNaN(valorNumerico)) {
    return { change: false };
  }

  // Extract the integer part of the input value (before the decimal point)
  const parteEntera = valor.split('.')[0] || '';

  // Check if the integer part is negative
  const esNegativo = parteEntera.startsWith('-');

  // Remove the negative sign (if present) for further processing
  const parteEnteraSinSigno = esNegativo ? parteEntera.slice(1) : parteEntera;

  // Limit the integer part to a maximum of 15 digits
  const parteEnteraLimitada = parteEnteraSinSigno.slice(0, 15);

  // Reconstruct the truncated value, preserving the negative sign if applicable
  const valorTruncado = esNegativo
    ? parseFloat(`-${parteEnteraLimitada}`)
    : parseFloat(parteEnteraLimitada);

  // If the input contained a decimal point or was truncated, return the truncated value
  if (valor.includes('.') || parteEnteraLimitada !== parteEnteraSinSigno) {
    return { change: true, value: valorTruncado };
  }

  // If no changes were made, return no change and no value
  return { change: false };
}