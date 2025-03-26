import { DataInvoicesTable } from "../../interfaces/data-invoices-table";


/**
 * Calculates the next available ID for an array of objects based on their `id` property.
 * 
 * This function is designed to work with an array of objects that have an `id` property.
 * It extracts all `id` values, filters out non-numeric IDs, and calculates the next available ID
 * by incrementing the maximum numeric ID found in the array.
 * 
 * If no numeric IDs are found, it returns `1` as the default starting ID.
 * 
 * @param {DataInvoicesTable[]} arrayDeObjetos - An array of objects with an `id` property.
 * @returns {number} - The next available ID (maximum ID + 1) or `1` if no numeric IDs are found.
 */
export function getNextID(arrayDeObjetos: DataInvoicesTable[]): number {
  // Extract and filter numeric IDs from the array of objects
  const idsNumericos = arrayDeObjetos
    .map((obj) => obj.id) // Extract the `id` property from each object
    .filter((id) => typeof id === 'number'); // Filter out non-numeric IDs

  // If no numeric IDs are found, return 1 as the default starting ID
  if (idsNumericos.length === 0) {
    return 1;
  }

  // Find the maximum numeric ID in the filtered array
  const maxId = Math.max(...idsNumericos);

  // Return the next available ID (maximum ID + 1)
  return maxId + 1;
}