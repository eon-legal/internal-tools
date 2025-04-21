import { InputNumberInputEvent } from 'primeng/inputnumber';
import { ResultMethodValidationNumberForm } from '../../interfaces/validators-text-number';

export function getValidateInputPercentage(event: InputNumberInputEvent): ResultMethodValidationNumberForm {
  // Handle undefined input
  if (event.value === undefined) {
    return { change: false };
  }

  const inputValue = event.value;
  
  // Handle empty/null
  if (inputValue === null || inputValue === '') {
    return { change: false };
  }

  const stringValue = inputValue.toString();
  
  // Extract numeric parts (digits, minus sign, and decimal point)
  const numericValue = stringValue.replace(/[^0-9.-]/g, '');
  
  // Handle cases where no numbers are found
  if (numericValue === '' || numericValue === '-' || numericValue === '.') {
    return { change: false };
  }

  // Handle negative numbers (convert to positive)
  const isNegative = numericValue.startsWith('-');
  const absoluteValue = isNegative ? numericValue.slice(1) : numericValue;

  // Split into integer and decimal parts
  const [integerPart, decimalPart] = absoluteValue.split('.');

  // Process integer part
  let processedInteger = integerPart;
  const integerNumber = parseInt(integerPart || '0', 10);
  
  // Truncate to 2 digits if > 100
  if (integerNumber > 100) {
    processedInteger = integerPart.slice(0, 2);
  }

  // Process decimal part
  let processedDecimal = (decimalPart || '').slice(0, 2);

  // Special handling for 100
  if (processedInteger === '100') {
    if (processedDecimal !== '0' && processedDecimal !== '00') {
      processedDecimal = '';
    }
  }

  // Reconstruct the value
  let newValueStr = processedInteger;
  if (processedDecimal) {
    newValueStr += `.${processedDecimal}`;
  }

  // Convert to number
  const numericResult = parseFloat(newValueStr);

  // Handle invalid numbers
  if (isNaN(numericResult)) {
    return { change: false };
  }

  // Determine if there were changes
  const originalNumber = parseFloat(absoluteValue) || 0;
  const hasChanged = (
    newValueStr !== absoluteValue ||
    isNegative ||
    numericResult !== originalNumber
  );

  // For valid unchanged inputs, don't return value
  if (!hasChanged && !isNegative && !isNaN(originalNumber)) {
    return { change: false };
  }

  return {
    change: hasChanged,
    value: numericResult > 100 ? parseFloat(processedInteger) : numericResult
  };
}