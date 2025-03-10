import { Component, inject, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { delay, map, Observable, of } from 'rxjs';
import { FormGenericComponent } from '../../../../../shared/components/form-generic/form-generic.component';
import { DataInvoicesTable } from '../../../interfaces/data-invoices-table';
import { FormField } from '../../../../../shared/interfaces/form-field';
import { ButtonGenericInterface } from '../../../../../shared/interfaces/buttons';
import { ButtonGenericComponent } from '../../../../../shared/components/button-generic/button-generic.component';

@Component({
  selector: 'app-form-invoices-data',
  standalone: true,
  imports: [FormGenericComponent, ButtonGenericComponent],
  templateUrl: './form-invoices-data.component.html',
  styleUrl: './form-invoices-data.component.scss',
})
export class FormInvoicesDataComponent {
  @ViewChild('formTable') formTable!: FormGenericComponent<DataInvoicesTable>;
  buttons: ButtonGenericInterface = {
    css: 'flex flex-column md:flex-row md:justify-content-between gap-2',
    buttons: [
      {
        id: 1,
        icon: 'pi pi-trash',
        label: 'Cerrar',
        severity: 'danger',
        action: () => this.close(),
      },
      {
        id: 2,
        icon: 'pi pi-check',
        label: 'Agregar',
        severity: 'primary',
        action: () => this.accept(),
      },
    ],
  };
  formConfig: FormField<DataInvoicesTable>[] = [
    {
      name: 'description',
      label: 'Descripción *',
      type: 'input',
      cols: 12,
      validators: [
        { validator: Validators.required, message: 'Campo requerido.' },
        /* { 
          validator: this.createCustomValidatorD('customErrorTito', (value: string) => !value?.includes('test')), 
          message: 'El nombre de usuario no puede contener "test".' 
        },*/
        /*{
          validator: this.createAsyncValidator(
            'createAsyncValidator',
            (value: string) => of(value !== 'admin').pipe(delay(2000)) // Simula una validación asíncrona
          ),
          message: 'El nombre de usuario "admin" ya está en uso.',
          async: true,
        },*/
      ],
    },
    {
      name: 'id',
      label: 'ID *',
      type: 'input',
      cols: 6,
      validators: [
        { validator: Validators.required, message: 'Campo requerido.' },
      ],
    },
    {
      name: 'qtt',
      label: 'QTT',
      type: 'decimal',
      primeNgConfig: {
        min: 0
      },
      cols: 6,
      validators: [
        {
          validator: Validators.pattern(/^(?!-)(?:\d+(?:\.\d*)?|\.\d+)?$/),
          message: 'Deben ser valores positivos',
        },
      ],
    },
    {
      name: 'price',
      label: 'Precio',
      type: 'decimal',
      primeNgConfig: {
        min: 0
      },
      cols: 6,
      validators: [
        {
          validator: Validators.pattern(/^(?!-)(?:\d+(?:\.\d*)?|\.\d+)?$/),
          message: 'Deben ser valores positivos',
        },
      ],
    },
    {
      name: 'sTotal',
      label: 'S.Total *',
      type: 'number_currency',
      primeNgConfig: {
        min: 0
      },
      cols: 6,
      initialData: 0,
      validators: [
        { validator: Validators.required, message: 'Campo requerido.' },
        {
          validator: Validators.min(0),
          message: 'Deben ser valores positivos',
        },
      ],
    },
    {
      name: 'perCentIva',
      label: '% IVA *',
      type: 'number_percent',
      cols: 6,
      initialData: 0,
      validators: [
        { validator: Validators.required, message: 'Campo requerido.' },
        {
          validator: Validators.pattern(
            /^(100(\.0{1,2})?$|^([0-9]{1,2})(\.[0-9]{1,2})?$)/
          ),
          message: 'Solos valores comprendidos entre 0 - 100',
        },
      ],
    },
    {
      name: 'total',
      label: 'Total *',
      type: 'number_currency',
      primeNgConfig: {
        min: 0
      },
      cols: 6,
      initialData: 0,
      validators: [
        { validator: Validators.required, message: 'Campo requerido.' },
        {
          validator: Validators.min(0),
          message: 'Deben ser valores positivos',
        },
      ],
    },
  ];
  //ref: DynamicDialogRef<DataInvoicesTable | null> = inject(DynamicDialogRef);
  //config: DynamicDialogConfig = inject(DynamicDialogConfig);
  data: any;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    // Recibir datos del modal
    this.data = this.config.data;
  }

  // Método para cerrar el modal
  closeModal() {
    this.ref.close(null);
  }
  accept() {
    if (this.formTable.formValid()) {
      this.ref.close(this.formTable.getDataFormComplete());
    }
    this.formTable.doMarkField();
  }
  close() {
    this.ref.close(null);
  }
  // Validador sincrónico personalizado
  createCustomValidatorD(
    errorMio: string,
    validationFn: (value: any) => boolean
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isValid = validationFn(control.value);
      return isValid ? null : { [errorMio]: true };
    };
  }

  // Validador asíncrono personalizado
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

  //asignarCountsUltraOptimo<T extends { count?: number }>(arr: T[]): (T & { count: number })[] {
}
