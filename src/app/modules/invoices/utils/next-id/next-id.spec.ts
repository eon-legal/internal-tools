import { getNextID } from './next-id';
import { DataInvoicesTable } from "../../interfaces/data-invoices-table";

describe('getNextID', () => {
  it('should return 1 for an empty array', () => {
    expect(getNextID([])).toBe(1);
  });

  it('should return 1 when no numeric IDs are present', () => {
    const testData = [
      { id: 'abc' } as unknown as DataInvoicesTable,
      { id: null } as unknown as DataInvoicesTable,
      { id: undefined } as unknown as DataInvoicesTable,
    ];
    expect(getNextID(testData)).toBe(1);
  });

  it('should return the correct next ID for array with numeric IDs', () => {
    const testData = [
      { id: 1 } as DataInvoicesTable,
      { id: 5 } as DataInvoicesTable,
      { id: 3 } as DataInvoicesTable,
    ];
    expect(getNextID(testData)).toBe(6);
  });

  it('should ignore non-numeric IDs when calculating next ID', () => {
    const testData = [
      { id: 10 } as DataInvoicesTable,
      { id: 'xyz' } as unknown as DataInvoicesTable,
      { id: 15 } as DataInvoicesTable,
      { id: null } as unknown as DataInvoicesTable,
    ];
    expect(getNextID(testData)).toBe(16);
  });

  it('should handle negative numbers correctly', () => {
    const testData = [
      { id: -5 } as DataInvoicesTable,
      { id: -1 } as DataInvoicesTable,
      { id: 0 } as DataInvoicesTable,
    ];
    expect(getNextID(testData)).toBe(1);
  });

  it('should work with decimal numbers (though IDs are typically integers)', () => {
    const testData = [
      { id: 1.5 } as DataInvoicesTable,
      { id: 3.2 } as DataInvoicesTable,
    ];
    expect(getNextID(testData)).toBe(4.2);
  });

  it('should return 1 when all IDs are zero', () => {
    const testData = [
      { id: 0 } as DataInvoicesTable,
      { id: 0 } as DataInvoicesTable,
    ];
    expect(getNextID(testData)).toBe(1);
  });
});