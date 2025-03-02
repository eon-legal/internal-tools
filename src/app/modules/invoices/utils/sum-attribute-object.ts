export function getSumAttribute<T>(object: T[], attribute: keyof T): number {
  return object.reduce((total: number, item: T) => {
    const valor = item[attribute] as unknown;
    return total + (typeof valor === 'number' ? valor : 0);
  }, 0);
}
