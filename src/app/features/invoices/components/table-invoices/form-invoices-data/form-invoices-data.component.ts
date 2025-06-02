import { Component, ViewChild } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { map, Observable } from 'rxjs';
import { FormGenericComponent } from '../../../../../shared/components/form-generic/form-generic.component';
import { DataInvoicesTable } from '../../../interfaces/data-invoices-table';
import { FormField } from '../../../../../shared/components/form-generic/interfaces/form-field';

/**
 * Component for managing invoice data in a form.
 * This component is used within a dialog to add or edit invoice data.
 */
@Component({
  selector: 'app-form-invoices-data',
  standalone: true,
  imports: [FormGenericComponent],
  templateUrl: './form-invoices-data.component.html',
  styleUrl: './form-invoices-data.component.scss',
})
export class FormInvoicesDataComponent {
  /** Reference to the FormGenericComponent for managing the form */
  @ViewChild('formTable') formTable!: FormGenericComponent<{
    description: string;
    perCentIva: number | string | { label: string; value: number };
    price?: number;
    qtt?: number;
    total: number;
  }>;

  /** Configuration for the form fields */
  formConfig: FormField<DataInvoicesTable>[] = [
    {
      name: 'description',
      label: 'Descripción *',
      type: 'input',
      cols: 12,
      validators: [
        { validator: Validators.required, message: 'Campo requerido.' },
      ],
    },
    {
      name: 'perCentIva',
      label: '% IVA *',
      type: 'select',
      primeNgConfig: {
        options: [
          { label: '21%', value: 21 },
          { label: '0%', value: 0 },
        ],
      },
      cols: 6,
      initialData: { label: '21%', value: 21 },
      validators: [
        { validator: Validators.required, message: 'Campo requerido.' },
      ],
    },
    {
      name: 'total',
      label: 'Total *',
      type: 'number_currency',
      cols: 6,
      validators: [
        { validator: Validators.required, message: 'Campo requerido.' },
        {
          validator: Validators.pattern(/^(?!0+$)(?!0*\.0+$)\d*\.?\d+$/),
          message: 'Deben ser valores mayores que cero',
        },
      ],
    },
    {
      name: 'qtt',
      label: 'QTT',
      type: 'decimal',
      cols: 6,
      validators: [
        {
          validator: Validators.pattern(/^(?!-)(?:\d+(?:\.\d*)?|\.\d+)?$/),
          message: 'Deben ser valores positivos', // Positive value validator
        },
      ],
    },
    {
      name: 'price',
      label: 'Precio',
      type: 'decimal',
      cols: 6,
      validators: [
        {
          validator: Validators.pattern(/^(?!0+$)(?!0*\.0+$)\d*\.?\d+$/),
          message: 'Deben ser valores positivos', // Positive value validator
        },
      ],
    },
  ];

  /**
   * Creates a custom synchronous validator.
   * @param errorMio - The error key to return if validation fails.
   * @param validationFn - The validation function to execute.
   * @returns A ValidatorFn that returns a validation error if the condition fails.
   */
  createCustomValidatorD(
    errorMio: string,
    validationFn: (value: any) => boolean
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isValid = validationFn(control.value);
      return isValid ? null : { [errorMio]: true };
    };
  }

  /**
   * Creates a custom asynchronous validator.
   * @param errorMio - The error key to return if validation fails.
   * @param validationFn - The asynchronous validation function to execute.
   * @returns An AsyncValidatorFn that returns a validation error if the condition fails.
   */
  createAsyncValidator(
    errorMio: string,
    validationFn: (value: any) => Observable<boolean>
  ): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return validationFn(control.value).pipe(
        map((isValid) => (isValid ? null : { [errorMio]: true }))
      );
    };
  }
}
