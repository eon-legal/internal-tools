export interface DataInvoicesTable {
  id: string;
  description: string;
  qtt?: number | string;
  price?: number | string;
  sTotal: number | string;
  perCentIva: number | string;
  total: number | string;
  indexDelete?: number;
}
