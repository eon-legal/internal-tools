import { DynamicDialogRef } from "primeng/dynamicdialog";

export type FlexibleFunction = (...args: any[]) => void;

export type FlexibleBooleanFunction = (...args: any[]) => boolean;
type AtLeastOne<T, Keys extends keyof T = keyof T> = Partial<T> &
  {
    [K in Keys]: Required<Pick<T, K>>;
  }[Keys];

export interface ButtonConfigBase {
  id: number;
  iconPos?: 'left' | 'right';
  severity?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'help'
    | 'contrast';
  disabled?: boolean;
  loading?: boolean;
  styleClass?: string;
  rounded?: boolean;
  raised?: boolean;
  outlined?: boolean;
  text?: boolean;
  size?: 'small' | 'large';
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  action?: FlexibleFunction;
  disabledDependsFunction?: FlexibleBooleanFunction;
  hideDependsFunction?: FlexibleBooleanFunction;
}

export interface ButtonConfigWithLabel extends ButtonConfigBase {
  label: string; // Label es obligatorio
  icon?: string; // Icono es opcional
}

export interface ButtonConfigWithIcon extends ButtonConfigBase {
  icon: string; // Icono es obligatorio
  label?: string; // Label es opcional
}

// Definimos el tipo ButtonConfig como una unión de ButtonConfigWithLabel y ButtonConfigWithIcon
export type ButtonConfig = AtLeastOne<
  ButtonConfigWithLabel & ButtonConfigWithIcon,
  'label' | 'icon'
>;

export type Status =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warn'
  | 'danger'
  | 'help'
  | 'contrast';

export interface FormatConfig<T extends object> {
  formatFunction?: (value: T) => string;
}

export type FormatOptions<T extends object> = {
  [K in keyof T]?: FormatConfig<T>;
};

export interface ButtonGenericInterface {
  css?: string;
  buttons?: ButtonConfig[];
}

export interface ModalRef<T = any> {
  close: (result?: any) => void;
  onClose: (callback: (result?: any) => void) => void;
  getInstance: () => T | undefined;
}

export interface ModalConfig {
  title?: string;
  width?: string;
  buttons?: ButtonGenericInterface;
  data?: any;
  closable?: boolean;
  registerInstance?: (instance: any) => void;
}