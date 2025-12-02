/** Identification document types for the sender */
export type IdentificationType = 'DNI' | 'NIE' | 'Passport' | 'CIF';

export type FisrtForm  = {
  numberInvoice: string;
  date: Date | null;
  name: string;
  identificationType: IdentificationType;
  identification: string;
}