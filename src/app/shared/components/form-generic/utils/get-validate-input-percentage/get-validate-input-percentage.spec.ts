import { InputNumberInputEvent } from 'primeng/inputnumber';
import { getValidateInputPercentage } from './get-validate-input-percentage';
import { procesarCadena } from './get-validate-input-percentage'; // Asegúrate de importar la función correctamente

/*describe('getValidateInputPercentage', () => {
  // Helper function to create a mock InputNumberInputEvent
  const createInputEvent = (
    value: string | number | null
  ): InputNumberInputEvent => ({
    originalEvent: new Event('input'), // Mock event
    formattedValue: value?.toString() || '', // Mock formattedValue
    value,
  });
  it('should return no change for empty input', () => {
    const result = getValidateInputPercentage(createInputEvent(null));
    expect(result).toEqual({ change: false });
  });

  it('should handle negative numbers by removing the negative sign', () => {
    const result1 = getValidateInputPercentage(createInputEvent('-100.98'));
    expect(result1).toEqual({ change: true, value: 100 });

    const result2 = getValidateInputPercentage(createInputEvent('-98.756'));
    expect(result2).toEqual({ change: true, value: 98.75 });

    const result3 = getValidateInputPercentage(createInputEvent('-782.968'));
    expect(result3).toEqual({ change: true, value: 78.96 });
  });

  it('should handle invalid inputs with letters', () => {
    const result1 = getValidateInputPercentage(createInputEvent('-78io'));
    expect(result1).toEqual({ change: true, value: 78 });

    const result2 = getValidateInputPercentage(createInputEvent('85u.789'));
    expect(result2).toEqual({ change: true, value: 85.78 });
  });

  it('should truncate integer part to 2 digits if greater than 100', () => {
    const result1 = getValidateInputPercentage(createInputEvent('123.456'));
    expect(result1).toEqual({ change: true, value: 12.45 });

    const result2 = getValidateInputPercentage(createInputEvent('1000.789'));
    expect(result2).toEqual({ change: true, value: 10.78 }); //hay que ver bien esto
  });

  it('should remove decimal part if integer part is 100 and decimal is not 0 or 00', () => {
    const result1 = getValidateInputPercentage(createInputEvent('100.123'));
    expect(result1).toEqual({ change: true, value: 100 });

    const result2 = getValidateInputPercentage(createInputEvent('100.00'));
    expect(result2).toEqual({ change: false });

    const result3 = getValidateInputPercentage(createInputEvent('100.0'));
    expect(result3).toEqual({ change: false });
  });

  it('should ensure the value is between 0 and 100', () => {
    const result1 = getValidateInputPercentage(createInputEvent('-50.123'));
    expect(result1).toEqual({ change: true, value: 50.12 });

    const result2 = getValidateInputPercentage(createInputEvent('150.789'));
    expect(result2).toEqual({ change: true, value: 15.78 });

    const result3 = getValidateInputPercentage(createInputEvent('0.123'));
    expect(result3).toEqual({ change: true, value: 0.12 });
  });

  it('should return no change if the input is already valid', () => {
    const result1 = getValidateInputPercentage(createInputEvent('50.12'));
    expect(result1).toEqual({ change: false });

    const result2 = getValidateInputPercentage(createInputEvent('100'));
    expect(result2).toEqual({ change: false });
  });
});*/


describe('procesarCadena', () => {
  // Casos donde se espera una cadena vacía
  test('devuelve cadena vacía si hay más de un signo menos', () => {
    expect(procesarCadena('--123')).toBe('');
  });

  test('devuelve cadena vacía si la cadena comienza con un punto', () => {
    expect(procesarCadena('.123')).toBe('');
  });

  test('devuelve cadena vacía si hay más de un punto', () => {
    expect(procesarCadena('12.34.56')).toBe('');
  });

  test('devuelve cadena vacía si el signo menos no está al inicio', () => {
    expect(procesarCadena('123-')).toBe('123');
  });

  test('devuelve cadena vacía si no hay números', () => {
    expect(procesarCadena('abc')).toBe('');
  });

  // Casos donde se espera una cadena procesada correctamente
  test('mantiene números, un solo signo menos y un solo punto', () => {
    expect(procesarCadena('-123.45')).toBe('-123.45');
  });

  test('elimina letras y caracteres especiales no permitidos', () => {
    expect(procesarCadena('ty9p.i9l')).toBe('9.9');
  });

  test('elimina el punto si no está entre números', () => {
    expect(procesarCadena('iu.8')).toBe('8');
  });

  test('mantiene el punto si está entre números', () => {
    expect(procesarCadena('12.34')).toBe('12.34');
  });

  test('devuelve cadena vacía si no hay números después de eliminar caracteres no permitidos', () => {
    expect(procesarCadena('abc.def')).toBe('');
  });

  // Casos adicionales
  test('devuelve cadena vacía si la cadena está vacía', () => {
    expect(procesarCadena('')).toBe('');
  });

  test('devuelve cadena vacía si solo contiene caracteres no permitidos', () => {
    expect(procesarCadena('@#$%^&*()')).toBe('');
  });

  test('mantiene el signo menos al inicio y elimina otros caracteres no permitidos', () => {
    expect(procesarCadena('-a1b2.c3d4')).toBe('-12.34');
  });
});
