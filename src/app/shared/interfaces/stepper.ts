import { Status } from './buttons';

export interface StepInterface {
  css?: string;
  buttons?: {
    id: number;
    class?: string;
    label: string;
    icon: string;
    severity?: Status;
    iconPos?: 'right' | 'left';
    onClick?: Function;
  }[];
}

