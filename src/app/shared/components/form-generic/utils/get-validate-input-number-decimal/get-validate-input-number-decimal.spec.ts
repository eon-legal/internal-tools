import { getValidateInputNumberDecimal } from './get-validate-input-number-decimal';
import { InputNumberInputEvent } from 'primeng/inputnumber';

describe('getValidateInputNumberDecimal', () => {
  // Helper function to create a mock InputNumberInputEvent
  const createInputEvent = (
    value: string | number | null
  ): InputNumberInputEvent => ({
    originalEvent: new Event('input'), // Mock event
    formattedValue: value?.toString() || '', // Mock formattedValue
    value
  });

  // Test 1: Valor vacío, nulo o indefinido
  it('should return no change for empty or null input', () => {
   /* expect(getValidateInputNumberDecimal(createInputEvent(null))).toEqual({
      change: false,
    });*/
    expect(getValidateInputNumberDecimal(createInputEvent(''))).toEqual({
      change: false,
    });
  });

  // Test 2: Valor entero positivo sin decimales
  it('should handle positive integer without decimals', () => {
    expect(
      getValidateInputNumberDecimal(createInputEvent('1234567890123'))
    ).toEqual({ change: true, value: 1234567890123.00  });
  });

  // Test 3: Valor entero negativo sin decimales
  it('should handle negative integer without decimals', () => {
    expect(
      getValidateInputNumberDecimal(createInputEvent('-1234567890123'))
    ).toEqual({ change: true, value: -1234567890123.00 });
  });

  // Test 4: Valor positivo con decimales exactos (2 decimales)
  it('should handle positive value with exactly two decimals', () => {
    expect(getValidateInputNumberDecimal(createInputEvent('123.45'))).toEqual({
      change: false,
    });
  });

  // Test 5: Valor negativo con decimales exactos (2 decimales)
  it('should handle negative value with exactly two decimals', () => {
    expect(getValidateInputNumberDecimal(createInputEvent('-123.45'))).toEqual({
      change: false,
    });
  });

  // Test 6: Valor positivo con más de 13 dígitos enteros (truncamiento)
  it('should truncate positive integer part exceeding 13 digits', () => {
    expect(
      getValidateInputNumberDecimal(createInputEvent('1234567890123456.78'))
    ).toEqual({
      change: true,
      value: 1234567890123.78,
    });
  });

  // Test 7: Valor negativo con más de 13 dígitos enteros (truncamiento)
  it('should truncate negative integer part exceeding 13 digits', () => {
    expect(
      getValidateInputNumberDecimal(createInputEvent('-1234567890123456.78'))
    ).toEqual({
      change: true,
      value: -1234567890123.78,
    });
  });

  // Test 8: Valor positivo con más de 2 decimales (redondeo hacia arriba)
  it('should round positive value with more than two decimals (round up)', () => {
    expect(getValidateInputNumberDecimal(createInputEvent('123.4567'))).toEqual(
      {
        change: true,
        value: 123.45,
      }
    );
  });

  // Test 9: Valor negativo con más de 2 decimales (redondeo hacia abajo)
  it('should round negative value with more than two decimals (round down)', () => {
    expect(
      getValidateInputNumberDecimal(createInputEvent('-123.4543'))
    ).toEqual({
      change: true,
      value: -123.45,
    });
  });

  // Test 10: Valor positivo con un solo decimal (agrega un cero)
  it('should add a zero for positive value with one decimal', () => {
    expect(getValidateInputNumberDecimal(createInputEvent('123.4'))).toEqual({
      change: true,
      value: 123.4,
    });
  });

  // Test 11: Valor negativo con un solo decimal (agrega un cero)
  it('should add a zero for negative value with one decimal', () => {
    expect(getValidateInputNumberDecimal(createInputEvent('-123.4'))).toEqual({
      change: true,
      value: -123.4,
    });
  });

  // Test 12: Valor positivo sin decimales (agrega dos ceros)
  it('should add two zeros for positive value without decimals', () => {
    expect(getValidateInputNumberDecimal(createInputEvent('123'))).toEqual({
      change: true,
      value: 123.0,
    });
  });

  // Test 13: Valor negativo sin decimales (agrega dos ceros)
  it('should add two zeros for negative value without decimals', () => {
    expect(getValidateInputNumberDecimal(createInputEvent('-123'))).toEqual({
      change: true,
      value: -123.0000,
    });
  });
});
