import { formatDateByParams, simpleformatDate } from './format-date';

describe('simpleformatDate', () => {
  it('should format single-digit day and month with leading zeros', () => {
    const date = new Date(2023, 0, 5); // January 5, 2023
    expect(simpleformatDate(date)).toBe('05-01-2023');
  });

  it('should format double-digit day and month without leading zeros', () => {
    const date = new Date(2023, 9, 15); // October 15, 2023
    expect(simpleformatDate(date)).toBe('15-10-2023');
  });

  it('should handle February 29th on a leap year', () => {
    const date = new Date(2024, 1, 29); // February 29, 2024
    expect(simpleformatDate(date)).toBe('29-02-2024');
  });

  it('should handle the last day of the year', () => {
    const date = new Date(2023, 11, 31); // December 31, 2023
    expect(simpleformatDate(date)).toBe('31-12-2023');
  });
});

describe('formatDateByParams', () => {
  it('should format a single date correctly', () => {
    const date = new Date(2023, 5, 10); // June 10, 2023
    expect(formatDateByParams(date)).toBe('10-06-2023');
  });

  it('should format a date range correctly', () => {
    const startDate = new Date(2023, 0, 1); // January 1, 2023
    const endDate = new Date(2023, 11, 31); // December 31, 2023
    expect(formatDateByParams([startDate, endDate])).toBe('01-01-2023 - 31-12-2023');
  });

  it('should handle single-digit dates in range formatting', () => {
    const startDate = new Date(2023, 0, 1); // January 1, 2023
    const endDate = new Date(2023, 1, 5); // February 5, 2023
    expect(formatDateByParams([startDate, endDate])).toBe('01-01-2023 - 05-02-2023');
  });

  it('should handle the same date for start and end', () => {
    const date = new Date(2023, 3, 15); // April 15, 2023
    expect(formatDateByParams([date, date])).toBe('15-04-2023 - 15-04-2023');
  });

  it('should handle invalid dates by returning "Invalid Date"', () => {
    const invalidDate = new Date('invalid');
    expect(formatDateByParams(invalidDate)).toBe('Invalid Date');
    expect(formatDateByParams([invalidDate, invalidDate])).toBe('Invalid Date - Invalid Date');
  });
});