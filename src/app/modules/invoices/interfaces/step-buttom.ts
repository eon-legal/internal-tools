export interface ButtonConfig {
  label: string; // Texto del botón
  icon?: string; // Ícono de PrimeIcons (opcional)
  iconPos?: 'left' | 'right'; // Posición del ícono (opcional)
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast'; // Estilo del botón (opcional)
  disabled?: boolean; // Estado deshabilitado (opcional)
  loading?: boolean; // Estado de carga (opcional)
  styleClass?: string; // Clases CSS personalizadas (opcional)
  tooltip?: string; // Tooltip (opcional)
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right'; // Posición del tooltip (opcional)
  rounded?: boolean; // Bordes redondeados (opcional)
  raised?: boolean; // Efecto elevado (opcional)
  outlined?: boolean; // Estilo delineado (opcional)
  text?: boolean; // Estilo de texto (opcional)
  size?: 'small' | 'large'; // Tamaño del botón (opcional)
  action?: () => void; // Función de acción (opcional)
}

export interface StepConfig {
  value: number;
  name: string;
  component: any;
  withOutClass?: boolean;
  buttons: ButtonConfig[];
}
