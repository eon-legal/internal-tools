/**
 * Maps an array of objects to an array of numbers based on a specified attribute.
 * 
 * This function takes an array of objects and extracts the value of a specified attribute from each object.
 * If the attribute value is a number, it includes that number in the resulting array.
 * If the attribute value is not a number (e.g., a string, boolean, etc.), it includes `0` in the resulting array.
 * 
 * @template T - The type of objects in the input array.
 * @param {T[]} arrayDeObjetos - The array of objects to process.
 * @param {keyof T} attribute - The attribute (key) of the objects to extract values from.
 * @returns {number[]} - An array of numbers derived from the specified attribute values.
 */
export function mapAtrribute<T>(
  arrayDeObjetos: T[],
  attribute: keyof T
): number[] {
  // Use the `map` function to iterate over each object in the array
  const final = arrayDeObjetos.map((objeto) => {
    // Get the value of the specified attribute
    const valor = objeto[attribute];

    // If the value is a number, return it; otherwise, return 0
    return typeof valor === 'number' ? valor : 0;
  });

  // Return the resulting array of numbers
  return final;
}