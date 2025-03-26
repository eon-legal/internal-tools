import { AbstractControl, FormControl } from '@angular/forms';
import { dateRangeValidator, noOneDateValidator } from './date-range-validator';

describe('dateRangeValidator', () => {
  let control: AbstractControl;

  beforeEach(() => {
    control = new FormControl();
  });

  it('should return null when dates are valid (start < end)', () => {
    const startDate = new Date(2023, 0, 1);
    const endDate = new Date(2023, 0, 2);
    control.setValue([startDate, endDate]);
    expect(dateRangeValidator(control)).toBeNull();
  });

  it('should return error when start date >= end date', () => {
    const sameDate = new Date(2023, 0, 1);
    control.setValue([sameDate, sameDate]);
    expect(dateRangeValidator(control)).toEqual({ dateRangeValidator: true });

    const startDate = new Date(2023, 0, 2);
    const endDate = new Date(2023, 0, 1);
    control.setValue([startDate, endDate]);
    expect(dateRangeValidator(control)).toEqual({ dateRangeValidator: true });
  });

  it('should return null when array is not length 2', () => {
    control.setValue([]);
    expect(dateRangeValidator(control)).toBeNull();

    control.setValue([new Date()]);
    expect(dateRangeValidator(control)).toBeNull();

    control.setValue([new Date(), new Date(), new Date()]);
    expect(dateRangeValidator(control)).toBeNull();
  });

  it('should return null when either date is null', () => {
    control.setValue([null, new Date()]);
    expect(dateRangeValidator(control)).toBeNull();

    control.setValue([new Date(), null]);
    expect(dateRangeValidator(control)).toBeNull();

    control.setValue([null, null]);
    expect(dateRangeValidator(control)).toBeNull();
  });
});

describe('noOneDateValidator', () => {
  let control: AbstractControl;

  beforeEach(() => {
    control = new FormControl();
  });

  it('should return null for empty array or null/undefined', () => {
    control.setValue([]);
    expect(noOneDateValidator(control)).toBeNull();

    control.setValue(null);
    expect(noOneDateValidator(control)).toBeNull();

    control.setValue(undefined);
    expect(noOneDateValidator(control)).toBeNull();
  });

  it('should return error when exactly one date is provided', () => {
    control.setValue([new Date()]);
    expect(noOneDateValidator(control)).toEqual({ noOneDateValidator: true });
  });

  it('should return null when two valid dates are provided', () => {
    const startDate = new Date(2023, 0, 1);
    const endDate = new Date(2023, 0, 2);
    control.setValue([startDate, endDate]);
    expect(noOneDateValidator(control)).toBeNull();
  });

  it('should return error when one of two dates is null', () => {
    control.setValue([new Date(), null]);
    expect(noOneDateValidator(control)).toEqual({ noOneDateValidator: true });

    control.setValue([null, new Date()]);
    expect(noOneDateValidator(control)).toEqual({ noOneDateValidator: true });

    control.setValue([null, null]);
    expect(noOneDateValidator(control)).toEqual({ noOneDateValidator: true });
  });

  it('should return null for more than two dates', () => {
    control.setValue([new Date(), new Date(), new Date()]);
    expect(noOneDateValidator(control)).toBeNull();
  });
});