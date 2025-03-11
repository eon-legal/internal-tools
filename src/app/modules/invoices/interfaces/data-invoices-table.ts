export interface DataInvoicesTable {
  id: number | string;
  description: string;
  qtt?: number | string;
  price?: number | string;
  sTotal: number | string;
  perCentIva: number | string | { label: string; value: number };
  total: number | string;
  indexDelete?: number;
}
