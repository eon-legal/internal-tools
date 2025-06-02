import { mapAtrribute } from './mapeo';

describe('mapAtrribute', () => {
  interface TestObject {
    id: number;
    name: string;
    price: number;
    active: boolean;
    quantity?: number;
  }

  const testData: TestObject[] = [
    { id: 1, name: 'Item 1', price: 10.99, active: true },
    { id: 2, name: 'Item 2', price: 20.50, active: false },
    { id: 3, name: 'Item 3', price: 0, active: true },
    { id: 4, name: 'Item 4', price: -5.25, active: false },
  ];

  it('should correctly map numeric attributes', () => {
    expect(mapAtrribute(testData, 'id')).toEqual([1, 2, 3, 4]);
    expect(mapAtrribute(testData, 'price')).toEqual([10.99, 20.50, 0, -5.25]);
  });

  it('should return 0 for non-numeric attributes', () => {
    expect(mapAtrribute(testData, 'name')).toEqual([0, 0, 0, 0]);
    expect(mapAtrribute(testData, 'active')).toEqual([0, 0, 0, 0]);
  });

  it('should handle empty arrays', () => {
    expect(mapAtrribute([], 'id')).toEqual([]);
  });

  it('should handle optional numeric attributes (undefined case)', () => {
    expect(mapAtrribute(testData, 'quantity')).toEqual([0, 0, 0, 0]);
  });

  it('should handle edge cases for numeric values', () => {
    const edgeCases: TestObject[] = [
      { id: Infinity, name: 'Inf', price: -Infinity, active: true },
      { id: NaN, name: 'NaN', price: 0, active: false },
    ];
    expect(mapAtrribute(edgeCases, 'id')).toEqual([Infinity, NaN]);
    expect(mapAtrribute(edgeCases, 'price')).toEqual([-Infinity, 0]);
  });

  it('should work with custom object types', () => {
    interface CustomObject {
      value: number;
      text: string;
    }
    const customData: CustomObject[] = [
      { value: 100, text: 'hundred' },
      { value: 200, text: 'two hundred' },
    ];
    expect(mapAtrribute(customData, 'value')).toEqual([100, 200]);
    expect(mapAtrribute(customData, 'text')).toEqual([0, 0]);
  });
});