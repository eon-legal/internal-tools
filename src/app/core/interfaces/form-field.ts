export interface FormField {
  name: string;
  label: string;
  type: 'input' | 'dropdown' | 'calendar' | 'textarea' | 'checkbox' | 'toggle' | 'number' | 'number_currency' | 'number_percent';
  validators?: any[];
  primeNgConfig?: {
    rows?: number;
    dateFormat?: string;
    optionLabel?: string;
    placeholder?: string;
    options?: any[];
    selectionMode?: selectionMode;
  };
  cols?: number; // Columnas que ocupa (1-12)
  showComponent?: boolean;
  initialData?: any;
  disabled?: boolean;
}

type selectionMode = 'single' | 'multiple' | 'range';
