import { InputNumberInputEvent } from 'primeng/inputnumber';
import { getValidateInputInteger } from './get-validate-input-number-integer'; // Ajusta la ruta

// Mock de un evento válido
const createMockEvent = (value: any): InputNumberInputEvent => ({
  originalEvent: new Event('input'), // Mock de un evento original
  formattedValue: value?.toString() || '', // Mock del valor formateado
  value: value, // Valor numérico
});

describe('getValidateInputInteger', () => {
  it('should return the same value if it is within the valid range', () => {
    const event = createMockEvent(123456789); // Valor válido
    const result = getValidateInputInteger(event);
    expect(result).toEqual({ change: false });
  });

  it('should truncate the integer part to 15 digits if it exceeds', () => {
    const event = createMockEvent(1234567890123456789); // 19 dígitos
    const result = getValidateInputInteger(event);
    expect(result).toEqual({ change: true, value: 123456789012345 });
  });

  it('should handle null or undefined values by returning null', () => {
    const event1 = createMockEvent(null);
    const result1 = getValidateInputInteger(event1);
    expect(result1).toEqual({ change: false });

    const event2 = createMockEvent(undefined);
    const result2 = getValidateInputInteger(event2);
    expect(result2).toEqual({ change: false });
  });

  it('should handle empty string values by returning null', () => {
    const event = createMockEvent('');
    const result = getValidateInputInteger(event);
    expect(result).toEqual({ change: false });
  });

  it('should handle negative values within the valid range', () => {
    const event = createMockEvent(-123456789); // Valor negativo válido
    const result = getValidateInputInteger(event);
    expect(result).toEqual({ change: false });
  });

  it('should ignore decimal parts and return only the integer part', () => {
    const event = createMockEvent(123.456); // Valor decimal
    const result = getValidateInputInteger(event);
    expect(result).toEqual({ change: true, value: 123 });
  });

  it('should handle non-numeric values by returning null', () => {
    const event = createMockEvent('abc'); // Valor no numérico
    const result = getValidateInputInteger(event);
    expect(result).toEqual({ change: false });
  });

  it('should truncate negative integers to 15 digits (excluding the negative sign)', () => {
    const event = createMockEvent(-1234567890123456789); // Valor negativo con más de 15 dígitos
    const result = getValidateInputInteger(event);
    expect(result).toEqual({ change: true, value: -123456789012345 });
  });
});
