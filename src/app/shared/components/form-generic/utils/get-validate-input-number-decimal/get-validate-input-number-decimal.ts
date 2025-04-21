import { InputNumberInputEvent } from 'primeng/inputnumber';
import { ResultMethodValidationNumberForm } from '../../interfaces/validators-text-number';

/**
 * Validates and formats a numeric input value to ensure it adheres to specific rules for integer and decimal parts.
 *
 * - Handles negative values by preserving the negative sign.
 * - Limits the integer part to a maximum of 13 digits.
 * - Ensures the decimal part has exactly two digits (appending or truncating as necessary).
 *
 * @param event - An object containing the input value to be validated. The `event` object must have a `value` property,
 *               which can be a `number`, `null`, or `undefined`.
 *
 * @returns An object with two properties:
 *   - `change`: A boolean indicating whether the input value was modified (`true`) or not (`false`).
 *   - `value`: The formatted and validated numeric value. This property is only present if `change` is `true`.
 *
 * @example
 * const inputEvent = { value: 123.456 };
 * const result = getValidateInputNumberDecimal(inputEvent);
 * result // { change: true, value: 123.45 }
 */
export function getValidateInputNumberDecimal(event: InputNumberInputEvent): ResultMethodValidationNumberForm {
  const valor = event.value?.toString() || '';

  // If the input is empty, null, or undefined, return no change and no value
  if (valor === '' || event.value === null) {
    return { change: false };
  }

  // Split the value into integer and decimal parts
  const [parteEntera, parteDecimal] = valor.split('.');

  // Handle negative sign for the integer part
  const esNegativo = parteEntera?.startsWith('-') || false;
  const parteEnteraSinSigno = esNegativo ? parteEntera.slice(1) : parteEntera;

  // Limit the integer part to 13 digits
  const parteEnteraLimitada = parteEnteraSinSigno?.slice(0, 13) || '';

  // Handle the decimal part
  let parteDecimalLimitada = parteDecimal || '';

  // If there is no decimal part, add two zeros
  if (!parteDecimalLimitada) {
    parteDecimalLimitada = '00';
  }
  // If there is only one decimal digit, add a zero
  else if (parteDecimalLimitada.length === 1) {
    parteDecimalLimitada += '0';
  }
  // If there are three or more decimal digits, truncate to two decimal places
  else if (parteDecimalLimitada.length >= 3) {
    parteDecimalLimitada = parteDecimalLimitada.slice(0, 2);
  }
  // If there are exactly two decimal digits, leave them as is
  else {
    parteDecimalLimitada = parteDecimalLimitada.slice(0, 2);
  }

  // Reconstruct the value with the limited integer and decimal parts
  let nuevoValor = esNegativo ? `-${parteEnteraLimitada}` : parteEnteraLimitada;
  if (parteDecimalLimitada) {
    nuevoValor += `.${parteDecimalLimitada}`;
  }

  // Convert to a number
  const valorTruncado = parseFloat(nuevoValor);

  // Update the value if there were changes
  if (nuevoValor !== valor) {
    return { change: true, value: valorTruncado };
  }

  // If no changes were made, return no change
  return { change: false };
}