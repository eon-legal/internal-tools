/*export interface SecondForm {
  id?: string;
  chooseDestination?: {label: string; value: string};
  nameDestination: string;
  accountDestination: string;
  addressDestination: string;
  nameBank: string;
  addressBank: string;
  nif: string;
}*/

/** Interface base con los campos comunes (sin id ni chooseDestination) */
export interface DestinationBase {
  nameDestination: string;
  accountDestination: string;
  addressDestination: string;
  nameBank: string;
  addressBank: string;
  nif: string;
}

/** Interface extendida que incluye todos los campos */
export interface SecondForm extends DestinationBase {
  id?: string;
  chooseDestination?: { label: string; value: string };
}

/** Interface extendida que incluye todos los campos */
export interface DestinationBDReal extends DestinationBase {
  id: string;
}
