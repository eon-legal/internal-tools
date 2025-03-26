import { getSumArrayNumber } from './sum-attribute-object';

describe('getSumArrayNumber', () => {
  it('should return 0 for an empty array', () => {
    expect(getSumArrayNumber([])).toBe(0);
  });

  it('should return the correct sum for an array with positive numbers', () => {
    expect(getSumArrayNumber([1, 2, 3, 4])).toBe(10);
    expect(getSumArrayNumber([10, 20, 30])).toBe(60);
  });

  it('should return the correct sum for an array with negative numbers', () => {
    expect(getSumArrayNumber([-1, -2, -3])).toBe(-6);
    expect(getSumArrayNumber([-10, 10])).toBe(0);
  });

  it('should return the correct sum for an array with mixed positive and negative numbers', () => {
    expect(getSumArrayNumber([-5, 10, -3, 8])).toBe(10);
    expect(getSumArrayNumber([1.5, -2.5, 1])).toBe(0);
  });

  it('should return the correct sum for an array with decimal numbers', () => {
    expect(getSumArrayNumber([0.1, 0.2])).toBeCloseTo(0.3);
    expect(getSumArrayNumber([1.1, 2.2, 3.3])).toBeCloseTo(6.6);
  });

  it('should return the element itself for an array with a single number', () => {
    expect(getSumArrayNumber([5])).toBe(5);
    expect(getSumArrayNumber([-3.14])).toBe(-3.14);
  });
});