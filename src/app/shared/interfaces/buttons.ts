export type Status =
  | 'success'
  | 'info'
  | 'warn'
  | 'danger'
  | 'help'
  | 'primary'
  | 'secondary'
  | 'contrast';


interface ButtonOperationLabel<T extends object> {
  label: string;
  icon?: string;
  severity: Status;
  action: (row: T) => void;
  disabledDependsFunction?: (item: T) => boolean;
  disabled?: boolean;
  hideDependsFunction?: (item: T) => boolean;
}

interface ButtonOperationIcon<T extends object> {
  label?: string;
  icon: string;
  severity: Status;
  action: (row: T) => void;
  disabledDependsFunction?: (item: T) => boolean;
  disabled?: boolean;
  hideDependsFunction?: (item: T) => boolean;
}

interface ButtonOperationLabelIcon<T extends object> {
  label: string;
  icon: string;
  severity: Status;
  action: (row: T) => void;
  disabledDependsFunction?: (item: T) => boolean;
  disabled?: boolean;
  hideDependsFunction?: (item: T) => boolean;
}

export type ButtonOperation<T extends object> =
  | ButtonOperationLabel<T>
  | ButtonOperationLabelIcon<T>
  | ButtonOperationIcon<T>;


  export interface FormatConfig<T extends object> {
    formatFunction?: (value: T) => string;
  }
  
  export type FormatOptions<T extends object> = {
    [K in keyof T]?: FormatConfig<T>;
  };