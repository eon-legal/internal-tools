export function filterFiles(array1: File[], array2: File[]): File[] {
  const fileNamesInArray1: { [key: string]: boolean } = {};
  for (const file of array1) {
    fileNamesInArray1[file.name] = true;
  }
  return array2.filter((file) => fileNamesInArray1[file.name]);
}
