export function getSumArrayNumber(data: number[]): number {
  return data.reduce((acc, curr) => acc + curr, 0);
}
