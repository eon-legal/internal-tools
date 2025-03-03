import { ValidatorFn, AsyncValidatorFn } from '@angular/forms';

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
  value: any;
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
  min?: number; // Para number inputs
  max?: number;
  step?: number;
};

type FieldType =
  | 'input'
  | 'dropdown'
  | 'calendar'
  | 'textarea'
  | 'checkbox'
  | 'toggle'
  | 'number'
  | 'number_currency'
  | 'number_percent'
  | 'decimal';

/**
   * validations: [
        { validator: Validators.required, message: 'Usuario requerido' },
        { validator: customValidator, message: 'No puede contener "test"' },
        { validator: asyncValidator, message: 'El usuario "admin" ya existe', async: true }
      ]
    }
  ];

  onFormSubmit(formData: any) {
  }
}


---

### *5. Validadores Personalizados (custom-validators.ts)*
typescript
import { AbstractControl, ValidationErrors } from '@angular/forms';

export function customValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value && value.includes('test')) {
    return { customError: true };
  }
  return null;
}

export function asyncValidator(control: AbstractControl): Promise<ValidationErrors | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (control.value === 'admin') {
        resolve({ usernameTaken: true });
      } else {
        resolve(null);
      }
    }, 2000);
  });
}
   */
