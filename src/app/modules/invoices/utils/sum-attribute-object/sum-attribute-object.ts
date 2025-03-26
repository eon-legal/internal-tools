/**
 * Calculates the sum of all numbers in an array.
 * 
 * This function takes an array of numbers and returns the sum of all its elements.
 * It uses the `reduce` method to accumulate the total sum, starting from an initial value of `0`.
 * 
 * @param {number[]} data - An array of numbers to sum.
 * @returns {number} - The sum of all numbers in the array.
 */
export function getSumArrayNumber(data: number[]): number {
  // Use the `reduce` method to accumulate the sum of the array elements
  return data.reduce((acc, curr) => acc + curr, 0);
}
