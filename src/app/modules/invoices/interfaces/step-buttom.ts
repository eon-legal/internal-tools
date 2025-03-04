export interface ButtonConfig {
  label: string;
  icon: string;
  severity:
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'help'
    | 'primary'
    | 'secondary'
    | 'contrast';
  iconPos: 'left' | 'right';
  action: (activateCallback?: Function) => void;
}

export interface StepConfig {
  value: number;
  name: string;
  component: any;
  withOutClass?: boolean;
  buttons: ButtonConfig[];
}
