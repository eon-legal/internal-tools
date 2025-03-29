export interface DataInvoicesTable {
  sTotal: number | string;
  perCentIva: number | string | { label: string; value: number };
  total: number | string;
  description: string;
  id: number | string;
  qtt?: number | string;
  price?: number | string;
  indexDelete?: number;
}
