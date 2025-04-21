import { InputNumberInputEvent } from 'primeng/inputnumber';

export type NumberValidator = (event: InputNumberInputEvent) => ResultMethodValidationNumberForm
export type TextValidator = (event: Event) => ResultMethodValidationTextForm;

export interface ResultMethodValidationNumberForm {
  change: boolean;
  value?: number | null;
}

export interface ResultMethodValidationTextForm {
    change: boolean;
    value?: string;
  }