import { ValidatorFn, AsyncValidatorFn, FormControl } from '@angular/forms';

export interface FormValidation {
  validator: ValidatorFn | AsyncValidatorFn; // Tipado fuerte para validadores
  message: string;
  params?: { [key: string]: any }; // Parámetros opcionales para validadores
  async?: boolean; // Indicador de validador asíncrono
}
export type ValidatorName =
  | 'required'
  | 'email'
  | 'minlength'
  | 'min'
  | 'pattern'
  | 'customError'
  | 'usernameTaken'
  | 'maxlength'
  | 'max';

export interface FormField<T> {
  name: Extract<keyof T, string>;
  label: string;
  type: FieldType;
  validators?: FormValidation[];
  primeNgConfig?: PrimeNgConfig;
  cols?: columns;
  showComponent?: boolean;
  initialData?: any;
  disabled?: boolean;
}

type selectionMode = 'single' | 'multiple' | 'range';
type columns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

type DropdownOption = {
  label: string;
  value: string | number | Date;
  disabled?: boolean;
};

// Para configuraciones específicas de PrimeNG
type PrimeNgConfig = {
  rows?: number;
  dateFormat?: string;
  optionLabel?: string;
  placeholder?: string;
  options?: DropdownOption[]; // Usar tipo específico
  selectionMode?: selectionMode;
  step?: number;
  fileOptions?: {
    accept?: string[];
    uploadIcon?: string;
    styleClass?: string;
    auto?: boolean;
    multiple?: boolean;
    chooseLabel?: string;
    uploadLabel?: string;
    cancelLabel?: string;
    noFooter?: boolean;
    uploadHandler?: (files?: File[], fieldName?: string) => void; // Función de subida
    onSelectHandler?: (files: File[], fieldName: string) => void; // Nuevo manejador de selecció
  };
};

export type FieldType =
  | 'input'
  | 'select'
  | 'calendar'
  | 'textarea'
  | 'checkbox'
  | 'toggle'
  | 'number'
  | 'number_currency'
  | 'number_percent'
  | 'decimal'
  | 'file';
