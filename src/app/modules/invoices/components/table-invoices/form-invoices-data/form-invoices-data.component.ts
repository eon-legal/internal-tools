import { Component, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
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
import { ButtonGenericInterface } from '../../../../../shared/components/button-generic/interfaces/buttons';
import { ButtonGenericComponent } from '../../../../../shared/components/button-generic/button-generic.component';

/**
 * Component for managing invoice data in a form.
 * This component is used within a dialog to add or edit invoice data.
 */
@Component({
  selector: 'app-form-invoices-data',
  standalone: true,
  imports: [FormGenericComponent, ButtonGenericComponent],
  templateUrl: './form-invoices-data.component.html',
  styleUrl: './form-invoices-data.component.scss',
})
export class FormInvoicesDataComponent {
  /** Reference to the FormGenericComponent for managing the form */
  @ViewChild('formTable') formTable!: FormGenericComponent<DataInvoicesTable>;

  /** Configuration for buttons in the dialog */
  buttons: ButtonGenericInterface = {
    css: 'flex flex-column md:flex-row md:justify-content-between gap-2',
    buttons: [
      {
        id: 1,
        icon: 'pi pi-trash',
        label: 'Cerrar',
        severity: 'danger',
        action: () => this.close(), // Action to close the dialog
      },
      {
        id: 2,
        icon: 'pi pi-check',
        label: 'Agregar',
        severity: 'primary',
        action: () => this.accept(), // Action to accept and submit the form
      },
    ],
  };

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
          validator: Validators.min(1),
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
          validator: Validators.pattern(/^(?!-)(?:\d+(?:\.\d*)?|\.\d+)?$/),
          message: 'Deben ser valores positivos', // Positive value validator
        },
      ],
    },
  ];

  /** Data passed to the dialog */
  data: any;

  /** Injected DynamicDialogRef for managing the dialog
   Injected DynamicDialogConfig for accessing dialog configuration */
  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    // Retrieve data passed to the dialog
    this.data = this.config.data;
  }

  /**
   * Closes the dialog without saving changes.
   */
  closeModal() {
    this.ref.close(null);
  }

  /**
   * Submits the form data if valid and closes the dialog.
   */
  accept() {
    if (this.formTable.getGroupForm.valid) {
      // Close the dialog and return the form data
      this.ref.close(this.formTable.getDataFormComplete());
    }
    // Mark all form fields as touched to display validation errors
    this.formTable.getGroupForm.markAllAsTouched();
  }

  /**
   * Closes the dialog without saving changes.
   */
  close() {
    this.ref.close(null);
  }

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
