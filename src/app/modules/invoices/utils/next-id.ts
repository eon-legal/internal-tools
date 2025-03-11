import { DataInvoicesTable } from '../interfaces/data-invoices-table';

export function getNextID(arrayDeObjetos: DataInvoicesTable[]): number {
  // Filtramos los IDs que son números
  const idsNumericos = arrayDeObjetos
    .map((obj) => obj.id)
    .filter((id) => typeof id === 'number');

  // Si no hay IDs numéricos, devolvemos 1
  if (idsNumericos.length === 0) {
    return 1;
  }

  // Encontramos el máximo ID numérico
  const maxId = Math.max(...idsNumericos);

  // Devolvemos el siguiente ID
  return maxId + 1;
}
