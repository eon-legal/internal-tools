import { InputNumberInputEvent } from 'primeng/inputnumber';
import { getValidateInputPercentage } from './get-validate-input-percentage';

describe('getValidateInputPercentage', () => {
  const createMockEvent = (value: any): InputNumberInputEvent => ({
    originalEvent: new Event('input'),
    value: value,
    formattedValue: value?.toString() ?? ''
  });

  describe('Empty/Null/Undefined Input Handling', () => {
    it('should return no change for empty string input', () => {
      const event = createMockEvent('');
      expect(getValidateInputPercentage(event)).toEqual({ change: false });
    });

    it('should return no change for null input', () => {
      const event = createMockEvent(null);
      expect(getValidateInputPercentage(event)).toEqual({ change: false });
    });

    it('should return no change for undefined input', () => {
      const event = createMockEvent(undefined);
      expect(getValidateInputPercentage(event)).toEqual({ change: false });
    });
  });

  describe('Negative Number Handling', () => {
    it('should convert negative integer to positive', () => {
      const event = createMockEvent('-10');
      expect(getValidateInputPercentage(event)).toEqual({ change: true, value: 10 });
    });

    it('should convert negative decimal to positive', () => {
      const event = createMockEvent('-25.75');
      expect(getValidateInputPercentage(event)).toEqual({ change: true, value: 25.75 });
    });

    it('should handle negative numbers > 100', () => {
      const event = createMockEvent('-150');
      expect(getValidateInputPercentage(event)).toEqual({ change: true, value: 15 });
    });
  });

  describe('Values Greater Than 100 Handling', () => {
    it('should truncate 150 to 15', () => {
      const event = createMockEvent('150');
      expect(getValidateInputPercentage(event)).toEqual({ change: true, value: 15 });
    });

    it('should truncate 1234.56 to 12.34', () => {
      const event = createMockEvent('1234.56');
      expect(getValidateInputPercentage(event)).toEqual({ change: true, value: 12.56 });
    });

    it('should truncate 999.999 to 99.99', () => {
      const event = createMockEvent('999.999');
      expect(getValidateInputPercentage(event)).toEqual({ change: true, value: 99.99 });
    });
  });

  describe('Decimal Place Handling', () => {
    it('should limit to 2 decimal places', () => {
      const event = createMockEvent('50.1234');
      expect(getValidateInputPercentage(event)).toEqual({ change: true, value: 50.12 });
    });

    it('should return no change for already valid decimals', () => {
      const event = createMockEvent('75.9');
      expect(getValidateInputPercentage(event)).toEqual({ change: false });
    });

    it('should handle no decimal places without value in result', () => {
      const event = createMockEvent('80');
      expect(getValidateInputPercentage(event)).toEqual({ change: false });
    });
  });

  describe('Exact 100 Handling', () => {
    it('should remove decimals when not .0 or .00', () => {
      const event = createMockEvent('100.25');
      expect(getValidateInputPercentage(event)).toEqual({ change: true, value: 100 });
    });

    it('should return no change for .0 decimal', () => {
      const event = createMockEvent('100.0');
      expect(getValidateInputPercentage(event)).toEqual({ change: false });
    });

    it('should return no change for .00 decimal', () => {
      const event = createMockEvent('100.00');
      expect(getValidateInputPercentage(event)).toEqual({ change: false });
    });

    it('should handle integer 100 with no change', () => {
      const event = createMockEvent('100');
      expect(getValidateInputPercentage(event)).toEqual({ change: false });
    });
  });

  describe('String Input Handling', () => {
    it('should return no change for strings with numbers', () => {
      const event = createMockEvent('abc50.25def');
      expect(getValidateInputPercentage(event)).toEqual({ change: false });
    });

    it('should return no change for strings with multiple numbers', () => {
      const event = createMockEvent('price: 123.45$');
      expect(getValidateInputPercentage(event)).toEqual({ change: true, value: 12.45 });
    });

    it('should return no change for non-numeric strings', () => {
      const event = createMockEvent('invalid');
      expect(getValidateInputPercentage(event)).toEqual({ change: false });
    });
  });

  describe('Edge Case Handling', () => {
    it('should handle 0 correctly without value in result', () => {
      const event = createMockEvent('0');
      expect(getValidateInputPercentage(event)).toEqual({ change: false });
    });

    it('should return no change for 0.00', () => {
      const event = createMockEvent('0.00');
      expect(getValidateInputPercentage(event)).toEqual({ change: false });
    });

    it('should handle multiple decimal points', () => {
      const event = createMockEvent('50..25');
      expect(getValidateInputPercentage(event)).toEqual({ change: true, value: 50 });
    });

    it('should handle very small decimals', () => {
      const event = createMockEvent('0.999');
      expect(getValidateInputPercentage(event)).toEqual({ change: true, value: 0.99 });
    });

    it('should handle values just above 100', () => {
      const event = createMockEvent('100.001');
      expect(getValidateInputPercentage(event)).toEqual({ change: true, value: 100 });
    });
  });

  describe('Valid Input Without Changes', () => {
    it('should return no change for valid integer without value', () => {
      const event = createMockEvent('50');
      expect(getValidateInputPercentage(event)).toEqual({ change: false });
    });

    it('should return no change for valid decimal without value', () => {
      const event = createMockEvent('75.25');
      expect(getValidateInputPercentage(event)).toEqual({ change: false });
    });

    it('should return no change for 100 without value', () => {
      const event = createMockEvent('100');
      expect(getValidateInputPercentage(event)).toEqual({ change: false });
    });
  });
});