export type FisrtForm  = {
  numberInvoice: string;
  dateOrDateRange: boolean;
  rangeDates: Date | null;
  date: Date | null;
  name: string;
  national: boolean;
  address: string;
  passport: string;
}

export type withDate = {
  numberInvoice: string;
  dateOrDateRange: boolean;
  date: Date | null;
  name: string;
  national: boolean;
  address: string;
  passport: string;
}

export type withRange = {
  numberInvoice: string;
  dateOrDateRange: boolean;
  rangeDates: Date | null;
  name: string;
  national: boolean;
  address: string;
  passport: string;
}