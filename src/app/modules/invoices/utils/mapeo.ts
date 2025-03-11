export function mapAtrribute<T>(
  arrayDeObjetos: T[],
  attribute: keyof T
): number[] {
  const final = arrayDeObjetos.map((objeto) => {
    // Obtener el valor del atributo
    const valor = objeto[attribute];

    // Si el valor es de tipo string, devolver 0; si es number, devolver el valor
    return typeof valor === 'number' ? valor : 0;
  });
  return final;
}
